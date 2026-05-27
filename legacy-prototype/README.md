# 手持商品 MVP · 可点击原型

> 浏览器直接打开 `index.html` 即可使用,**完全离线**,不需要任何构建工具/网络/服务器。

---

## 怎么打开

### 方式 1 · 双击 index.html(最快)

在 Finder 里找到 `index.html`,双击,默认浏览器打开。

### 方式 2 · 本地服务器(更稳,推荐给开发演示用)

```bash
cd /Users/baixiao/Documents/Claude/design/mvp-handheld-product/prototype
python3 -m http.server 8080
# 浏览器访问 http://localhost:8080
```

> Python 用户大概率本机自带;如没有,用 `npx serve` 或 VS Code Live Server 插件。

---

## 5 屏完整流程

| 屏 | 进入方式 | 关键操作 |
|---|---|---|
| **1. 商品图功能页(入口)** | 启动即看到 | 点击「手持版」tab(带 NEW 标识,会有上下浮动动画提示) |
| **2. 手持版主页** | 点入口 tab | 上传商品图 → 选模特 → (可选)展开高级选项 → 点生成 |
| **3. Loading 弹窗** | 点生成后 | 8 秒进度条 + 倒计时,可取消 |
| **4. 结果页** | 生成成功后 | 下载 / 再生成 / 保存 / 反馈打分 |
| **5. 错误弹窗** | 触发异常 | 统一 Modal(算力不足 / 上传失败 / 生成失败) |

---

## 你可以测试的场景

### 主流程
- ✅ 默认 3 步出图(上传 → 默认模特 → 生成)
- ✅ 4 步出图(再切换尺寸 / HD)
- ✅ 拖拽上传 / 点击上传 / **直接粘贴图片**(Ctrl+V / Cmd+V)
- ✅ 切换 3 个模特,看激活态变化
- ✅ 展开高级选项,切尺寸(1:1 / 3:4 / 2:3),切 HD 开关
- ✅ Loading 中点"取消生成"
- ✅ 结果页"再生成"(回主页自动重新生成)
- ✅ 反馈打分(满意/一般/不满意)

### 异常场景(用 Dev 调试面板触发)
- ✅ 上传 >10MB 的文件 → 错误弹窗
- ✅ 上传 GIF/SVG 等非允许格式 → 错误弹窗
- ✅ **点「算力不足场景」→ 再点生成 → 算力不足弹窗 + 去充值按钮**
- ✅ **点「下次强制失败」→ 生成 → 8 秒后失败 + 退算力**

### 埋点验证
- ✅ 打开 Chrome DevTools(F12)→ Console 标签
- ✅ 所有操作都会打印绿色 `[track]` 日志
- ✅ Dev 面板点「查看埋点(console)」→ 一次性输出表格

---

## 文件结构

```
prototype/
├── index.html       # 主页面 + 5 屏 markup
├── styles.css       # 样式(对齐 design 项目 token)
├── mock-data.js     # Mock 数据 + Mock API + Mock 埋点
├── app.js           # 交互逻辑 + 状态机 + 流程编排
└── README.md        # 本文件
```

| 文件 | 行数 | 用途 |
|---|---|---|
| `index.html` | ~190 | DOM 结构,5 屏 + 弹窗 + Dev panel |
| `styles.css` | ~600 | 用 CSS 变量管理 design token,组件样式齐全 |
| `mock-data.js` | ~250 | 3 模特 SVG 占位 + 5 API 模拟 + 12 埋点 |
| `app.js` | ~430 | 状态管理 + 事件 + 流程 + 异常 |

---

## 给开发的注意事项

### scaffold/ 和 prototype/ 的区别

| 目录 | 用途 | 形态 |
|---|---|---|
| `scaffold/` | **生产代码的种子文件**(TS 类型 / API client / 埋点 adapter) | TypeScript,贴近真实产品 |
| `prototype/` | **可交互的视觉/流程演示** | 原生 HTML/JS,跑得起来即可 |

**怎么用**:
- 设计 / 产品看 `prototype/` 跑流程
- 开发把 `scaffold/types.ts`、`scaffold/api-client.ts`、`scaffold/tracking.ts` copy 到主仓
- 开发参考 `prototype/index.html` 和 `prototype/app.js` 实现组件交互

### prototype/ 里的简化 vs PRD 真实规范

| 项 | prototype 里的实现 | PRD 真实规范 |
|---|---|---|
| 生成时长 | 8 秒(为了快速演示) | 25-30 秒(P50) |
| 模特图 | SVG 占位 | 真实拍摄/合成的 3 张 stock |
| 结果图 | SVG 占位 + 商品色块 | Seedream / Flux 实际生成 |
| 上传校验 | 仅前端校验 | 前端 + 后端双校验 |
| 算力扣费 | 内存模拟 | 走千图AI 算力体系 |
| 埋点 | console.log | 接神策 / 友盟 / 自研 |

### 视觉规范对齐

- 主色 `accent/lime` (`#C6FF6B`)
- 文字 `fg/1` `fg/2` `fg/3` 三阶
- 圆角 `radius-sm` (4px) / `md` (8px) / `lg` (12px) / `xl` (16px)
- 间距按 4px 基础(--space-1 至 --space-12)
- 阴影 `shadow-sm` / `md` / `lg`

具体值在 `styles.css` 顶部的 `:root` 里定义,**与 design 项目的 58picAI/Color + Spacing + Radius token 对齐**。

---

## 调试技巧

### Dev 调试面板(右下角)

| 按钮 | 作用 |
|---|---|
| 算力不足场景 | 把余额改为 5,触发"算力不足"弹窗 |
| 恢复算力 | 余额恢复 86 |
| 下次强制失败 | 下一次生成会失败 + 退算力(测试失败链路) |
| 查看埋点(console) | 打印所有埋点事件表格 |
| 收起 | 收起面板 |

### Chrome DevTools

按 F12 / Cmd+Opt+I 打开:
- **Console**:看 `[track]` 埋点日志(绿色)
- **Network**:无网络请求(全部 mock,完全离线)
- **Application**:模特图、结果图都是 SVG data URI,可右键复制查看

---

## 最近更新

| 日期 | 版本 | 更新内容 |
|---|---|---|
| 2026-05-26 | v0.1 | 初版:5 屏 + 12 埋点 + 异常流程 + Dev 调试面板 |
