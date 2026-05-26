/**
 * 千图AI · 手持商品 MVP 原型 · 交互逻辑
 *
 * 状态管理 + 5 屏切换 + 主流程 + 异常处理
 * 与 PRD § 3 用户流程、§ 4 UI 规格、§ 9 边界处理对齐
 */

// ============================================================
// 应用状态
// ============================================================
const app = {
  currentScreen: 'entry',
  productImageUrl: null,
  productFile: null,
  selectedModelId: null,
  aspectRatio: '1:1',
  hdEnhance: false,
  generating: false,
  currentTaskId: null,
  pollTimer: null,
  models: [],
};

// ============================================================
// 初始化
// ============================================================
async function init() {
  // 用户上下文(MVP 阶段假设用户已登录,且是电商类型)
  MockTracker.init({
    userId: 'demo_user_001',
    userType: 'ecommerce',
    sessionId: `sess_${Date.now()}`,
  });

  // 拉模特列表
  const modelsResp = await MockApi.getModels();
  app.models = modelsResp.data.models;
  const defaultModel = app.models.find((m) => m.isDefault) || app.models[0];
  app.selectedModelId = defaultModel.id;
  renderModels();

  // 拉算力
  await refreshQuota();

  // 入口曝光
  MockTracker.track('handheld_entry_view');

  // 绑事件
  bindEvents();
}

async function refreshQuota() {
  const resp = await MockApi.getQuota();
  document.getElementById('quota-display').textContent = resp.data.currentBalance;
}

function renderModels() {
  const container = document.getElementById('model-list');
  container.innerHTML = '';
  app.models.forEach((model) => {
    const card = document.createElement('div');
    card.className = 'model-card' + (model.id === app.selectedModelId ? ' active' : '');
    card.dataset.modelId = model.id;
    card.innerHTML = `
      <div class="model-thumb"><img src="${model.thumbnailUrl}" alt="${model.name}"></div>
      <div class="model-name">${model.name}</div>
    `;
    card.addEventListener('click', () => {
      app.selectedModelId = model.id;
      MockTracker.track('handheld_model_select', { modelId: model.id });
      renderModels();
    });
    container.appendChild(card);
  });
}

// ============================================================
// 屏幕切换
// ============================================================
function switchScreen(name) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById(`screen-${name}`).classList.add('active');
  app.currentScreen = name;

  // CTA 只在 main 屏显示
  const fixedBottom = document.getElementById('fixed-bottom');
  if (name === 'main') {
    fixedBottom.classList.remove('hidden');
  } else {
    fixedBottom.classList.add('hidden');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// 事件绑定
// ============================================================
function bindEvents() {
  // 入口 tab
  document.getElementById('tab-handheld').addEventListener('click', () => {
    MockTracker.track('handheld_tab_click', { previousTab: 'whitebackground' });
    switchScreen('main');
  });

  // 返回
  document.getElementById('back-to-entry').addEventListener('click', () => {
    switchScreen('entry');
  });
  document.getElementById('back-from-result').addEventListener('click', () => {
    resetMainForm();
    switchScreen('entry');
  });

  // 上传交互
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('file-input');
  uploadArea.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handleUpload(e.target.files[0]);
    e.target.value = ''; // 清空,允许同名重传
  });
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    if (e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]);
  });

  // 粘贴上传(只在 main 屏)
  document.addEventListener('paste', (e) => {
    if (app.currentScreen !== 'main') return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        handleUpload(item.getAsFile());
        break;
      }
    }
  });

  // 移除上传
  document.getElementById('upload-remove').addEventListener('click', (e) => {
    e.stopPropagation();
    app.productImageUrl = null;
    app.productFile = null;
    document.getElementById('upload-empty').classList.remove('hidden');
    document.getElementById('upload-preview').classList.add('hidden');
    updateGenerateButton();
  });

  // 高级选项
  document.getElementById('advanced-toggle').addEventListener('click', () => {
    const toggle = document.getElementById('advanced-toggle');
    const content = document.getElementById('advanced-content');
    const expanding = content.classList.contains('hidden');
    if (expanding) {
      content.classList.remove('hidden');
      toggle.classList.add('expanded');
      MockTracker.track('handheld_advanced_expand');
    } else {
      content.classList.add('hidden');
      toggle.classList.remove('expanded');
    }
  });

  // 尺寸
  document.querySelectorAll('input[name="ratio"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      app.aspectRatio = e.target.value;
    });
  });

  // HD 开关
  document.getElementById('hd-toggle').addEventListener('change', (e) => {
    app.hdEnhance = e.target.checked;
    document.getElementById('hd-hint').textContent = e.target.checked
      ? '开启 (+4 算力)'
      : '关闭';
    updateGenerateButton();
  });

  // 生成
  document.getElementById('generate-btn').addEventListener('click', handleGenerate);

  // 取消生成
  document.getElementById('cancel-generate').addEventListener('click', () => {
    if (app.pollTimer) {
      clearTimeout(app.pollTimer);
      app.pollTimer = null;
    }
    app.generating = false;
    document.getElementById('modal-loading').classList.add('hidden');
  });

  // 结果页操作
  document.getElementById('action-download-png').addEventListener('click', () => handleDownload('png'));
  document.getElementById('action-download-jpg').addEventListener('click', () => handleDownload('jpg'));
  document.getElementById('action-regenerate').addEventListener('click', handleRegenerate);
  document.getElementById('action-save').addEventListener('click', handleSave);

  // 反馈
  document.querySelectorAll('.feedback-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const rating = e.currentTarget.dataset.rating;
      MockTracker.track('handheld_feedback', {
        taskId: app.currentTaskId,
        rating,
      });
      document.querySelectorAll('.feedback-btn').forEach((b) => b.classList.remove('selected'));
      e.currentTarget.classList.add('selected');
      showToast(`已反馈:${e.currentTarget.textContent}`);
    });
  });

  // 错误 Modal
  document.getElementById('error-cancel').addEventListener('click', () => {
    document.getElementById('modal-error').classList.add('hidden');
  });
  document.getElementById('error-confirm').addEventListener('click', () => {
    document.getElementById('modal-error').classList.add('hidden');
    if (window.__errorAction === 'recharge') {
      showToast('跳转充值页(原型省略)');
      window.__errorAction = null;
    }
  });

  // Dev panel
  document.querySelectorAll('.dev-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => handleDevAction(e.currentTarget.dataset.action));
  });
}

// ============================================================
// 上传逻辑
// ============================================================
async function handleUpload(file) {
  if (!file) return;

  // 校验
  if (file.size > 10 * 1024 * 1024) {
    MockTracker.track('handheld_upload_fail', { errorCode: 40002, errorMessage: 'file too large' });
    showError('文件过大', '文件超过 10MB,请压缩后重试', null);
    return;
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    MockTracker.track('handheld_upload_fail', { errorCode: 40002, errorMessage: 'unsupported format' });
    showError('格式不支持', `请上传 JPG / PNG / WEBP 格式(当前:${file.type})`, null);
    return;
  }

  MockTracker.track('handheld_upload_start', { fileSize: file.size, fileType: file.type });
  const startTime = Date.now();

  try {
    const resp = await MockApi.uploadProductImage(file);
    app.productImageUrl = resp.data.url;
    app.productFile = file;

    document.getElementById('upload-image').src = resp.data.url;
    document.getElementById('upload-empty').classList.add('hidden');
    document.getElementById('upload-preview').classList.remove('hidden');

    MockTracker.track('handheld_upload_success', {
      fileSize: file.size,
      durationMs: Date.now() - startTime,
    });
    updateGenerateButton();
  } catch (err) {
    MockTracker.track('handheld_upload_fail', {
      errorCode: 'NETWORK_ERROR',
      errorMessage: err.message,
    });
    showError('上传失败', err.message || '请重试', null);
  }
}

// ============================================================
// 生成按钮状态
// ============================================================
function updateGenerateButton() {
  const btn = document.getElementById('generate-btn');
  const text = document.getElementById('generate-text');
  if (!app.productImageUrl) {
    btn.disabled = true;
    text.textContent = '请先上传商品图';
    return;
  }
  btn.disabled = false;
  const cost = app.hdEnhance ? MOCK_STATE.costHdEnhance : MOCK_STATE.costPerGeneration;
  text.textContent = `生成 (${cost} 算力)`;
}

// ============================================================
// 生成流程
// ============================================================
async function handleGenerate() {
  if (!app.productImageUrl || app.generating) return;

  const cost = app.hdEnhance ? MOCK_STATE.costHdEnhance : MOCK_STATE.costPerGeneration;

  MockTracker.track('handheld_generate_click', {
    modelId: app.selectedModelId,
    aspectRatio: app.aspectRatio,
    hdEnhance: app.hdEnhance,
    cost,
  });

  // 算力预校验
  const quotaResp = await MockApi.getQuota();
  if (!quotaResp.data.sufficient) {
    window.__errorAction = 'recharge';
    showError(
      '算力不足',
      `本次需要 ${cost} 算力,当前余额 ${quotaResp.data.currentBalance} 算力。请充值后重试`,
      '去充值',
    );
    return;
  }

  // 提交
  app.generating = true;
  const submitResp = await MockApi.submitGenerate({
    productImageUrl: app.productImageUrl,
    modelId: app.selectedModelId,
    aspectRatio: app.aspectRatio,
    advanced: { hdEnhance: app.hdEnhance },
  });

  if (submitResp.code !== 0) {
    app.generating = false;
    showError('提交失败', submitResp.message || '请重试', null);
    return;
  }

  app.currentTaskId = submitResp.data.taskId;

  // 展示 Loading
  document.getElementById('modal-loading').classList.remove('hidden');
  document.getElementById('loading-pct').textContent = '0';
  document.getElementById('loading-eta').textContent = '8';

  // 刷算力(已扣)
  await refreshQuota();

  // 开始轮询
  pollResult(submitResp.data.taskId);
}

async function pollResult(taskId) {
  const resp = await MockApi.getResult(taskId);
  if (resp.code !== 0) {
    app.generating = false;
    document.getElementById('modal-loading').classList.add('hidden');
    showError('查询失败', resp.message, null);
    return;
  }

  const result = resp.data;
  document.getElementById('loading-pct').textContent = result.progress;
  const eta = Math.max(1, 8 - Math.round((result.progress / 100) * 8));
  document.getElementById('loading-eta').textContent = eta;

  if (result.status === 'success') {
    document.getElementById('modal-loading').classList.add('hidden');
    app.generating = false;
    MockTracker.track('handheld_generate_success', {
      taskId,
      durationMs: Date.now() - MOCK_STATE.currentTask.startTime,
      cost: result.cost,
    });
    showResult(result.resultUrl);
  } else if (result.status === 'failed') {
    document.getElementById('modal-loading').classList.add('hidden');
    app.generating = false;
    MockTracker.track('handheld_generate_fail', {
      taskId,
      errorCode: result.errorCode,
      durationMs: Date.now() - MOCK_STATE.currentTask.startTime,
    });
    showError(
      '生成失败',
      `${result.errorMessage}。已退还 ${result.cost} 算力,可重试`,
      null,
    );
    await refreshQuota();
    MOCK_STATE.forceFail = false; // 重置强制失败标志
  } else {
    // 继续轮询
    app.pollTimer = setTimeout(() => pollResult(taskId), 800);
  }
}

function showResult(url) {
  document.getElementById('result-image').src = url;
  document.querySelectorAll('.feedback-btn').forEach((b) => b.classList.remove('selected'));
  switchScreen('result');
}

// ============================================================
// 结果页操作
// ============================================================
function handleDownload(format) {
  MockTracker.track('handheld_download', {
    taskId: app.currentTaskId,
    format,
  });
  showToast(`已下载(${format.toUpperCase()},原型省略实际下载)`);
}

async function handleRegenerate() {
  MockTracker.track('handheld_regenerate', { taskId: app.currentTaskId });
  switchScreen('main');
  setTimeout(() => handleGenerate(), 350);
}

function handleSave() {
  showToast('已保存到素材库(原型省略)');
}

// ============================================================
// 错误 / Toast
// ============================================================
function showError(title, message, confirmText) {
  document.getElementById('error-title').textContent = title;
  document.getElementById('error-message').textContent = message;
  const confirmBtn = document.getElementById('error-confirm');
  if (confirmText) {
    confirmBtn.textContent = confirmText;
    confirmBtn.classList.remove('hidden');
  } else {
    confirmBtn.textContent = '确定';
  }
  document.getElementById('modal-error').classList.remove('hidden');
}

let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 2200);
}

// ============================================================
// 表单重置
// ============================================================
function resetMainForm() {
  app.productImageUrl = null;
  app.productFile = null;
  app.aspectRatio = '1:1';
  app.hdEnhance = false;
  document.getElementById('upload-empty').classList.remove('hidden');
  document.getElementById('upload-preview').classList.add('hidden');
  document.querySelector('input[name="ratio"][value="1:1"]').checked = true;
  document.getElementById('hd-toggle').checked = false;
  document.getElementById('hd-hint').textContent = '关闭';
  document.getElementById('advanced-content').classList.add('hidden');
  document.getElementById('advanced-toggle').classList.remove('expanded');
  updateGenerateButton();
}

// ============================================================
// Dev 调试面板
// ============================================================
function handleDevAction(action) {
  switch (action) {
    case 'set-quota-low':
      MOCK_STATE.quotaBalance = 5;
      refreshQuota();
      showToast('算力余额已设为 5(测试不足场景)');
      break;
    case 'set-quota-normal':
      MOCK_STATE.quotaBalance = 86;
      refreshQuota();
      showToast('算力余额恢复为 86');
      break;
    case 'force-fail':
      MOCK_STATE.forceFail = true;
      showToast('下次生成将强制失败(测试失败 + 退算力)');
      break;
    case 'show-events':
      console.group('%c[埋点日志] 共 ' + MOCK_STATE.trackedEvents.length + ' 条', 'color:#16A34A;font-weight:600');
      console.table(MOCK_STATE.trackedEvents.map(e => ({
        time: e.timestamp.split('T')[1].split('.')[0],
        name: e.name,
        props: JSON.stringify(e.props),
      })));
      console.groupEnd();
      showToast(`已打印 ${MOCK_STATE.trackedEvents.length} 条埋点到控制台(F12 查看)`);
      break;
    case 'toggle':
      document.getElementById('dev-panel').classList.toggle('collapsed');
      break;
  }
}

// ============================================================
// 启动
// ============================================================
init();
