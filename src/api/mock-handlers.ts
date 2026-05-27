/**
 * MSW Mock Handlers · 5 个 API 的 mock 实现
 *
 * 启用条件:ENV.useMock === true
 * 关闭后(VITE_USE_MOCK=false)MSW 不启动,fetch 直接走真实 backend endpoint
 *
 * Mock 跟真实 API 走同一个 client(api/client.ts),所以前端业务代码完全不感知
 */
import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';
import { ENV } from '@/config/env';
import type { ModelInfo } from '@/types';

const BASE = ENV.apiBaseUrl;

// ============================================================
// SVG 占位图(完全离线 · 不依赖外部 CDN)
// ============================================================

const modelAvatar = (hue: number, label: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
  <defs>
    <linearGradient id="bg${hue}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="hsl(${hue},35%,90%)"/>
      <stop offset="1" stop-color="hsl(${hue},35%,75%)"/>
    </linearGradient>
  </defs>
  <rect width="240" height="240" fill="url(#bg${hue})"/>
  <circle cx="120" cy="92" r="36" fill="hsl(${hue},25%,65%)"/>
  <path d="M 84 88 Q 84 56 120 56 Q 156 56 156 88 L 156 78 Q 156 64 144 64 L 96 64 Q 84 64 84 78 Z" fill="hsl(${hue + 30},25%,28%)"/>
  <path d="M 80 240 Q 80 168 120 168 Q 160 168 160 240 Z" fill="hsl(${hue + 15},45%,68%)"/>
  <ellipse cx="120" cy="200" rx="22" ry="14" fill="hsl(${hue},25%,68%)"/>
  <rect x="106" y="186" width="28" height="22" rx="4" fill="hsl(${hue + 60},55%,50%)"/>
  <text x="120" y="232" text-anchor="middle" font-family="sans-serif" font-size="11" fill="hsl(${hue},20%,35%)" font-weight="500">${label}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const resultImage = (modelLabel: string, ratio: string) => {
  const sizes: Record<string, { w: number; h: number }> = {
    '1:1': { w: 600, h: 600 },
    '3:4': { w: 480, h: 640 },
    '2:3': { w: 480, h: 720 },
  };
  const { w, h } = sizes[ratio] || sizes['1:1'];
  const cx = w / 2;
  const cy = h / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FAFAF8"/>
      <stop offset="0.5" stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#F0EFEC"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <ellipse cx="${cx}" cy="${cy - 80}" rx="60" ry="74" fill="#E8D5C4"/>
  <path d="M ${cx - 110} ${h} Q ${cx - 110} ${cy + 100} ${cx} ${cy - 10} Q ${cx + 110} ${cy + 100} ${cx + 110} ${h} Z" fill="#F5E6D3"/>
  <ellipse cx="${cx}" cy="${cy + 60}" rx="50" ry="28" fill="#E8D5C4"/>
  <rect x="${cx - 36}" y="${cy + 32}" width="72" height="52" rx="6" fill="#3B82F6" opacity="0.9"/>
  <text x="${w - 16}" y="${h - 12}" text-anchor="end" font-family="sans-serif" font-size="11" fill="rgba(0,0,0,0.18)">千图AI · Mock</text>
  <text x="12" y="${h - 12}" font-family="sans-serif" font-size="10" fill="rgba(0,0,0,0.18)">${modelLabel} · ${ratio}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// ============================================================
// Mock 模特数据
// ============================================================

const MOCK_MODELS: ModelInfo[] = [
  { id: 'model_001', name: '都市风', thumbnailUrl: modelAvatar(15, '都市风'), previewUrl: modelAvatar(15, '都市风'), gender: 'female', ethnicity: 'asian', pose: 'holding_front', isDefault: true, order: 1 },
  { id: 'model_002', name: '清新风', thumbnailUrl: modelAvatar(180, '清新风'), previewUrl: modelAvatar(180, '清新风'), gender: 'female', ethnicity: 'asian', pose: 'holding_front', isDefault: false, order: 2 },
  { id: 'model_003', name: '高冷风', thumbnailUrl: modelAvatar(270, '高冷风'), previewUrl: modelAvatar(270, '高冷风'), gender: 'female', ethnicity: 'asian', pose: 'holding_front', isDefault: false, order: 3 },
];

// ============================================================
// Mock 全局状态(暴露给 Dev tools 用 · window.__MOCK_STATE)
// ============================================================

export const __MOCK_STATE = {
  quotaBalance: 86,
  costPerGen: 12,
  costHd: 16,
  forceFail: false,
  currentTask: null as null | { taskId: string; payload: any; startTime: number; cost: number; forceFail: boolean },
};

// 浏览器调试:window.__MOCK_STATE
if (typeof window !== 'undefined') {
  (window as any).__MOCK_STATE = __MOCK_STATE;
}

// ============================================================
// Handlers · 5 个 API
// ============================================================

export const handlers = [
  // API-1 · 获取模特列表
  http.get(`${BASE}/models`, () => {
    return HttpResponse.json({ code: 0, data: { models: MOCK_MODELS } });
  }),

  // API-4 · 查询算力余额
  http.get(`${BASE}/quota`, () => {
    const sufficient = __MOCK_STATE.quotaBalance >= __MOCK_STATE.costPerGen;
    return HttpResponse.json({
      code: 0,
      data: {
        currentBalance: __MOCK_STATE.quotaBalance,
        costPerGeneration: __MOCK_STATE.costPerGen,
        costHdEnhance: __MOCK_STATE.costHd,
        sufficient,
      },
    });
  }),

  // API-2 · 提交生成任务
  http.post(`${BASE}/generate`, async ({ request }) => {
    const payload = (await request.json()) as any;
    const cost = payload.advanced?.hdEnhance ? __MOCK_STATE.costHd : __MOCK_STATE.costPerGen;
    if (__MOCK_STATE.quotaBalance < cost) {
      return HttpResponse.json({ code: 40301, message: '算力不足' }, { status: 403 });
    }
    __MOCK_STATE.quotaBalance -= cost;
    const taskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    __MOCK_STATE.currentTask = {
      taskId, payload, startTime: Date.now(), cost,
      forceFail: __MOCK_STATE.forceFail,
    };
    return HttpResponse.json({ code: 0, data: { taskId, estimatedSeconds: 8, cost } });
  }),

  // API-3 · 查询任务结果
  http.get(`${BASE}/result/:taskId`, ({ params }) => {
    const { taskId } = params;
    const task = __MOCK_STATE.currentTask;
    if (!task || task.taskId !== taskId) {
      return HttpResponse.json({ code: 40001, message: 'task not found' }, { status: 400 });
    }
    const elapsed = Date.now() - task.startTime;
    const TOTAL = 8000;
    let progress = Math.min(99, Math.round((elapsed / TOTAL) * 100));
    let status = 'processing';
    let resultUrl: string | undefined;
    let errorCode: number | undefined;
    let errorMessage: string | undefined;
    let refunded = false;
    let completedAt: number | undefined;

    if (elapsed >= TOTAL) {
      if (task.forceFail) {
        status = 'failed';
        errorCode = 50001;
        errorMessage = '算法服务异常';
        __MOCK_STATE.quotaBalance += task.cost;
        refunded = true;
      } else {
        status = 'success';
        const model = MOCK_MODELS.find((m) => m.id === task.payload.modelId);
        resultUrl = resultImage(model?.name || '未知', task.payload.aspectRatio);
      }
      progress = 100;
      completedAt = Math.floor((task.startTime + TOTAL) / 1000);
    }

    return HttpResponse.json({
      code: 0,
      data: {
        taskId, status, progress, resultUrl, cost: task.cost, refunded, errorCode, errorMessage,
        createdAt: Math.floor(task.startTime / 1000),
        completedAt,
      },
    });
  }),

  // API-5 · 上传商品图
  http.post(`${BASE}/upload`, async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    return HttpResponse.json({
      code: 0,
      data: { url: dataUrl, expireAt: Math.floor(Date.now() / 1000) + 3600 },
    });
  }),
];

export const worker = setupWorker(...handlers);
