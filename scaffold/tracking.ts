/**
 * 手持商品 MVP · 埋点 Adapter
 *
 * 12 个事件的统一封装,业务代码不感知底层 SDK。
 * 真实 SDK 是神策 / 友盟 / 自研 — 在 sdkAdapter 里替换即可。
 *
 * @see prd.md § 6
 */

import {
  TrackEvent,
  EntryViewProps,
  TabClickProps,
  UploadStartProps,
  UploadSuccessProps,
  UploadFailProps,
  ModelSelectProps,
  AdvancedExpandProps,
  GenerateClickProps,
  GenerateSuccessProps,
  GenerateFailProps,
  DownloadProps,
  RegenerateProps,
  FeedbackProps,
  UserType,
} from '../types';

// ============================================================
// SDK Adapter · 替换层
// ============================================================

/**
 * 底层埋点 SDK 适配接口。
 * @TODO SDK: 千图AI 实际埋点是神策/友盟/自研?替换 sdkAdapter 实现即可。
 */
interface SdkAdapter {
  track(eventName: string, props: Record<string, unknown>): void;
  /** 关键事件用 sendBeacon 防丢失 */
  trackBeacon?(eventName: string, props: Record<string, unknown>): void;
}

/** 默认实现:console.log + 神策伪代码 */
const sdkAdapter: SdkAdapter = {
  track(eventName, props) {
    // @TODO SDK: 替换为实际 SDK,如:
    // window.sensorsdata.track(eventName, props);  // 神策
    // aplus_queue.push({ action: 'aplus.record', arguments: [eventName, props] });  // 友盟
    if (process.env.NODE_ENV !== 'production') {
      console.log('[track]', eventName, props);
    }
  },
  trackBeacon(eventName, props) {
    // @TODO SDK: 防丢失场景(用户关页),如:
    // navigator.sendBeacon('/api/track', JSON.stringify({ event: eventName, props }));
    if (process.env.NODE_ENV !== 'production') {
      console.log('[track-beacon]', eventName, props);
    }
  },
};

// ============================================================
// 用户上下文 · 自动注入到所有事件
// ============================================================

interface UserContext {
  userId: string;
  userType: UserType;
  sessionId: string;
}

let currentUserContext: UserContext | null = null;

/**
 * 应用启动时调用,初始化用户上下文。
 * @TODO user props: 接千图AI 用户系统,获取真实 userId + userType
 */
export function initTracking(ctx: UserContext): void {
  currentUserContext = ctx;
}

function ensureCtx(): UserContext {
  if (!currentUserContext) {
    throw new Error('Tracking not initialized — call initTracking(...) first');
  }
  return currentUserContext;
}

// ============================================================
// 类型安全的事件发送函数(对应 12 个事件)
// ============================================================

function emit(event: TrackEvent): void {
  sdkAdapter.track(event.name, event.props as unknown as Record<string, unknown>);
}

function emitBeacon(event: TrackEvent): void {
  if (sdkAdapter.trackBeacon) {
    sdkAdapter.trackBeacon(event.name, event.props as unknown as Record<string, unknown>);
  } else {
    emit(event);
  }
}

export const track = {
  /** 商品图功能页加载,手持 tab 可见 */
  entryView(extra?: Partial<EntryViewProps>): void {
    emit({
      name: 'handheld_entry_view',
      props: { ...ensureCtx(), ...extra },
    });
  },

  /** 点击手持 tab(漏斗第 1 层 — 使用率分子) */
  tabClick(props: { previousTab: string }): void {
    emit({
      name: 'handheld_tab_click',
      props: { ...ensureCtx(), ...props },
    });
  },

  /** 开始上传商品图 */
  uploadStart(props: { fileSize: number; fileType: string }): void {
    emit({
      name: 'handheld_upload_start',
      props: { ...ensureCtx(), ...props },
    });
  },

  /** 上传成功 */
  uploadSuccess(props: { fileSize: number; durationMs: number }): void {
    emit({
      name: 'handheld_upload_success',
      props: { ...ensureCtx(), ...props },
    });
  },

  /** 上传失败 */
  uploadFail(props: { errorCode: UploadFailProps['errorCode']; errorMessage: string }): void {
    emit({
      name: 'handheld_upload_fail',
      props: { ...ensureCtx(), ...props },
    });
  },

  /** 用户切换模特 */
  modelSelect(props: { modelId: string }): void {
    emit({
      name: 'handheld_model_select',
      props: { ...ensureCtx(), ...props },
    });
  },

  /** 用户展开"高级选项" */
  advancedExpand(): void {
    emit({
      name: 'handheld_advanced_expand',
      props: { ...ensureCtx() },
    });
  },

  /** 点击生成按钮 */
  generateClick(props: {
    modelId: string;
    aspectRatio: GenerateClickProps['aspectRatio'];
    hdEnhance: boolean;
    cost: number;
  }): void {
    emit({
      name: 'handheld_generate_click',
      props: { ...ensureCtx(), ...props },
    });
  },

  /** 生成成功(漏斗第 2 层 — 完成率分子) */
  generateSuccess(props: { taskId: string; durationMs: number; cost: number }): void {
    emit({
      name: 'handheld_generate_success',
      props: { ...ensureCtx(), ...props },
    });
  },

  /** 生成失败 */
  generateFail(props: {
    taskId: string;
    errorCode: GenerateFailProps['errorCode'];
    durationMs: number;
  }): void {
    emit({
      name: 'handheld_generate_fail',
      props: { ...ensureCtx(), ...props },
    });
  },

  /** 下载结果 — 用 beacon 防丢失(用户可能立刻关页面) */
  download(props: { taskId: string; format: DownloadProps['format'] }): void {
    emitBeacon({
      name: 'handheld_download',
      props: { ...ensureCtx(), ...props },
    });
  },

  /** 再生成 */
  regenerate(props: { taskId: string }): void {
    emit({
      name: 'handheld_regenerate',
      props: { ...ensureCtx(), ...props },
    });
  },

  /** 用户在结果页点反馈 */
  feedback(props: { taskId: string; rating: FeedbackProps['rating'] }): void {
    emit({
      name: 'handheld_feedback',
      props: { ...ensureCtx(), ...props },
    });
  },
};

// ============================================================
// 测试 / 调试工具
// ============================================================

/** 仅测试环境:替换 sdkAdapter 用于断言 */
export function __setAdapterForTest(adapter: SdkAdapter): void {
  Object.assign(sdkAdapter, adapter);
}
