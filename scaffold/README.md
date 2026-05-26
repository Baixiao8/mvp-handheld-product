# scaffold/ — 代码骨架(参考实现)

> 给千图AI 前端开发的「可直接 copy 的参考代码」。**这不是产品代码**,是按 PRD 规范的 TypeScript 实现模板,开发拷到主仓后,根据现有项目的具体方案(鉴权 / 埋点 SDK / 状态管理)调整即可。

---

## 文件清单

| 文件 | 用途 | 主仓目标位置 | 完成度 |
|---|---|---|---|
| `types.ts` | 5 个 API 的完整 TypeScript 类型 + 错误码 + 埋点事件类型 | `src/features/handheld-product/types/index.ts` | ✅ 100% |
| `api-client.ts` | API client 类,含轮询、错误处理 | `src/features/handheld-product/api/handheld-client.ts` | 🟡 80%(需替换 BASE_URL + 鉴权) |
| `tracking.ts` | 12 个埋点事件的 adapter | `src/features/handheld-product/tracking/tracking.ts` | 🟡 80%(需对接现有埋点 SDK) |

---

## 使用方式

### 1. 拷贝文件到主仓

```bash
# 在千图AI 前端仓的 feature/handheld-product-mvp 分支上
mkdir -p src/features/handheld-product/{api,tracking,types,components,hooks}

# 直接 copy
cp <design-repo>/mvp-handheld-product/scaffold/types.ts \
   src/features/handheld-product/types/index.ts

cp <design-repo>/mvp-handheld-product/scaffold/api-client.ts \
   src/features/handheld-product/api/handheld-client.ts

cp <design-repo>/mvp-handheld-product/scaffold/tracking.ts \
   src/features/handheld-product/tracking/tracking.ts
```

### 2. 必须改的地方(标记为 `// @TODO`)

**`api-client.ts`**:
- 第 1 处 `// @TODO BASE_URL`:换成千图AI 实际 API 网关地址
- 第 2 处 `// @TODO auth`:换成千图AI 实际鉴权方式(JWT header / Cookie)
- 第 3 处 `// @TODO error mapping`:错误码 → 文案的映射,可能要本地化

**`tracking.ts`**:
- 第 1 处 `// @TODO SDK`:替换成千图AI 实际埋点 SDK(神策 `sensorsdata.track()` / 友盟 `aplus_queue.push()` / 自研)
- 第 2 处 `// @TODO user props`:用户标签(`isEcommerceUser`)的取值方式

### 3. 测试验证

```bash
# 拷完后跑单元测试
yarn test src/features/handheld-product/
```

---

## 不要做的事(常见误区)

| ❌ 不要 | ✅ 要 |
|---|---|
| 把 `scaffold/` 整个 import 进项目 | 文件逐个 copy 到对应位置 |
| 直接用 `BASE_URL = 'https://api.qiantu.ai/...'` | 通过环境变量 `process.env.API_BASE_URL` |
| 把 12 个埋点写死成 console.log | 通过 adapter 接千图AI 真实埋点 SDK |
| 把 polling interval 写死 1000ms | 通过 config 暴露(便于压测时调) |
| 把模特列表硬编码进前端 | **必须**走 API-1,后端配置 |

---

## scaffold 与产品代码的关系

```
┌──────────────────────────────────────────────────────────┐
│  scaffold/  (本目录)                                       │
│  ├─ types.ts     ──┐                                      │
│  ├─ api-client.ts ─┤  → copy + 修改 // @TODO 标记          │
│  └─ tracking.ts  ──┘                                      │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│  千图AI 前端单仓 feature/handheld-product-mvp 分支         │
│  src/features/handheld-product/                          │
│  ├─ types/index.ts          ← 从 scaffold/types.ts        │
│  ├─ api/handheld-client.ts  ← 从 scaffold/api-client.ts   │
│  ├─ tracking/tracking.ts    ← 从 scaffold/tracking.ts     │
│  ├─ components/             ← 由开发实现(参考 PRD § 4)    │
│  └─ hooks/                  ← 由开发实现                    │
└──────────────────────────────────────────────────────────┘
```

---

## 设计原则

1. **类型先行**:`types.ts` 是真理来源,所有 API/事件必须经过这里的类型校验
2. **错误集中处理**:`api-client.ts` 内部统一映射错误码 → 用户友好文案
3. **埋点解耦**:`tracking.ts` 是 adapter,业务代码调用 `track.handheldGenerateClick(...)` 即可,不感知底层 SDK
4. **可测试性**:所有方法都是纯函数或可注入依赖的 class,便于 mock 单测

---

## 反馈与改动

如果开发过程中发现 scaffold 有问题(类型不对、API 不实际、缺少场景),**直接改千图AI 主仓**,同步把改动反馈给产品(白笑),设计文档(本目录)再 sync 修订。

**不要试图保持 scaffold 和主仓代码长期同步** — scaffold 的使命就是"被 copy 一次,然后让位给真实产品代码"。
