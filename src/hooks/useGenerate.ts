import { useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { submitGenerate, pollResult } from '@/api/handheld';
import { useHandheldStore } from '@/store';
import { track } from '@/tracking';
import { HandheldApiError } from '@/api/client';
import type { GenerateRequest } from '@/types';

interface UseGenerateReturn {
  isGenerating: boolean;
  progress: number;
  resultUrl: string | null;
  error: string | null;
  generate: () => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

/**
 * 封装生成任务的完整生命周期:
 * 1. 提交 submitGenerate(扣算力)
 * 2. 轮询 pollResult(更新进度)
 * 3. 成功 → setResultUrl · 失败 → setError(后端已退算力)
 *
 * 支持 cancel(用户取消生成)和 reset(清空状态回到主页)
 */
export function useGenerate(): UseGenerateReturn {
  const {
    productImageUrl,
    selectedModelId,
    aspectRatio,
    hdEnhance,
    setCurrentTask,
    setResultUrl,
  } = useHandheldStore();
  const queryClient = useQueryClient();

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setLocalResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);

  const generate = useCallback(async () => {
    if (!productImageUrl || !selectedModelId) return;

    const cost = hdEnhance ? 16 : 12;
    track.generateClick({
      modelId: selectedModelId,
      aspectRatio,
      hdEnhance,
      cost,
    });

    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setLocalResultUrl(null);

    const payload: GenerateRequest = {
      productImageUrl,
      modelId: selectedModelId,
      aspectRatio,
      advanced: { hdEnhance },
    };
    startTimeRef.current = Date.now();
    abortRef.current = new AbortController();

    try {
      const submit = await submitGenerate(payload);
      setCurrentTask(submit.taskId);
      queryClient.invalidateQueries({ queryKey: ['quota'] });

      const result = await pollResult(submit.taskId, {
        signal: abortRef.current.signal,
        onProgress: (r) => setProgress(r.progress),
      });

      if (result.status === 'success' && result.resultUrl) {
        track.generateSuccess({
          taskId: submit.taskId,
          durationMs: Date.now() - startTimeRef.current,
          cost: result.cost,
        });
        setLocalResultUrl(result.resultUrl);
        setResultUrl(result.resultUrl);
      } else if (result.status === 'failed') {
        track.generateFail({
          taskId: submit.taskId,
          errorCode: result.errorCode ?? 50001,
          durationMs: Date.now() - startTimeRef.current,
        });
        setError(result.errorMessage ?? '生成失败');
        queryClient.invalidateQueries({ queryKey: ['quota'] });
      }
    } catch (err) {
      const apiErr = err as HandheldApiError;
      setError(apiErr.userMessage || apiErr.message);
    } finally {
      setIsGenerating(false);
    }
  }, [
    productImageUrl,
    selectedModelId,
    aspectRatio,
    hdEnhance,
    setCurrentTask,
    setResultUrl,
    queryClient,
  ]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsGenerating(false);
  }, []);

  const reset = useCallback(() => {
    setIsGenerating(false);
    setProgress(0);
    setLocalResultUrl(null);
    setError(null);
    setResultUrl(null);
  }, [setResultUrl]);

  return { isGenerating, progress, resultUrl, error, generate, cancel, reset };
}
