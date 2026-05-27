/**
 * 手持商品 MVP · TypeScript 类型定义
 *
 * 与 prd.md § 5(接口规范)和 § 6(埋点规范)完全对齐
 */

// ============================================================
// API-1 · 获取模特列表
// ============================================================

export type Gender = 'female' | 'male';
export type Ethnicity = 'asian' | 'western' | 'other';
export type Pose = 'holding_front';

export interface ModelInfo {
  id: string;
  name: string;
  thumbnailUrl: string;
  previewUrl: string;
  gender: Gender;
  ethnicity: Ethnicity;
  pose: Pose;
  isDefault: boolean;
  order: number;
}

export interface GetModelsResponse {
  code: 0;
  data: {
    models: ModelInfo[];
  };
}

// ============================================================
// API-2 · 提交生成任务
// ============================================================

export type AspectRatio = '1:1' | '3:4' | '2:3';

export interface AdvancedOptions {
  hdEnhance: boolean;
}

export interface GenerateRequest {
  productImageUrl: string;
  modelId: string;
  aspectRatio: AspectRatio;
  advanced?: AdvancedOptions;
}

export interface GenerateResponse {
  code: 0;
  data: {
    taskId: string;
    estimatedSeconds: number;
    cost: number;
  };
}

// ============================================================
// API-3 · 查询任务结果
// ============================================================

export type TaskStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';

export interface TaskResult {
  taskId: string;
  status: TaskStatus;
  progress: number;
  resultUrl?: string;
  createdAt: number;
  completedAt?: number;
  cost: number;
  refunded: boolean;
  errorCode?: ErrorCode;
  errorMessage?: string;
}

export interface GetResultResponse {
  code: 0;
  data: TaskResult;
}

// ============================================================
// API-4 · 查询算力余额
// ============================================================

export interface QuotaInfo {
  currentBalance: number;
  costPerGeneration: number;
  costHdEnhance: number;
  sufficient: boolean;
}

export interface GetQuotaResponse {
  code: 0;
  data: QuotaInfo;
}

// ============================================================
// API-5 · 上传商品图
// ============================================================

export interface UploadResponse {
  code: 0;
  data: {
    url: string;
    expireAt: number;
  };
}

// ============================================================
// 错误码 · 与 prd.md § 5 完全对齐
// ============================================================

export enum ErrorCode {
  SUCCESS = 0,
  INVALID_PARAMS = 40001,
  UNSUPPORTED_FORMAT = 40002,
  UNAUTHORIZED = 40101,
  QUOTA_INSUFFICIENT = 40301,
  CONCURRENT_LIMIT = 40901,
  ALGO_ERROR = 50001,
  ALGO_TIMEOUT = 50002,
}

export interface ApiErrorResponse {
  code: Exclude<ErrorCode, ErrorCode.SUCCESS>;
  message: string;
  data?: null;
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.SUCCESS]: '',
  [ErrorCode.INVALID_PARAMS]: '参数错误,请重试',
  [ErrorCode.UNSUPPORTED_FORMAT]: '不支持的图片格式,请上传 JPG / PNG / WEBP',
  [ErrorCode.UNAUTHORIZED]: '请先登录',
  [ErrorCode.QUOTA_INSUFFICIENT]: '算力不足,请充值',
  [ErrorCode.CONCURRENT_LIMIT]: '上一个还在生成中,稍后再试',
  [ErrorCode.ALGO_ERROR]: '生成失败,已退还算力,请重试',
  [ErrorCode.ALGO_TIMEOUT]: '生成超时,已退还算力,请重试',
};

// ============================================================
// 上传约束
// ============================================================

export const UPLOAD_CONSTRAINTS = {
  maxSizeMB: 10,
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'] as const,
  minDimensionPx: 512,
  maxDimensionPx: 2048,
} as const;

// ============================================================
// 埋点事件(12 个)
// ============================================================

export type EventName =
  | 'handheld_entry_view'
  | 'handheld_tab_click'
  | 'handheld_upload_start'
  | 'handheld_upload_success'
  | 'handheld_upload_fail'
  | 'handheld_model_select'
  | 'handheld_advanced_expand'
  | 'handheld_generate_click'
  | 'handheld_generate_success'
  | 'handheld_generate_fail'
  | 'handheld_download'
  | 'handheld_regenerate'
  | 'handheld_feedback';

export type UserType = 'ecommerce' | 'creator' | 'other';

export interface BaseEventProps {
  userId: string;
  userType: UserType;
  sessionId: string;
}

export interface UploadFailProps extends BaseEventProps {
  errorCode: ErrorCode | 'NETWORK_ERROR' | 'CLIENT_ABORT';
  errorMessage: string;
}

export interface GenerateClickProps extends BaseEventProps {
  modelId: string;
  aspectRatio: AspectRatio;
  hdEnhance: boolean;
  cost: number;
}

export interface DownloadProps extends BaseEventProps {
  taskId: string;
  format: 'png' | 'jpg';
}

export type FeedbackRating = 'satisfied' | 'neutral' | 'unsatisfied';

export interface FeedbackProps extends BaseEventProps {
  taskId: string;
  rating: FeedbackRating;
}

/** 埋点事件 union(发给 SDK 时的类型保证) */
export type TrackEvent =
  | { name: 'handheld_entry_view'; props: BaseEventProps }
  | { name: 'handheld_tab_click'; props: BaseEventProps & { previousTab: string } }
  | { name: 'handheld_upload_start'; props: BaseEventProps & { fileSize: number; fileType: string } }
  | { name: 'handheld_upload_success'; props: BaseEventProps & { fileSize: number; durationMs: number } }
  | { name: 'handheld_upload_fail'; props: UploadFailProps }
  | { name: 'handheld_model_select'; props: BaseEventProps & { modelId: string } }
  | { name: 'handheld_advanced_expand'; props: BaseEventProps }
  | { name: 'handheld_generate_click'; props: GenerateClickProps }
  | { name: 'handheld_generate_success'; props: BaseEventProps & { taskId: string; durationMs: number; cost: number } }
  | { name: 'handheld_generate_fail'; props: BaseEventProps & { taskId: string; errorCode: number; durationMs: number } }
  | { name: 'handheld_download'; props: DownloadProps }
  | { name: 'handheld_regenerate'; props: BaseEventProps & { taskId: string } }
  | { name: 'handheld_feedback'; props: FeedbackProps };
