# 手持商品 MVP · 工程接入文档

> M3 第一份产出 · 2026-05-26
> 输入:`prd.md` + `user-flow.md`
> 输出:开发可以直接接入千图AI 主仓的具体指南 + 代码骨架(`scaffold/`)

---

## TL;DR(给开发的一页摘要)

| 项 | 内容 |
|---|---|
| **开发周期** | 3 周(W1 算法 POC / W2 工程化 / W3 接入灰度) |
| **前端分支** | `feature/handheld-product-mvp`(千图AI 前端单仓) |
| **后端服务** | 复用现有 AI 算法服务,新增 5 个 API endpoint(见 PRD § 5) |
| **新增前端文件** | ~10 个 React 组件 + 1 个 API client + 1 个 tracking adapter |
| **算法底模** | W1 完成 Seedream 4.5 vs Flux.2 pro POC,过 7/10 分胜出者进入 W2 |
| **不在范围** | 移动端深度优化 / 多语言 / A/B test / 高级 ML 指标 |
| **代码骨架** | `scaffold/` 子目录有可直接 copy 的 TypeScript 文件 |

---

## 一、工程范围与边界

### 在范围内(Must Do)

| # | 工作项 | 责任方 |
|---|---|---|
| 1 | 前端:5 屏 UI 实现(入口 / 主页 / Loading / 结果 / 错误) | 前端 |
| 2 | 前端:与现有商品图功能页 tab 系统集成 | 前端 |
| 3 | 前端:埋点 12 个事件接入现有埋点 SDK | 前端 |
| 4 | 前端:与现有上传组件 / 充值流程集成 | 前端 |
| 5 | 后端:5 个 API endpoint 实现 | 后端 |
| 6 | 后端:算力扣费 + 失败退还机制 | 后端 |
| 7 | 后端:与现有 AI 算法服务对接 | 后端 |
| 8 | 算法:Seedream 4.5 vs Flux.2 pro 的 POC + 微调 | 算法 |
| 9 | 算法:模特 stock 素材的预处理(背景去除 / 姿势固化) | 算法 |
| 10 | QA:验收 + 灰度数据观察 | QA + 数据 |

### 不在范围(Won't Do)

- ❌ 移动端深度优化(MVP 仅保证可用)
- ❌ 多语言(中文 only)
- ❌ A/B test 框架(MVP 直接灰度,不分组对比)
- ❌ 高级 ML 指标(出图美学评分等,留 H2)
- ❌ 用户自定义模特上传(战略决策)
- ❌ 参照物校准(H2 完整版)

---

## 二、仓库与分支策略

### 前端

| 项 | 配置 |
|---|---|
| 仓库 | 千图AI 前端单仓(具体 GitLab/GitHub URL · **TBD,开发确认**) |
| 主分支 | `main`(假设) |
| 功能分支 | `feature/handheld-product-mvp` |
| 合并策略 | feature → develop → main,Squash merge |
| Code review | ≥1 人 approve + CI 全过 |

### 后端

| 项 | 配置 |
|---|---|
| 仓库 | 千图AI AI 算法服务仓(部分微服务架构) |
| 功能分支 | `feature/handheld-product-api` |
| 服务部署 | 复用现有 AI 算法服务 pod,不新建服务 |

---

## 三、目录结构(在千图AI 前端仓里加什么)

> **假设是 React + TypeScript 项目结构。如果用 Vue,等比平移**

```
src/
├── pages/
│   └── product-image/                   # 千图AI 现有商品图功能页
│       ├── tabs/
│       │   ├── WhiteBackground.tsx      # 现有 tab
│       │   ├── Scene.tsx                # 现有 tab
│       │   └── Handheld.tsx             # 🆕 新增 tab,作为入口
│       └── index.tsx                    # 更新:在 tab 列表注册 Handheld
│
├── features/
│   └── handheld-product/                # 🆕 全新功能模块
│       ├── components/
│       │   ├── HandheldMain.tsx         # 主页
│       │   ├── ProductUpload.tsx        # 上传商品图
│       │   ├── ModelPicker.tsx          # 模特选择(3 张卡)
│       │   ├── AdvancedOptions.tsx      # 高级选项折叠
│       │   ├── GenerateButton.tsx       # 生成 CTA(显示算力消耗)
│       │   ├── LoadingModal.tsx         # Loading 弹窗
│       │   ├── ResultPage.tsx           # 结果页
│       │   └── ErrorModal.tsx           # 错误弹窗
│       ├── hooks/
│       │   ├── useGenerate.ts           # 生成任务封装(提交+轮询)
│       │   ├── useQuotaCheck.ts         # 算力检查
│       │   └── useModelList.ts          # 模特列表
│       ├── api/
│       │   └── handheld-client.ts       # API client(见 scaffold/api-client.ts)
│       ├── tracking/
│       │   └── tracking.ts              # 12 个埋点(见 scaffold/tracking.ts)
│       ├── types/
│       │   └── index.ts                 # TypeScript 类型(见 scaffold/types.ts)
│       └── index.ts                     # 模块导出
│
└── shared/
    └── ... (复用千图AI 现有的上传组件、充值组件、Modal 组件等)
```

**关键原则**:
- 所有新增代码集中在 `src/features/handheld-product/`,**禁止**散落到其他目录
- 与 `src/pages/product-image/` 的交互通过 `Handheld.tsx` 这一个文件,降低耦合
- 复用千图AI 现有 shared 组件(上传、Modal、Toast 等),**不重新造轮子**

---

## 四、关键依赖

### 复用千图AI 现有

| 依赖 | 用途 | 风险 |
|---|---|---|
| 现有 JWT 鉴权 | API 调用 | 低 |
| 现有上传组件 | Section A 上传 UI | 低 |
| 现有充值跳转 | 算力不足时跳转 | 低 |
| 现有 Modal / Toast / Button 组件 | 各种弹窗和按钮 | 低 |
| 现有埋点 SDK | 12 个事件上报 | **中**(SDK 名 TBD) |
| 现有算力查询 / 扣费接口 | API-4 实现 | **中**(可能要新建,TBD) |

### 新增依赖(评估后决定)

| 依赖 | 用途 | 是否引入 |
|---|---|---|
| `react-query` 或现有数据流方案 | 轮询任务结果 | 看现有方案,优先复用 |
| `react-dropzone` | 拖拽上传(如现有组件不支持) | 看现有上传组件 |
| 无需新加 ML/AI 前端库 | 全部走 API,前端无 ML | — |

**原则**:**MVP 阶段不引入新的重依赖**,能复用现有就复用。

---

## 五、算法 POC 计划(W1 Day1-3 · 最关键)

### Why this matters

**算法出图质量是 MVP 的 #1 决定因素**。如果 W1 跑不出消费级质量,后面 PRD 工程化都是空中楼阁。**Day1 跑不通,Day2 立刻反馈,不要硬撑**。

### POC 方案

| 候选模型 | 优势 | 路径 |
|---|---|---|
| **Seedream 4.5** | 字节系,商品摄影专长,国产合规 | 通过字节火山引擎 API 或私有部署 |
| **Flux.2 pro** | 写实质感顶级,LoRA 生态成熟 | BFL API 或私有部署 |
| 备选:Qwen-Image Max | 阿里系,API 友好 | 阿里云百炼 |

### POC 流程(3 天)

**Day1 · 跑通基础生成**
- [ ] 准备 10 张测试商品图(化妆品/3C 小件/快消各 3-4 张)
- [ ] 准备 3 张 stock 模特图(MVP 用,临时找 unsplash 或类似站点)
- [ ] Seedream 4.5 跑 10 张,每张 3 次生成,看一致性
- [ ] Flux.2 pro 同上
- [ ] 输出对比表:质量、速度、成本

**Day2 · 微调 prompt + 关键参数**
- [ ] 调 prompt 模板,确保:模特手部自然、商品大小合理、光照统一
- [ ] 调 ControlNet / IP-Adapter 强度(如适用)
- [ ] 输出"调优后"对比表

**Day3 · 盲评 + 决策**
- [ ] 找 2-3 个真实电商用户做盲评(各打 10 张分,1-10 分)
- [ ] 取平均分,**胜出者必须过 7/10 分**才进 W2 工程化
- [ ] 若两个都不过 → 立即升级评估更强模型(Seedream 5.0 / Flux.2 pro max) 或推迟 MVP

### POC 验收标准

| 维度 | 阈值 |
|---|---|
| 出图美感(盲评) | ≥7/10 |
| 手部解剖正确率(无 6 根指头等) | ≥90% |
| 商品保留度(纹理 / 文字清晰) | ≥85% |
| 单次生成时延 | ≤30s |
| API 单次成本(算力账) | ≤千图AI 现有商品图功能成本的 2x |

### POC 输出物

- `poc-results.md`(放在 `scaffold/poc/` 下)
- 10 张商品 × 2 模型 × 3 次 = 60 张对比图(目录 `scaffold/poc/images/`)
- 盲评打分表(Excel/Sheets)
- 最终建议:Seedream 4.5 / Flux.2 pro / 推迟

---

## 六、代码骨架(scaffold/ 子目录)

`scaffold/` 子目录提供 4 个可直接 copy 到主仓的参考文件:

| 文件 | 用途 | 完成度 |
|---|---|---|
| `scaffold/types.ts` | 5 个 API 的完整 TS 类型 + 错误码 enum | 100%,可直接 copy |
| `scaffold/api-client.ts` | API client 类,含轮询逻辑 | 80%,需替换 BASE_URL / 鉴权 |
| `scaffold/tracking.ts` | 埋点 adapter,12 个事件方法 | 80%,需对接现有埋点 SDK |
| `scaffold/README.md` | scaffold 使用说明 | 100% |

**开发交付时,把 scaffold/ 内的文件 copy 到主仓的对应位置**:
- `scaffold/types.ts` → `src/features/handheld-product/types/index.ts`
- `scaffold/api-client.ts` → `src/features/handheld-product/api/handheld-client.ts`
- `scaffold/tracking.ts` → `src/features/handheld-product/tracking/tracking.ts`

---

## 七、接入清单(11 个对接点)

每一项都是和千图AI 现有系统的对接,**开发必须逐项确认**:

| # | 对接点 | 与什么对接 | 提问 / 任务 |
|---|---|---|---|
| 1 | 鉴权 | 现有 JWT 系统 | token 在 header 还是 cookie?怎么取? |
| 2 | API Gateway | 现有网关 | `/api/v1/handheld/*` 路由怎么注册? |
| 3 | 上传 | 现有上传 API | 复用还是新建?(PRD API-5 是新建,如可复用最好) |
| 4 | 算力查询 | 现有算力体系 | 是否已有"查余额"接口?字段格式? |
| 5 | 算力扣费 | 现有算力扣费 | 是否支持"按任务粒度扣 + 失败退还"? |
| 6 | 充值跳转 | 现有充值页 | 跳转 URL?携带 query 参数?返回路径? |
| 7 | Tab 注册 | 现有商品图页 | 怎么往 tab 列表加新 tab?是否有 manifest? |
| 8 | 埋点 SDK | 现有埋点 | SDK 名(神策/友盟/自研)?API 调用方式? |
| 9 | 用户标签 | 现有用户系统 | "电商用户"标签字段名?枚举值? |
| 10 | 算法服务 | 现有 AI 算法服务 | 调用方式?同步还是任务队列? |
| 11 | CDN | 现有 CDN | 生成结果存哪个 bucket?访问 URL 规则? |

**M3 开工 Day1 第一件事**:开发拉一个 30 分钟会议,把这 11 个对接点一次性问清楚后端 + 算法 + 数据团队,**不要边写边问**。

---

## 八、3 周开发时间表

### Week 1 · 算法 POC + 基础工程

| Day | 前端 | 后端 | 算法 |
|---|---|---|---|
| Day 1 | 拉分支,搭目录结构 | 11 个对接点 kickoff 会议 | POC Day1 - 跑基础生成 |
| Day 2 | 实现 types + api-client(从 scaffold copy) | 跑通 API-1 / API-4(只读) | POC Day2 - 调参 |
| Day 3 | 实现埋点 adapter | 跑通 API-2 / API-3 | POC Day3 - 盲评决策 |
| Day 4 | 实现 HandheldMain + ProductUpload | API-5(如需新建) | 落地胜出模型 |
| Day 5 | 实现 ModelPicker + AdvancedOptions | 联调 API-2 + 算力扣费 | 模特 stock 素材预处理 |

### Week 2 · 主流程联调 + 异常处理

| Day | 前端 | 后端 | 算法 |
|---|---|---|---|
| Day 6-7 | 实现 LoadingModal + 轮询逻辑 | 优化生成时延 + 失败重试 | LoRA 微调(如需) |
| Day 8-9 | 实现 ResultPage + 下载 + 再生成 | 完善错误码 + 退算力 | — |
| Day 10 | 实现 ErrorModal + 边界处理 | 性能测试(并发 + SLA) | 算法 SLA 调优 |

### Week 3 · 接入主页 + 灰度

| Day | 前端 | 后端 | QA |
|---|---|---|---|
| Day 11 | 在商品图页注册 tab | 后端 Code Review | QA 测试用例编写 |
| Day 12 | 全链路联调 | bug 修复 | 内测 10 人(2 天) |
| Day 13 | Bug 修复 + 性能优化 | 监控 + 告警接入 | 内测验收 |
| Day 14 | 部署灰度 10% | 灰度后端发布 | 灰度数据观察 |
| Day 15 | 灰度数据观察 + 文档归档 | — | 出灰度报告 |

---

## 九、测试策略

### 单元测试(必做)

| 模块 | 覆盖率目标 |
|---|---|
| `api/handheld-client.ts` | ≥80% |
| `hooks/useGenerate.ts` | ≥80% |
| `hooks/useQuotaCheck.ts` | ≥80% |
| `tracking/tracking.ts` | ≥70% |

### 集成测试(必做)

- 主流程 happy path(上传 → 生成 → 下载)
- 算力不足场景
- 上传失败场景
- 生成失败场景(模拟后端 500)
- 轮询超时场景

### E2E 测试(灰度前必做)

| 场景 | 验证点 |
|---|---|
| 完整跑通主流程 | 3 步默认路径能出图 |
| 高级选项流程 | 4 步路径能出图 |
| 切换模特 | 状态切换正确 |
| 切换尺寸 | 输出尺寸符合 |
| 算力不足 | 弹窗 + 充值跳转 |
| 生成失败 | 退算力 + 提示 |
| 再生成 | 算力再次扣 |
| 下载 | 文件命名 + 格式正确 |

### 性能测试(灰度前必做)

- 单用户连续生成 5 次,确保无内存泄漏
- 50 并发用户提交生成任务,后端能否正确排队
- 上传 10MB 大图,确保不卡死

---

## 十、上线流程

| 阶段 | 行为 | 通过条件 |
|---|---|---|
| 1. 内测 | 团队 + 10 KOL 商家 | 主流程跑通,出图美感盲评 ≥7 |
| 2. 灰度 10% | 仅电商用户标签的 10% | 失败率 <5%,SLA 达标 |
| 3. 灰度 50% | 扩到 50% 电商用户 | 3 个核心指标趋势稳定 |
| 4. 全量 | 100% 电商用户 | 进入 4 周观察期 |
| 5. 决断 | M1 战略文档定义的阈值 | 3 指标全过 → 进 H2 |

**回滚条件**:
- 失败率 >10% → 立即回滚
- 出图质量集体投诉 → 限流 + 算法回滚
- 算力异常消耗(同用户单日 >100 算力) → 限流

---

## 十一、已知风险

| # | 风险 | 应对 |
|---|---|---|
| 1 | W1 算法 POC 不过 7/10 分 | 升级模型 / 推迟 MVP / 砍项目,**Day3 必须决断** |
| 2 | 现有算力体系不支持"按任务扣 + 失败退还" | M3 Day1 对接会议确认,如不支持需后端改造 |
| 3 | 千图AI 现有埋点 SDK 不灵活,埋点字段对不上 | tracking adapter 抽象层适配 |
| 4 | 商品图功能页 tab 系统不允许动态注册 | 提前查源码,如需改造提前协调 |
| 5 | 算法 API 单次成本高于预期 | 商业团队调整 12 算力的定价或砍 HD 增强 |
| 6 | 移动端 tab 显示溢出 | MVP 不深度优化,但要确保不破版 |

---

## 十二、开发 Day1 必做清单(开发同学拿到 PRD 第一天)

✅ **第一小时**:
- [ ] 拉 `feature/handheld-product-mvp` 分支
- [ ] 创建 `src/features/handheld-product/` 目录结构
- [ ] Copy `scaffold/types.ts` / `scaffold/api-client.ts` / `scaffold/tracking.ts` 到对应位置

✅ **第一天**:
- [ ] 召集 11 个对接点 kickoff 会议(后端 + 算法 + 数据)
- [ ] 把对接点确认结果写到 `engineering-handoff.md` § 七的对应行
- [ ] 起算法 POC(Day1 任务)

✅ **第一周末**:
- [ ] 算法 POC 决策结论(过 7/10 还是不过?)
- [ ] 前端 types + api-client + tracking 跑通
- [ ] 后端 API-1 / API-4 上线(只读接口,先放出来联调)

---

## 十三、给开发的提示(避免常见坑)

| # | 坑 | 避坑 |
|---|---|---|
| 1 | 用 `setInterval` 轮询不清理 | 用 react-query / SWR 内置轮询;手写一定要在 unmount 清理 |
| 2 | 算力扣两次(并发问题) | 后端要做幂等;前端按钮 loading 期间禁用 |
| 3 | 上传组件没限制并发 | 同一时刻只允许 1 个上传 in-flight |
| 4 | 埋点漏报(用户快速关页面) | 关键事件用 `navigator.sendBeacon` |
| 5 | 模特列表硬编码在前端 | 必须走 API-1,后端配置,避免改模特要发版 |
| 6 | 错误码处理散落各处 | 集中在 api-client 的 errorHandler,统一映射文案 |
| 7 | 算力余额前端缓存太久 | 每次生成前实时查,不缓存 |
| 8 | 结果页大图不做 placeholder | 用 blur-up 或 skeleton,否则页面跳动差 |
| 9 | 移动端 tab 横向溢出 | 用 `overflow-x: auto + scrollbar-hide`,不强制换行 |
| 10 | i18n 文案硬编码中文 | MVP 中文 only,但用 `t('handheld.upload.title')` 包,以备 H2 国际化 |

---

## 十四、本文档迭代记录

| 日期 | 版本 | 更新内容 |
|---|---|---|
| 2026-05-26 | v0.1 | M3 初稿:11 个对接点 + 3 周时间表 + 算法 POC 计划 + scaffold/ 引用 |
