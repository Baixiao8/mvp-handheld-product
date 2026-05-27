/**
 * 千图AI · 手持商品 MVP 原型 · Mock 数据 + Mock API + 埋点
 *
 * 完全离线运行,不依赖外部网络。
 * 模拟 PRD § 5 定义的 5 个 API + § 6 定义的 12 个埋点事件。
 */

// ============================================================
// 占位图(SVG data URI)— 完全离线
// ============================================================

/** 生成模特头像占位 — hue 控制色调 */
const modelAvatar = (hue, label) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
  <defs>
    <linearGradient id="bg${hue}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="hsl(${hue},35%,93%)"/>
      <stop offset="1" stop-color="hsl(${hue},35%,82%)"/>
    </linearGradient>
  </defs>
  <rect width="240" height="240" fill="url(#bg${hue})"/>
  <!-- 头 -->
  <circle cx="120" cy="92" r="36" fill="hsl(${hue},25%,70%)"/>
  <!-- 头发 -->
  <path d="M 84 88 Q 84 56 120 56 Q 156 56 156 88 L 156 78 Q 156 64 144 64 L 96 64 Q 84 64 84 78 Z" fill="hsl(${hue + 30},25%,32%)"/>
  <!-- 身体 -->
  <path d="M 80 240 Q 80 168 120 168 Q 160 168 160 240 Z" fill="hsl(${hue + 15},45%,72%)"/>
  <!-- 手(模拟手持) -->
  <ellipse cx="120" cy="200" rx="22" ry="14" fill="hsl(${hue},25%,72%)"/>
  <!-- 商品占位 -->
  <rect x="106" y="186" width="28" height="22" rx="4" fill="hsl(${hue + 60},55%,55%)"/>
  <text x="120" y="232" text-anchor="middle" font-family="sans-serif" font-size="11" fill="hsl(${hue},20%,40%)" font-weight="500">${label}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/** 生成结果占位 */
const resultImage = (modelLabel, ratio) => {
  const sizes = {
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
    <radialGradient id="light" cx="0.3" cy="0.3" r="0.8">
      <stop offset="0" stop-color="rgba(255,255,240,0.4)"/>
      <stop offset="1" stop-color="rgba(255,255,240,0)"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#light)"/>

  <!-- 模特轮廓 -->
  <ellipse cx="${cx}" cy="${cy - 80}" rx="60" ry="74" fill="#E8D5C4"/>
  <path d="M ${cx - 110} ${h} Q ${cx - 110} ${cy + 100} ${cx} ${cy - 10} Q ${cx + 110} ${cy + 100} ${cx + 110} ${h} Z" fill="#F5E6D3"/>
  <path d="M ${cx - 84} ${cy - 130} Q ${cx - 84} ${cy - 160} ${cx} ${cy - 160} Q ${cx + 84} ${cy - 160} ${cx + 84} ${cy - 130} L ${cx + 84} ${cy - 140} Q ${cx + 84} ${cy - 152} ${cx + 72} ${cy - 152} L ${cx - 72} ${cy - 152} Q ${cx - 84} ${cy - 152} ${cx - 84} ${cy - 140} Z" fill="#3D2817"/>

  <!-- 手 -->
  <ellipse cx="${cx}" cy="${cy + 60}" rx="50" ry="28" fill="#E8D5C4"/>

  <!-- 商品占位(手中的盒子) -->
  <rect x="${cx - 36}" y="${cy + 32}" width="72" height="52" rx="6" fill="#3B82F6" opacity="0.9"/>
  <rect x="${cx - 30}" y="${cy + 42}" width="60" height="6" rx="2" fill="#FFFFFF" opacity="0.6"/>
  <rect x="${cx - 30}" y="${cy + 56}" width="40" height="4" rx="1" fill="#FFFFFF" opacity="0.4"/>

  <!-- 水印 -->
  <text x="${w - 16}" y="${h - 12}" text-anchor="end" font-family="sans-serif" font-size="11" fill="rgba(0,0,0,0.18)">千图AI · 原型生成</text>
  <text x="12" y="${h - 12}" font-family="sans-serif" font-size="10" fill="rgba(0,0,0,0.18)">${modelLabel} · ${ratio}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// ============================================================
// 模特数据
// ============================================================

const MOCK_MODELS = [
  {
    id: 'model_001',
    name: '都市风',
    thumbnailUrl: modelAvatar(15, '都市风'),
    previewUrl: modelAvatar(15, '都市风'),
    gender: 'female',
    ethnicity: 'asian',
    pose: 'holding_front',
    isDefault: true,
    order: 1,
  },
  {
    id: 'model_002',
    name: '清新风',
    thumbnailUrl: modelAvatar(180, '清新风'),
    previewUrl: modelAvatar(180, '清新风'),
    gender: 'female',
    ethnicity: 'asian',
    pose: 'holding_front',
    isDefault: false,
    order: 2,
  },
  {
    id: 'model_003',
    name: '高冷风',
    thumbnailUrl: modelAvatar(270, '高冷风'),
    previewUrl: modelAvatar(270, '高冷风'),
    gender: 'female',
    ethnicity: 'asian',
    pose: 'holding_front',
    isDefault: false,
    order: 3,
  },
];

// ============================================================
// Mock 全局状态
// ============================================================

const MOCK_STATE = {
  quotaBalance: 86,
  costPerGeneration: 12,
  costHdEnhance: 16,
  forceFail: false,
  currentTask: null,
  trackedEvents: [],
  userContext: null,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ============================================================
// Mock API · 与 PRD § 5 一一对应
// ============================================================

const MockApi = {
  /** API-1 · 获取模特列表 */
  async getModels() {
    await sleep(200);
    return { code: 0, data: { models: MOCK_MODELS } };
  },

  /** API-4 · 查询算力余额 */
  async getQuota() {
    await sleep(150);
    const sufficient = MOCK_STATE.quotaBalance >= MOCK_STATE.costPerGeneration;
    return {
      code: 0,
      data: {
        currentBalance: MOCK_STATE.quotaBalance,
        costPerGeneration: MOCK_STATE.costPerGeneration,
        costHdEnhance: MOCK_STATE.costHdEnhance,
        sufficient,
      },
    };
  },

  /** API-2 · 提交生成任务 */
  async submitGenerate(payload) {
    await sleep(350);
    const cost = payload.advanced?.hdEnhance
      ? MOCK_STATE.costHdEnhance
      : MOCK_STATE.costPerGeneration;

    if (MOCK_STATE.quotaBalance < cost) {
      return { code: 40301, message: '算力不足' };
    }

    const taskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    MOCK_STATE.quotaBalance -= cost;
    MOCK_STATE.currentTask = {
      taskId,
      payload,
      startTime: Date.now(),
      cost,
      forceFail: MOCK_STATE.forceFail,
    };
    return {
      code: 0,
      data: {
        taskId,
        estimatedSeconds: 8,
        cost,
      },
    };
  },

  /** API-3 · 查询任务结果 */
  async getResult(taskId) {
    await sleep(120);
    const task = MOCK_STATE.currentTask;
    if (!task || task.taskId !== taskId) {
      return { code: 40001, message: 'task not found' };
    }

    const elapsed = Date.now() - task.startTime;
    const totalDuration = 8000; // 8 秒
    let progress = Math.min(99, Math.round((elapsed / totalDuration) * 100));

    let status = 'processing';
    let resultUrl = undefined;
    let errorCode = undefined;
    let errorMessage = undefined;
    let refunded = false;
    let completedAt = undefined;

    if (elapsed >= totalDuration) {
      if (task.forceFail) {
        status = 'failed';
        errorCode = 50001;
        errorMessage = '算法服务异常';
        MOCK_STATE.quotaBalance += task.cost;
        refunded = true;
      } else {
        status = 'success';
        const model = MOCK_MODELS.find((m) => m.id === task.payload.modelId);
        resultUrl = resultImage(model?.name || '未知', task.payload.aspectRatio);
      }
      progress = 100;
      completedAt = Math.floor((task.startTime + totalDuration) / 1000);
    }

    return {
      code: 0,
      data: {
        taskId,
        status,
        progress,
        resultUrl,
        cost: task.cost,
        refunded,
        errorCode,
        errorMessage,
        createdAt: Math.floor(task.startTime / 1000),
        completedAt,
      },
    };
  },

  /** API-5 · 上传商品图(转 base64 用于预览) */
  async uploadProductImage(file) {
    await sleep(400);
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
    return {
      code: 0,
      data: {
        url: dataUrl,
        expireAt: Math.floor(Date.now() / 1000) + 3600,
      },
    };
  },
};

// ============================================================
// Mock 埋点 Tracker · 12 个事件
// ============================================================

const MockTracker = {
  init(ctx) {
    MOCK_STATE.userContext = ctx;
  },
  track(eventName, props = {}) {
    const event = {
      timestamp: new Date().toISOString(),
      name: eventName,
      props: { ...MOCK_STATE.userContext, ...props },
    };
    MOCK_STATE.trackedEvents.push(event);
    // 控制台打印,便于开发对照 PRD § 6
    console.log(`%c[track] ${eventName}`, 'color: #16A34A; font-weight: 600', event.props);
  },
};

// 暴露给 app.js 用
window.MockApi = MockApi;
window.MockTracker = MockTracker;
window.MOCK_STATE = MOCK_STATE;
window.MOCK_MODELS = MOCK_MODELS;
