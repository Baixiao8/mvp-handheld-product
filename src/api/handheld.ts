/**
 * 手持商品 5 个 API · 与 prd.md § 5 一一对应
 */
import { request, HandheldApiError } from './client';
import { ENV } from '@/config/env';
import {
  type GetModelsResponse,
  type GenerateRequest,
  type GenerateResponse,
  type GetResultResponse,
  type GetQuotaResponse,
  type UploadResponse,
  type TaskResult,
  type TaskStatus,
  ErrorCode,
  ERROR_MESSAGES,
} from '@/types';

/** API-1 · 获取模特列表 */
export async function getModels() {
  const resp = await request<GetModelsResponse>('/models');
  return resp.data;
}

/** API-2 · 提交生成任务 */
export async function submitGenerate(payload: GenerateRequest) {
  const resp = await request<GenerateResponse>('/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return resp.data;
}

/** API-3 · 查询任务结果(单次) */
export async function getResult(taskId: string): Promise<TaskResult> {
  const resp = await request<GetResultResponse>(`/result/${taskId}`);
  return resp.data;
}

/** API-3 · 轮询封装 */
export interface PollOptions {
  intervalMs?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
  onProgress?: (result: TaskResult) => void;
}

export async function pollResult(taskId: string, options: PollOptions = {}): Promise<TaskResult> {
  const { intervalMs = 1000, timeoutMs = 60_000, signal, onProgress } = options;
  const startTime = Date.now();
  const TERMINAL: TaskStatus[] = ['success', 'failed', 'cancelled'];

  while (true) {
    if (signal?.aborted) throw new HandheldApiError('CLIENT_ABORT', '已取消');
    if (Date.now() - startTime > timeoutMs) {
      throw new HandheldApiError(ErrorCode.ALGO_TIMEOUT, ERROR_MESSAGES[ErrorCode.ALGO_TIMEOUT]);
    }
    const result = await getResult(taskId);
    onProgress?.(result);
    if (TERMINAL.includes(result.status)) return result;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

/** API-4 · 查询算力余额 */
export async function getQuota() {
  const resp = await request<GetQuotaResponse>('/quota');
  return resp.data;
}

/** API-5 · 上传商品图(multipart) */
export async function uploadProductImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('qiantu_token');
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const resp = await fetch(`${ENV.apiBaseUrl}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!resp.ok) {
    throw new HandheldApiError('NETWORK_ERROR', '上传失败,请重试', resp.status);
  }
  const json = (await resp.json()) as UploadResponse;
  return json.data;
}

/** Composed · 提交 + 轮询直到终态 */
export async function generateAndWait(payload: GenerateRequest, options: PollOptions = {}) {
  const { taskId } = await submitGenerate(payload);
  const result = await pollResult(taskId, options);
  if (result.status === 'failed') {
    throw new HandheldApiError(
      result.errorCode ?? ErrorCode.ALGO_ERROR,
      result.errorMessage ?? ERROR_MESSAGES[ErrorCode.ALGO_ERROR],
    );
  }
  return result;
}
