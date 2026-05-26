# 手持商品 MVP · 竞品深度调研

> M1 第一份产出 · 2026-05-26
> 输入:8 个竞品调研 · 横向对比 · 算法底座盘点
> 输出 → `differentiation-strategy.md`

---

## TL;DR(60 秒看完)

1. **"手持商品图"在海外是已被验证的垂直赛道**:5+ 个产品在做(Photta、SellerPic、Krea.ai、ImagineArt、Dresma),且明确指向电商核心痛点 — 减少 #1 退货原因"看起来跟实物不一样"
2. **国内目前只有万相营造做这个**:其他 5 个主流国产 AI 图工具(美图设计室 / 稿定 / 即梦 / Lovart / 爱创)都在做"AI 模特换装"或"AI 产品图背景生成",没有专做手持商品 — **相对蓝海**
3. **两种产品形态对立**:**用户上传模特**(Krea.ai 派,灵活但门槛高)vs **预设模特库**(万相/SellerPic 派,即开即用但要做库)。中国电商商家偏好后者
4. **算法已经够用**:Seedream 4.5 / Flux.2 pro / Qwen-Image Max 三家都能跑出消费级质量的"手持商品图",MVP 不需要自训
5. **MVP 差异化的最大机会**:做"参照物校准 + 中国本土化模特库"的组合 — 海外都没做参照物,万相做了但模特和姿势都很重

---

## 一、市场全景

### 海外格局(已验证的垂直赛道)

| 产品 | 定位 | 模特来源 | 卖点 |
|---|---|---|---|
| **Krea.ai** · hold-product | 全功能 AI 图工具的子功能 | 用户上传 | 自动分析手部姿势,3 步生成 |
| **SellerPic** · product-in-hand | 专门做 hand model | 预设库(规模未披露) | 主打珠宝/美妆/配饰 |
| **Photta** | 全栈电商图工具 | 不确定 | 30 秒生成 2 张 |
| **ImagineArt** · make-people-hold-product | 通用 AI 图工具子功能 | 用户上传 | 分析手部位置/透视/光照 |
| **Dresma** · hand-model | 专业 hand model 工具 | 预设库 | 批量处理 + 多 hand pose |

### 国内格局(手持商品基本空白)

| 产品 | 主打方向 | 做不做手持? |
|---|---|---|
| **万相营造**(阿里通义) | 综合电商 AI 图(含模特换装、商品图、手持商品) | ✅ 做 — 唯一对标 |
| **美图设计室** | AI 模特换装、商拍 | ❌ 没专做 |
| **稿定设计** | 国内电商模板 + AI 生图 | ❌ 没专做 |
| **即梦 AI**(字节) | 4K 商品/模特图 | ❌ 没专做 |
| **Lovart** | AI 模特图(降本增效) | ❌ 没专做 |
| **爱创 AI** | 基于平台爆款数据的模特图 | ❌ 没专做 |

**关键结论**:国内"手持商品"垂直功能只有阿里一家。如果千图AI 的 MVP 跑通,将是中国第二家专做这个的产品。

---

## 二、竞品横向对比表(关键维度)

| 维度 | 万相营造 | Krea.ai | SellerPic | Photta | 千图AI MVP(预期) |
|---|---|---|---|---|---|
| **定位** | 综合电商 AI 工具的子功能 | 通用 AI 工具的子功能 | 专做 hand model | 全栈电商图 | 商品图功能的子 tab |
| **模特来源** | **预设库**(自由模特+具名模特) | 用户上传 | 预设库 | 不明 | **3 个 stock 模特**(MVP) |
| **模特数** | 20+(从截图估算) | N/A(用户提供) | 未披露 | 未披露 | **3**(MVP) |
| **具名模特** | ✅ 有(娴馨、宁瑶、娅娅 等) | ❌ | ❌ | ❌ | ❌(MVP 不做) |
| **姿势模板** | 8+(端摆×4 + 提捏×4 + 握持×4) | ❌ 自适应 | 有库,数量未披露 | 不明 | **1 个**(MVP) |
| **参照物校准** | ✅(口红/可乐瓶/面包机) | ❌ | ❌ | ❌ | ❌(MVP)→ 完整版加 |
| **输出尺寸** | 1:1, 3:4, 2:3 | 未披露 | 未披露 | 不明 | **1:1, 3:4, 2:3**(对齐万相) |
| **上传格式** | 不明 | PNG/JPG/WEBP/HEIC/HEIF/AVIF | JPG/PNG, 512-2048px, <10MB | 不明 | **JPG/PNG/WEBP, ≤10MB**(对齐主流) |
| **计费** | 算力值(12/次) | Freemium | Pay as you go | 不明 | **算力值,数额 TBD** |
| **生成速度** | 不明(估算 15-30s) | "seconds" | 不明 | 30s | **目标 ≤30s** |
| **工作流步数** | ~6 步(尺寸→参照→姿势→模特→上传→生成) | 3 步 | 不明 | 不明 | **3-4 步**(MVP 优先减步) |
| **主打品类** | 美妆/护肤/小家电 | 通用 | 珠宝/美妆/小配饰 | 通用电商 | **化妆品/快消品/3C 小件** |
| **入口** | 万相营造站内 tab | Krea.ai 工具页 | sellerpic.ai 独立站 | photta.app 独立站 | **千图AI 商品图功能页 tab** |
| **算法底座** | 通义万相 wan2.6 | 不明 | 不明 | 不明 | **复用现有 + 评估 Seedream/Qwen** |

---

## 三、两大产品形态:用户上传 vs 预设模特库

这是手持商品工具最根本的产品决策。两种路线优劣分明:

| 维度 | 用户上传模特(Krea.ai 派) | 预设模特库(万相/SellerPic 派) |
|---|---|---|
| **用户成本** | 高 — 用户需自找模特图/AI 影响者图 | 低 — 即开即用,点几下出图 |
| **运营成本** | 极低 — 不维护模特库 | 高 — 模特授权 + 持续扩充 |
| **法律/合规风险** | 低 — 模特素材由用户提供 | 高 — 需肖像权授权,涉及《个保法》 |
| **灵活性** | 极高 — 任何人脸都行 | 受限 — 只能用库内模特 |
| **品牌一致性** | 差 — 每次不同人 | 强 — 同一系列商品可用同一模特 |
| **适合谁** | 设计师/创作者/有素材的中型品牌 | 中小电商商家(主流) |

**MVP 决策**:
- 用 **3 个 stock 模特(预设库轻量版)** — 走万相路线,但起步轻
- 暂不开"用户上传模特"功能(Krea 派),等数据决定要不要扩
- 理由:中国中小电商商家(千图AI 核心用户)就要"傻瓜式",Krea.ai 那种"先找一张模特图"的门槛会直接劝退 80% 用户

---

## 四、算法底座对比(2026 最新)

千图AI MVP 应该选什么底模?这一节决定 M3 的 POC 跑哪个。

| 模型 | 厂商 | 优势 | 评分 | 建议 |
|---|---|---|---|---|
| **Seedream 5.0 Preview** | 字节 | 推理 + Web search,综合最强 | 顶级 | ⚠️ 太重,MVP 不必 |
| **Seedream 4.5** | 字节 | 写实人像+商品摄影,细节保留好 | 1141 | ✅ **优先评估**(适合手持商品场景) |
| **Flux.2 pro** | Black Forest Labs | 写实质感强 | 顶级 | ✅ **优先评估**(LoRA 生态成熟) |
| **Qwen-Image Max** | 阿里 | 文字渲染 + 精确编辑(autoregressive LLM 架构) | 1139 | 🟡 备选(对手持场景不一定最优) |
| **Flux.1 Kontext** | BFL | 开源 + LoRA 友好 | 中上 | 🟡 备选(自训成本低) |
| **Nano Banana Pro** | Google? | 4K + 速度平衡 | 顶级 | 🟡 备选 |
| **GPT Image 1.5** | OpenAI | 阶梯定价,API 友好 | 顶级 | ❌ 数据出境合规问题 |

**M3 POC 计划**:
1. **首选**:Seedream 4.5(国产+合规+商品摄影专长)
2. **对比**:Flux.2 pro 或 Flux.1 Kontext(开源生态)
3. **POC 标准**:跑 10 张测试图(化妆品/3C/快消各 3 张),让 2-3 个电商用户盲评打分,过 7/10 分进入工程化

---

## 五、4 个关键洞察(给千图AI 的启发)

### 洞察 1 · 海外验证了需求,国内只有阿里在做

> 5 个海外产品 + 1 个国内产品(万相)= 这是真需求,不是伪命题。但国内除阿里外的 5 个国产 AI 图工具都没专做,说明:**技术门槛是真存在的**,不是随便能抄。

**应用**:MVP 跑通了,千图AI 就是中国第二家。这个时间窗口大概 6-12 个月,过后会有更多人挤进来。

### 洞察 2 · "参照物校准"是海外所有人都没做,但商业价值最大的功能

> 海外 5 个手持商品产品**没一个做参照物**。但搜索结果明确指出:"size reference shots reduce the #1 cause of returns: it looked different in person"。这是个被遗漏的真正高 ROI 功能。

**应用**:MVP 不做(已砍),**但完整版要做** — 这是千图AI 超越万相和海外所有竞品的关键差异化点。

### 洞察 3 · 工作流步数是核心战场

> Krea.ai 3 步(上传人 → 上传产品 → 生成),万相 6 步(尺寸 → 参照 → 姿势 → 模特 → 上传 → 生成)。**对中小商家,步数 = 转化漏斗**。

**应用**:MVP 必须 **3-4 步内完成**。可以默认选项 + 高级选项折叠的方式 — 用户不点高级,就走 3 步路径。

### 洞察 4 · 算法不是 MVP 瓶颈,产品形态才是

> 2026 年的算法(Seedream / Flux / Qwen)都已经能跑出消费级质量。MVP 失败大概率不是因为算法,而是:模特库选错 / 入口埋错 / 工作流太长。

**应用**:M3 POC 不必纠结算法选型,挑两个国产模型快速对比即可。把精力放在产品形态(模特、姿势、入口、工作流)。

---

## 六、TBD(待用户/团队补充)

| # | 信息 | 谁来补 | 何时 |
|---|---|---|---|
| 1 | 万相营造手持商品的实际计费(12 算力 = 多少人民币?) | 白笑(登录万相站内查) | M2 启动前 |
| 2 | 万相手持商品的具体生成速度(实测) | 白笑 / 测试同事 | M2 启动前 |
| 3 | 千图AI 现有商品图功能的月活/付费用户构成 | 数据团队 | M2 启动前 |
| 4 | 千图AI 现有 AI 算法服务支持的底模列表 | 算法团队 | M3 启动前 |
| 5 | 千图AI 算力计费的内部接口规范 | 后端团队 | M2 启动前 |
| 6 | 3 个 stock 模特素材来源(采购站 / 内部资源?) | 设计同事 | M3 启动前 |

**重要**:#1-#3 影响 PRD 的具体数字写入,#4-#6 影响 M3 工程实施。**M2 启动前必须把 1/2/3 补齐**。

---

## 七、参考来源

### 海外竞品研究

- [Krea.ai · hold-product](https://www.krea.ai/apps/edit/hold-product)
- [SellerPic · product-in-hand](https://www.sellerpic.ai/tools/product-in-hand)
- [7 Best AI Product Photography Generators 2026 — Focus Craft](https://thefocuscraft.com/7-best-ai-product-photography-generators-2026-e-commerce-visuals/)
- [Pebblely vs Booth AI · Techjockey](https://www.techjockey.com/compare/booth-ai-vs-pebblely)
- [Flair AI vs Pebblely vs Booth AI · tasarim.ai](https://tasarim.ai/en/compare/flair-ai-vs-pebblely-vs-booth-ai)
- [Best AI Product Photography Tools 2026 · Nightjar](https://nightjar.so/blog/best-10-tools-ai-product-photography)
- [Best AI lifestyle photo generators · Claid](https://claid.ai/blog/article/ai-lifestyle-photo-generators)
- [5 Product Photography Styles · Photta](https://www.photta.app/blog/best-ai-product-photography-tools-styles-2026)
- [AI Hand Modeling · SellerPic Blog](https://www.sellerpic.ai/tools/product-in-hand)
- [Make People Hold Product · ImagineArt](https://www.imagine.art/apps/make-people-hold-product)
- [Free AI Hand Model · Dresma](https://www.dresma.com/free-tools/hand-model)
- [AI Product Photography Complete Guide 2026 · Magic Blog](https://omagic.ai/blog/ai-product-photography-complete-guide-2026)

### 国内市场研究

- [2026 年 5 款电商作图工具盘点 · 知乎](https://zhuanlan.zhihu.com/p/2013178536744207147)
- [AI 模生成工具测评:美图设计室 · 搜狐](https://m.sohu.com/a/976637452_122561455)
- [2026 年 3 月大促 AI 模特 · 跨境工具](https://m.mjzj.com/article/detail/ffl06ixug54w)
- [AI 商拍 · 美图设计室](https://www.designkit.com/aicp/)
- [2026 年 1688 电商 AI 生图对比 · 网易](https://www.163.com/dy/article/KR6P1UIL0552ZIK4.html)
- [5 款 AI 做模特图软件实测 · 搜狐](https://m.sohu.com/a/976825100_122602009)
- [8 个 AI 商拍真人模特工具 · 知乎](https://zhuanlan.zhihu.com/p/1960013218933109162)

### 算法底座研究

- [Seedream 5.0 vs Nano Banana Pro vs Flux Klein vs Qwen Image 对比 · WaveSpeed](https://wavespeed.ai/blog/posts/seedream-5-0-vs-nano-banana-pro-gpt-image-flux-klein-qwen-image-comparison-2026/)
- [AI 图像生成模型迭代历史 · 知乎](https://zhuanlan.zhihu.com/p/1997078668036548146)
- [10 Best AI Image Generators 2026 · fal.ai](https://fal.ai/learn/tools/ai-image-generators)
- [FLUX.2 / Seedream / Z-image 解析 · 知乎](https://zhuanlan.zhihu.com/p/1975174691049189562)
- [Text-to-Image Arena 排行榜 · DataLearner](https://www.datalearner.com/en/leaderboards/external/text-to-image)
- [Image Edit Arena 排行榜 · DataLearner](https://www.datalearner.com/leaderboards/external/image-edit)

### 通义万相(对标)

- [通义万相介绍 · AI 工具集](https://ai-bot.cn/sites/3400.html)
- [通义万相 wan2.6 价格 · 阿里云百科](https://www.aliyunbaike.com/bailian/9619/)

---

## 八、本文档迭代记录

| 日期 | 版本 | 更新内容 |
|---|---|---|
| 2026-05-26 | v0.1 | M1 初稿:8 竞品对比 + 4 洞察 + 算法底座盘点 + 6 个 TBD |
