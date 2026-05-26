# 手持商品 MVP · 用户流程图

> M2 第二份产出 · 2026-05-26
> PRD 中流程的视觉化版本,供前端开发对照实现

---

## 一、主流程(80% 用户走的 3 步路径)

```mermaid
flowchart TD
    Start([用户在千图AI 商品图功能页]) --> ClickTab[点击「手持版」tab]
    ClickTab --> MainPage[手持版主页]
    MainPage --> Upload[上传商品图]
    Upload -->|默认已选中模特1| ClickGen[点「生成」按钮]
    ClickGen --> CheckQuota{算力是否充足?}
    CheckQuota -->|不足| QuotaModal[算力不足弹窗]
    QuotaModal --> Recharge[跳转充值页]
    CheckQuota -->|充足| Submit[POST /generate API]
    Submit --> Loading[Loading 页 0-30s]
    Loading --> Poll[轮询 /result/:taskId]
    Poll --> CheckStatus{任务状态}
    CheckStatus -->|processing| Poll
    CheckStatus -->|success| Result[结果页]
    CheckStatus -->|failed| FailModal[失败弹窗 + 退算力]
    FailModal --> MainPage
    Result --> Action{用户操作}
    Action -->|下载| Download[下载图片]
    Action -->|再生成| ClickGen
    Action -->|保存素材库| SaveLib[保存到素材库]
    Action -->|返回| MainPage
```

---

## 二、完整流程(含高级选项,4 步路径)

```mermaid
flowchart TD
    Start([商品图功能页]) --> ClickTab[点击「手持版」tab]
    ClickTab --> MainPage[手持版主页]

    MainPage --> Upload[Section A · 上传商品图]
    Upload --> SelectModel[Section B · 选模特<br/>默认模特1]
    SelectModel --> Expand{是否展开高级选项?}

    Expand -->|否| ClickGen[点生成]
    Expand -->|是| AspectRatio[选输出尺寸<br/>默认 1:1]
    AspectRatio --> HDEnhance[选高清放大<br/>默认关]
    HDEnhance --> ClickGen

    ClickGen --> CheckQuota{算力充足?}
    CheckQuota -->|否| QuotaModal[弹窗+充值]
    CheckQuota -->|是| Submit[POST /generate]
    Submit --> Loading[Loading]
    Loading --> Poll{轮询状态}
    Poll -->|success| Result[结果页]
    Poll -->|failed| FailModal[失败+退算力]
    Poll -->|cancelled| MainPage

    Result --> End([完成])
```

---

## 三、异常流程

```mermaid
flowchart TD
    Trigger[操作触发] --> Check{异常类型}

    Check -->|文件 >10MB| TooLarge[红色提示<br/>请压缩后重试]
    Check -->|格式不支持| BadFormat[红色提示<br/>请上传 JPG/PNG/WEBP]
    Check -->|尺寸 <512px| TooSmall[红色提示<br/>图片过小]
    Check -->|算力不足| LowQuota[Modal<br/>余额X 算力,需充值]
    Check -->|网络中断| NetError[Toast<br/>自动重试 3 次]
    Check -->|算法失败| AlgoFail[Modal<br/>已退算力,可重试]
    Check -->|并发超限| TooMany[Toast<br/>上一个还在生成]
    Check -->|超时 60s| Timeout[Modal<br/>主动取消+退算力]

    TooLarge --> Retry[重新操作]
    BadFormat --> Retry
    TooSmall --> Retry
    LowQuota --> Recharge[去充值]
    NetError --> AutoRetry[自动重试]
    AlgoFail --> Retry
    Timeout --> Retry
```

---

## 四、屏幕状态机

每个屏幕的所有状态及切换条件:

### 屏 2 · 手持版主页 状态机

```mermaid
stateDiagram-v2
    [*] --> 初始空状态
    初始空状态 --> 已上传商品: 上传成功
    已上传商品 --> 已选模特: 用户选模特(默认进入即已选)
    已选模特 --> 高级选项展开: 点击高级选项
    高级选项展开 --> 已选模特: 收起
    已选模特 --> 提交生成: 点生成按钮
    提交生成 --> 算力检查中: 调 API-4
    算力检查中 --> 提交任务: 余额充足
    算力检查中 --> 算力不足: 余额不足
    算力不足 --> 充值中: 用户去充值
    算力不足 --> 已选模特: 用户取消
    充值中 --> 提交生成: 充值成功
    提交任务 --> [*]: 跳转 Loading 页
```

### 屏 3 · Loading 页 状态机

```mermaid
stateDiagram-v2
    [*] --> 任务排队中
    任务排队中 --> 算法生成中: status=processing
    算法生成中 --> 后处理中: progress >= 80%
    后处理中 --> 完成: status=success
    后处理中 --> 失败: status=failed
    任务排队中 --> 用户取消: 用户点取消
    算法生成中 --> 用户取消: 用户点取消
    完成 --> [*]: 跳转结果页
    失败 --> [*]: 弹失败 Modal
    用户取消 --> [*]: 返回主页
```

---

## 五、路径分析(数据团队备用)

### 期望路径分布

| 路径 | 步数 | 预期占比 | 备注 |
|---|---|---|---|
| **默认 3 步**(上传→默认模特→生成) | 3 | **70%** | 主流程,不操作模特和高级选项 |
| 4 步(默认+换模特) | 4 | 20% | 用户主动切换模特 |
| 4 步(默认+换尺寸) | 4 | 8% | 用户展开高级选项调尺寸 |
| 5 步(全自定义) | 5 | 2% | 既换模特又换尺寸,可能再开 HD |

### 监控:如果实际路径分布严重偏离

- "默认 3 步"占比 <40% → 默认值有问题(模特不好看?默认尺寸不对?)
- "高级选项展开率">30% → 默认设置不够好,用户被迫展开
- "再生成率">20% → 单次出图质量不行,用户在反复尝试

---

## 六、关键决策点(给开发的提示)

| 决策 | MVP 规则 | 反例 |
|---|---|---|
| 模特默认选中 | 第 1 个,API 返回 `isDefault: true` 的那个 | ❌ 让用户必须主动选,会损失 30% 完成率 |
| 上传完是否自动滚到下一段 | **否**,保持上下滚由用户决定 | ❌ 自动滚体验跳脱 |
| 生成按钮是否常驻 | 是,fixed 在底部或卡片底 | ❌ 隐藏在折叠区 |
| 高级选项默认 | 收起 | ❌ 展开会让默认 3 步变 5 步 |
| 失败后是否自动重试 | 后端自动重试 1 次,前端不重试 | ❌ 前端重试会重复扣算力 |
| Loading 页能否关闭 | 不能直接关,但能取消(扣算力) | ❌ 允许关闭会留下"幽灵任务" |

---

## 七、本文档迭代记录

| 日期 | 版本 | 更新内容 |
|---|---|---|
| 2026-05-26 | v0.1 | M2 初稿:主流程+完整流程+异常流程+状态机+路径分析 |
