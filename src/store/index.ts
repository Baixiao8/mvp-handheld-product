/**
 * Zustand Store · 手持商品 MVP 全局状态
 *
 * 不存网络请求结果(那是 TanStack Query 的事),只存 UI 状态 + 用户输入
 */
import { create } from 'zustand';
import type { AspectRatio, ModelInfo, FeedbackRating } from '@/types';

interface HandheldState {
  // 用户输入
  productImageUrl: string | null;
  productFile: File | null;
  selectedModelId: string | null;
  aspectRatio: AspectRatio;
  hdEnhance: boolean;

  // UI 状态
  advancedExpanded: boolean;

  // 任务状态
  currentTaskId: string | null;
  generating: boolean;
  progress: number;

  // 结果
  resultUrl: string | null;
  feedbackRating: FeedbackRating | null;

  // 模特数据缓存(从 API-1 同步过来)
  models: ModelInfo[];

  // Actions
  setProductImage: (url: string | null, file: File | null) => void;
  setSelectedModelId: (id: string) => void;
  setModels: (models: ModelInfo[]) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setHdEnhance: (on: boolean) => void;
  setAdvancedExpanded: (on: boolean) => void;
  setCurrentTask: (taskId: string | null) => void;
  setGenerating: (on: boolean) => void;
  setProgress: (p: number) => void;
  setResultUrl: (url: string | null) => void;
  setFeedbackRating: (rating: FeedbackRating | null) => void;
  reset: () => void;
}

const initialState = {
  productImageUrl: null,
  productFile: null,
  selectedModelId: null,
  aspectRatio: '1:1' as AspectRatio,
  hdEnhance: false,
  advancedExpanded: false,
  currentTaskId: null,
  generating: false,
  progress: 0,
  resultUrl: null,
  feedbackRating: null,
  models: [],
};

export const useHandheldStore = create<HandheldState>((set) => ({
  ...initialState,
  setProductImage: (url, file) => set({ productImageUrl: url, productFile: file }),
  setSelectedModelId: (selectedModelId) => set({ selectedModelId }),
  setModels: (models) => {
    const defaultModel = models.find((m) => m.isDefault) ?? models[0];
    set({ models, selectedModelId: defaultModel?.id ?? null });
  },
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setHdEnhance: (hdEnhance) => set({ hdEnhance }),
  setAdvancedExpanded: (advancedExpanded) => set({ advancedExpanded }),
  setCurrentTask: (currentTaskId) => set({ currentTaskId }),
  setGenerating: (generating) => set({ generating }),
  setProgress: (progress) => set({ progress }),
  setResultUrl: (resultUrl) => set({ resultUrl }),
  setFeedbackRating: (feedbackRating) => set({ feedbackRating }),
  reset: () => set(initialState),
}));
