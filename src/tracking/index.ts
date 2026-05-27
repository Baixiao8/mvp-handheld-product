/**
 * 埋点 Adapter · 12 个事件
 * @see prd.md § 6
 *
 * 业务代码调用 track.xxx(),底层 SDK 通过 sdkAdapter 替换(@TODO 接千图AI 实际 SDK)
 */
import type {
  UserType,
  TrackEvent,
  GenerateClickProps,
  UploadFailProps,
  FeedbackProps,
  DownloadProps,
} from '@/types';

interface SdkAdapter {
  track(eventName: string, props: Record<string, unknown>): void;
  trackBeacon?(eventName: string, props: Record<string, unknown>): void;
}

/**
 * @TODO SDK: 替换为千图AI 实际埋点(神策 / 友盟 / 自研)
 * 当前实现:开发环境打印到 console,生产环境静默
 */
const sdkAdapter: SdkAdapter = {
  track(eventName, props) {
    if (import.meta.env.MODE !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`%c[track] ${eventName}`, 'color: #00B277; font-weight: 600', props);
    }
  },
  trackBeacon(eventName, props) {
    if (import.meta.env.MODE !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`%c[track-beacon] ${eventName}`, 'color: #00B277; font-weight: 600', props);
    }
  },
};

interface UserContext {
  userId: string;
  userType: UserType;
  sessionId: string;
}

let currentCtx: UserContext | null = null;

export function initTracking(ctx: UserContext) {
  currentCtx = ctx;
}

function ctx(): UserContext {
  if (!currentCtx) {
    throw new Error('Tracking not initialized — call initTracking first');
  }
  return currentCtx;
}

function emit(event: TrackEvent) {
  sdkAdapter.track(event.name, event.props as unknown as Record<string, unknown>);
}

function emitBeacon(event: TrackEvent) {
  (sdkAdapter.trackBeacon || sdkAdapter.track)(event.name, event.props as unknown as Record<string, unknown>);
}

/**
 * 12 个类型安全的埋点函数
 */
export const track = {
  entryView() {
    emit({ name: 'handheld_entry_view', props: { ...ctx() } });
  },
  tabClick(p: { previousTab: string }) {
    emit({ name: 'handheld_tab_click', props: { ...ctx(), ...p } });
  },
  uploadStart(p: { fileSize: number; fileType: string }) {
    emit({ name: 'handheld_upload_start', props: { ...ctx(), ...p } });
  },
  uploadSuccess(p: { fileSize: number; durationMs: number }) {
    emit({ name: 'handheld_upload_success', props: { ...ctx(), ...p } });
  },
  uploadFail(p: { errorCode: UploadFailProps['errorCode']; errorMessage: string }) {
    emit({ name: 'handheld_upload_fail', props: { ...ctx(), ...p } });
  },
  modelSelect(p: { modelId: string }) {
    emit({ name: 'handheld_model_select', props: { ...ctx(), ...p } });
  },
  advancedExpand() {
    emit({ name: 'handheld_advanced_expand', props: { ...ctx() } });
  },
  generateClick(p: {
    modelId: string;
    aspectRatio: GenerateClickProps['aspectRatio'];
    hdEnhance: boolean;
    cost: number;
  }) {
    emit({ name: 'handheld_generate_click', props: { ...ctx(), ...p } });
  },
  generateSuccess(p: { taskId: string; durationMs: number; cost: number }) {
    emit({ name: 'handheld_generate_success', props: { ...ctx(), ...p } });
  },
  generateFail(p: { taskId: string; errorCode: number; durationMs: number }) {
    emit({ name: 'handheld_generate_fail', props: { ...ctx(), ...p } });
  },
  /** 用 sendBeacon 防关页丢失 */
  download(p: { taskId: string; format: DownloadProps['format'] }) {
    emitBeacon({ name: 'handheld_download', props: { ...ctx(), ...p } });
  },
  regenerate(p: { taskId: string }) {
    emit({ name: 'handheld_regenerate', props: { ...ctx(), ...p } });
  },
  feedback(p: { taskId: string; rating: FeedbackProps['rating'] }) {
    emit({ name: 'handheld_feedback', props: { ...ctx(), ...p } });
  },
};
