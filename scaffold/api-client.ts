/**
 * 手持商品 MVP · API Client
 *
 * 5 个 API endpoint 的统一封装。包含:
 * - 鉴权 header 自动注入
 * - 错误码统一处理
 * - 任务结果轮询逻辑
 * - 超时与重试
 *
 * @see prd.md § 5
 */

import {
  GetModelsResponse,
  GenerateRequest,
  GenerateResponse,
  GetResultResponse,
  GetQuotaResponse,
  UploadResponse,
  TaskResult,
  TaskStatus,
  ErrorCode,
  ApiErrorResponse,
  ERROR_MESSAGES,
} from '../types';

// @TODO BASE_URL: 替换成千图AI 实际 API 网关
const BASE_URL = process.env.API_BASE_URL || 'https://api.qiantu.ai/v1/handheld';

// @TODO auth: 千图AI 实际鉴权方式(JWT header / Cookie)
function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('qiantu_token'); // 占位
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** API 调用通用错误 */
export class HandheldApiError extends Error {
  constructor(
    public code: ErrorCode | 'NETWORK_ERROR' | 'CLIENT_ABORT',
    public userMessage: string,
    public httpStatus?: number,
  ) {
    super(userMessage);
    this.name = 'HandheldApiError';
  }
}

/** 通用 fetch 封装,自动注入鉴权 + 错误码处理 */
async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(init.headers as Record<string, string> | undefined),
  };

  let resp: Response;
  try {
    resp = await fetch(url, { ...init, headers });
  } catch (err) {
    throw new HandheldApiError(
      'NETWORK_ERROR',
      '网络异常,请检查后重试',
    );
  }

  const json = (await resp.json()) as T | ApiErrorResponse;

  // 业务错误码
  if ('code' in json && (json as ApiErrorResponse).code !== ErrorCode.SUCCESS) {
    const errResp = json as ApiErrorResponse;
    throw new HandheldApiError(
      errResp.code,
      ERROR_MESSAGES[errResp.code] || errResp.message,
      resp.status,
    );
  }

  return json as T;
}

// ============================================================
// API-1 · 获取模特列表
// ============================================================

export async function getModels(): Promise<GetModelsResponse['data']> {
  const resp = await request<GetModelsResponse>('/models', { method: 'GET' });
  return resp.data;
}

// ============================================================
// API-2 · 提交生成任务
// ============================================================

export async function submitGenerate(
  payload: GenerateRequest,
): Promise<GenerateResponse['data']> {
  const resp = await request<GenerateResponse>('/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return resp.data;
}

// ============================================================
// API-3 · 查询任务结果(单次查询)
// ============================================================

export async function getResult(taskId: string): Promise<TaskResult> {
  const resp = await request<GetResultResponse>(`/result/${taskId}`, {
    method: 'GET',
  });
  return resp.data;
}

// ============================================================
// API-3 · 轮询封装(自动循环 + 超时 + 取消)
// ============================================================

export interface PollOptions {
  /** 轮询间隔,默认 1000ms */
  intervalMs?: number;
  /** 总超时,默认 60000ms(对齐 PRD SLA) */
  timeoutMs?: number;
  /** 取消信号 */
  signal?: AbortSignal;
  /** 每次轮询回调,用于更新 UI 进度 */
  onProgress?: (result: TaskResult) => void;
}

export async function pollResult(
  taskId: string,
  options: PollOptions = {},
): Promise<TaskResult> {
  const {
    intervalMs = 1000,
    timeoutMs = 60000,
    signal,
    onProgress,
  } = options;

  const startTime = Date.now();
  const TERMINAL_STATUS: TaskStatus[] = ['success', 'failed', 'cancelled'];

  while (true) {
    if (signal?.aborted) {
      throw new HandheldApiError('CLIENT_ABORT', '已取消');
    }
    if (Date.now() - startTime > timeoutMs) {
      throw new HandheldApiError(
        ErrorCode.ALGO_TIMEOUT,
        ERROR_MESSAGES[ErrorCode.ALGO_TIMEOUT],
      );
    }

    const result = await getResult(taskId);
    onProgress?.(result);

    if (TERMINAL_STATUS.includes(result.status)) {
      return result;
    }

    await sleep(intervalMs);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ============================================================
// API-4 · 查询算力余额
// ============================================================

export async function getQuota(): Promise<GetQuotaResponse['data']> {
  const resp = await request<GetQuotaResponse>('/quota', { method: 'GET' });
  return resp.data;
}

// ============================================================
// API-5 · 上传商品图(如复用现有上传接口,本方法可删)
// ============================================================

export async function uploadProductImage(file: File): Promise<UploadResponse['data']> {
  const formData = new FormData();
  formData.append('file', file);

  // @TODO auth: 鉴权 header 处理 — multipart 上传时不能 set Content-Type
  const headers = { ...getAuthHeader() };

  const resp = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!resp.ok) {
    throw new HandheldApiError(
      'NETWORK_ERROR',
      '上传失败,请重试',
      resp.status,
    );
  }

  const json = (await resp.json()) as UploadResponse | ApiErrorResponse;

  if ('code' in json && (json as ApiErrorResponse).code !== ErrorCode.SUCCESS) {
    const errResp = json as ApiErrorResponse;
    throw new HandheldApiError(
      errResp.code,
      ERROR_MESSAGES[errResp.code] || errResp.message,
    );
  }

  return (json as UploadResponse).data;
}

// ============================================================
// 组合:提交 + 轮询(给业务层一站式使用)
// ============================================================

export interface GenerateAndWaitOptions extends PollOptions {}

export async function generateAndWait(
  payload: GenerateRequest,
  options: GenerateAndWaitOptions = {},
): Promise<TaskResult> {
  // 1. 提交
  const { taskId } = await submitGenerate(payload);

  // 2. 轮询直到终态
  const result = await pollResult(taskId, options);

  // 3. 失败抛错(便于业务层 try/catch)
  if (result.status === 'failed') {
    throw new HandheldApiError(
      result.errorCode ?? ErrorCode.ALGO_ERROR,
      result.errorMessage ?? ERROR_MESSAGES[ErrorCode.ALGO_ERROR],
    );
  }

  return result;
}
