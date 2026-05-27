# 千图AI · 手持商品 MVP

> Production-ready React MVP · vibe coding 完整工程
> 开发拿到 = git clone + 改 1 行 .env + npm install + 接 backend = 上线

**在线 demo**:https://baixiao8.github.io/mvp-handheld-product/(GitHub Actions 自动部署)

---

## 项目身份

- **对标产品**:万相营造(阿里通义)— 手持商品图功能
- **目标**:在千图AI 商品图功能里加"手持版"入口,验证电商用户对此场景的真实需求
- **本仓库形态**:**真实可跑的 React 前端工程**(不是 prototype),开发拿到改 1 行 `.env` 接真实 backend = 上线
- **代码归属**:本仓库是 vibe coding 产物;真实上线代码会在千图AI 前端单仓拉 `feature/handheld-product-mvp` 分支,从本仓库 copy + 集成

---

## 技术栈

| 层 | 选型 | 理由 |
|---|---|---|
| 框架 | **React 18 + TypeScript** | 对齐千图AI 主仓(从 `ant-switch` 类名推断) |
| 构建 | **Vite 5** | 启动 <1s,现代标配 |
| UI 库 | **Ant Design 5** | 千图AI 在用,组件复用 |
| 样式 | **CSS Variables + Antd ConfigProvider** | 严格 designknowledge token 三层 |
| 状态 | **Zustand** | 轻量(<100 行),无 Redux 仪式 |
| 数据 | **TanStack Query 5** | API 调用 + 缓存 + 轮询 |
| Mock | **MSW(Mock Service Worker)** | 拦截 fetch,真假切换 = 1 行 env |
| 路由 | **React Router 6** | 多屏流转 |

---

## 本地开发

```bash
# 1. clone + 进入项目
git clone https://github.com/Baixiao8/mvp-handheld-product.git
cd mvp-handheld-product

# 2. 配置环境(可选,默认就是 Mock 模式)
cp .env.example .env.local

# 3. 安装依赖
npm install

# 4. 初始化 MSW worker(只需 1 次)
npx msw init public/ --save

# 5. 起 dev server
npm run dev
# 浏览器自动打开 http://localhost:5173
```

**如果 npm install 报权限错(`EACCES`)**:用临时 cache 绕开
```bash
npm install --cache /tmp/npm-cache-mvp
```

---

## 切换真实 Backend(开发联调)

编辑 `.env.local`:
```
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://api.qiantu.ai/v1/handheld
```

重启 dev server。**前端业务代码 0 改动** — MSW 不再启动,所有 `fetch` 直接走真实 backend。

---

## 项目结构

```
mvp-handheld-product/
├── README.md                       # 本文件
├── .env.example                    # 环境变量模板(VITE_USE_MOCK / VITE_API_BASE_URL)
├── package.json                    # 依赖 + scripts
├── vite.config.ts                  # Vite 配置(含 GitHub Pages 子路径适配)
├── tsconfig.json                   # TypeScript 严格模式
├── index.html                      # Vite entry
│
├── src/
│   ├── main.tsx                    # 应用入口(MSW init + Router + Antd Provider)
│   ├── App.tsx                     # 路由 + 埋点初始化
│   ├── Layout.tsx                  # 顶部导航(对齐 ai.58pic.com)
│   ├── vite-env.d.ts               # Vite client types
│   │
│   ├── pages/
│   │   ├── ProductImage.tsx        # 屏 1 · 商品图入口页
│   │   └── Handheld.tsx            # 屏 2 · 手持版主流程(整合所有子组件)
│   │
│   ├── components/                 # 5 个核心组件
│   │   ├── ProductUpload.tsx       # 上传(点击/拖拽/粘贴 + 校验 + Spin)
│   │   ├── ModelPicker.tsx         # 3 选 1 模特(Lime 选中态)
│   │   ├── AdvancedOptions.tsx     # 折叠 · 尺寸 + HD 开关
│   │   └── HandheldResult.tsx      # 结果展示(下载/再生成/反馈)
│   │
│   ├── hooks/
│   │   └── useGenerate.ts          # 封装提交 + 轮询 + 错误处理 + 取消
│   │
│   ├── api/                        # API 层
│   │   ├── client.ts               # fetch 封装 + 鉴权 + 错误码处理
│   │   ├── handheld.ts             # 5 个 API endpoints(getModels/submitGenerate/pollResult/getQuota/uploadProductImage)
│   │   └── mock-handlers.ts        # MSW handlers(5 个 API mock 实现)
│   │
│   ├── store/
│   │   └── index.ts                # Zustand · 用户输入 + UI 状态 + 任务状态
│   │
│   ├── tracking/
│   │   └── index.ts                # 12 个埋点 · adapter pattern(@TODO 接千图AI SDK)
│   │
│   ├── types/
│   │   └── index.ts                # TypeScript 类型 + 错误码 + 埋点事件(与 prd.md §5/§6 对齐)
│   │
│   ├── styles/
│   │   ├── tokens.css              # Design Token 三层(Primitive/Semantic/Component)
│   │   ├── global.css              # 全局组件样式
│   │   └── antd-theme.ts           # Antd ConfigProvider 主题(对齐 token)
│   │
│   └── config/
│       └── env.ts                  # 环境变量统一入口
│
├── public/
│   └── mockServiceWorker.js        # MSW service worker(自动生成)
│
├── .github/workflows/
│   └── deploy.yml                  # GitHub Actions 自动 build + 部署 Pages
│
├── legacy-prototype/               # 原 HTML prototype(留作历史参考)
├── scaffold/                       # 早期 TypeScript scaffold(已被 src/ 取代)
│
├── prd.md                          # PRD(接口规范级)
├── competitor-analysis.md          # 竞品横向调研
├── differentiation-strategy.md     # 差异化策略
├── user-flow.md                    # 用户流程图
└── engineering-handoff.md          # 给开发的接入文档
```

---

## 部署

**GitHub Pages 自动部署**:每次 push 到 `main` 分支,GitHub Actions 自动:
1. `npm ci` 安装依赖
2. `npx msw init` 初始化 worker
3. `npm run build` 构建 production bundle
4. 上传 `dist/` 作为 Pages artifact
5. 部署到 https://baixiao8.github.io/mvp-handheld-product/

构建状态:[![Deploy](https://github.com/Baixiao8/mvp-handheld-product/actions/workflows/deploy.yml/badge.svg)](https://github.com/Baixiao8/mvp-handheld-product/actions)

---

## 给开发的衔接清单

开发拿到代码后做的 3 件事:

### 1. 拉真实 backend endpoint
编辑 `.env.local`:`VITE_USE_MOCK=false` + `VITE_API_BASE_URL=https://...`

### 2. 实现真实埋点 SDK 接入
打开 `src/tracking/index.ts`,找到 `// @TODO SDK`,替换 `sdkAdapter` 为千图AI 实际埋点(神策 / 友盟 / 自研)。12 个事件名 + props 类型完整定义,直接对接 SDK 的 `track(eventName, props)` 即可。

### 3. 替换占位资产
- `src/api/mock-handlers.ts`:3 个 SVG 模特占位图 → 真实 stock 模特照片
- `src/api/mock-handlers.ts`:生成结果 SVG → 真实算法生成图(M3 POC 验证)
- 实际生产 build:Mock 不参与 production bundle(MSW 仅 dev 模式)

更详细的 11 个对接点见 [engineering-handoff.md](./engineering-handoff.md) § 七。

---

## 关键决策

| 项 | 决策 |
|---|---|
| 主题 | **Dark Mode**(对齐 ai.58pic.com 真实风格) |
| 主色策略 | **Lime `#D8F51E`** 仅 AI 时刻 · **fg/1 黑/白** 普通 CTA · **品牌绿 `#00B277`** 仅 Logo/VIP |
| 按钮圆角 | **全 pill(9999)**(designknowledge §1.3 铁律) |
| Hero CTA | **Lime + pill + ✨ sparkles**(designknowledge §1.5) |
| Token 架构 | **三层**:Primitive → Semantic → Component(designknowledge §2 + §0.4 铁律 B) |
| Mock 策略 | **MSW 拦截 fetch** · 真假切换 = 1 行 env |

---

## 成功标准(行为指标)

| 指标 | 算法 | 阈值(达不到=砍) |
|---|---|---|
| 使用率 | 点过该功能的电商用户 / 电商总用户 | ≥10% |
| 完成率 | 完成生成 / 点过 | ≥30% |
| 复用率 | 7 天内 ≥2 次 / 用过 1 次 | ≥15% |

跑 4 周看结果:3 全过 → 投入完整版;1-2 过 → 优化再观察 2 周;全不过 → 砍。

---

## 相关文档

| 文件 | 内容 |
|---|---|
| [prd.md](./prd.md) | 接口规范级 PRD(5 API + 12 埋点 + 5 屏 UI) |
| [competitor-analysis.md](./competitor-analysis.md) | 8 竞品横向 + 4 反共识洞察 |
| [differentiation-strategy.md](./differentiation-strategy.md) | 战略定位 + 4 差异化支柱 + H1/H2/H3 路线 |
| [user-flow.md](./user-flow.md) | Mermaid 流程图 + 状态机 |
| [engineering-handoff.md](./engineering-handoff.md) | 11 对接点 + 3 周开发时间表 + 算法 POC 计划 |

---

## 迭代记录

| 阶段 | 日期 | 内容 |
|---|---|---|
| M1 战略调研 | 2026-05-26 | 8 竞品横向 + 4 洞察 + 算法盘点 |
| M2 PRD + 流程 | 2026-05-26 | 接口规范级 PRD + Mermaid 流程图 |
| M3 工程脚手架 | 2026-05-26 | engineering-handoff + TypeScript scaffold |
| 可交互原型 v1-v3 | 2026-05-26 | HTML/CSS/JS 静态原型(已移至 legacy-prototype/) |
| **M6 production MVP** | **2026-05-27** | **React + TS + Vite + Antd + MSW 真实工程 · 当前** |

---

## License

Private · 千图AI 内部项目
