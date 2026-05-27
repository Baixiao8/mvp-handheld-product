/**
 * API Client · 统一封装
 *
 * 通过 ENV.useMock 区分 MSW(开发)/ 真实 backend(联调)
 * 切真实 backend = 改 .env.local · 前端代码 0 改动
 */
import { ENV } from '@/config/env';
import { ErrorCode, ERROR_MESSAGES, type ApiErrorResponse } from '@/types';

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

/**
 * @TODO auth: 接千图AI 实际鉴权机制(JWT in header / cookie)
 */
function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('qiantu_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = `${ENV.apiBaseUrl}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(init.headers as Record<string, string> | undefined),
  };

  let resp: Response;
  try {
    resp = await fetch(url, { ...init, headers });
  } catch {
    throw new HandheldApiError('NETWORK_ERROR', '网络异常,请检查后重试');
  }

  let json: unknown;
  try {
    json = await resp.json();
  } catch {
    throw new HandheldApiError('NETWORK_ERROR', '响应解析失败', resp.status);
  }

  // 业务错误码
  if (json && typeof json === 'object' && 'code' in json) {
    const code = (json as { code: number }).code;
    if (code !== ErrorCode.SUCCESS) {
      const errResp = json as ApiErrorResponse;
      throw new HandheldApiError(
        code as ErrorCode,
        ERROR_MESSAGES[code as ErrorCode] || errResp.message,
        resp.status,
      );
    }
  }

  return json as T;
}
