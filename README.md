# Prompt to Canvas

[简体中文](README.md) | [English](README.en.md)

**把笔记、项目故事和技术方案，变成可以继续编辑的 Excalidraw 画布。**

面向 Codex、Claude Code 等 AI 编码 Agent 的技能包。Agent 理解内容、组织信息层级，从 **35 种视觉风格**中选择视觉方向，构图后在内置本地编辑器中打开。你可以继续修改文字、形状和连接线，再导出 PNG 或 SVG。

[开始安装](#安装) · [查看风格目录](src/skills/prompt-to-canvas/CATALOG.md) · [阅读技能工作流](src/skills/prompt-to-canvas/SKILL.md)

## 看看视觉风格

[![Soft Editorial 风格预览：以三栏结构解释 LLM 训练流程](src/skills/prompt-to-canvas/assets/styles/soft-editorial.png)](src/skills/prompt-to-canvas/templates/soft-editorial/design.md)

上图是仓库自带的 **Soft Editorial 风格示例**，用于展示配色和信息层级，并非编辑器截图。点击图片查看该风格的设计规则；[完整目录](src/skills/prompt-to-canvas/CATALOG.md)包含 35 种风格，覆盖克制、平衡和大胆三类表达。

## 适合做什么

| 你的内容 | 可以制作的画布 |
| --- | --- |
| 项目经历、产品案例 | Portfolio、项目复盘、成果展示 |
| 系统模块、流程、技术方案 | 架构图、流程图、概念关系图 |
| 阶段计划、版本演进 | 路线图、时间线 |
| 指标、改造前后差异 | 指标看板、对比图 |

- **保留编辑能力**：SVG 经转换成为 Excalidraw 原生文字和形状。
- **按内容构图**：风格提供配色与设计规则，Agent 决定叙事、分组、层级和连接关系。
- **内置本地编辑器**：技能包附带预构建运行时，无需为普通使用安装前端依赖。
- **方便交付**：编辑器支持中英文界面切换、浏览器本地自动保存和 PNG/SVG 导出。

## 与参考技能的关系

Prompt to Canvas 基于 [Zara Zhang 的 beautiful-feishu-whiteboard](https://github.com/zarazhangrui/beautiful-feishu-whiteboard) 的视觉系统进行复用与扩展：保留其风格库和 SVG 构图思路，将交付端适配为 **本地 Excalidraw 画布**。上游负责建立视觉设计基础，本项目主要扩展转换、校验与本地编辑体验。

### 复用了哪些部分

| 复用部分 | 本仓库中的对应内容 |
| --- | --- |
| **35 种视觉风格**：配色、气质、正式程度和设计指引 | [风格目录](src/skills/prompt-to-canvas/CATALOG.md)、[35 份风格设计文件](src/skills/prompt-to-canvas/templates/) |
| **风格预览素材** | [35 张 PNG 预览图](src/skills/prompt-to-canvas/assets/styles/)；README 上方的 Soft Editorial 示例也来自上游 |
| **SVG 绘图规则**：原生形状、可编辑文字、连接线与视觉检查 | [RULES.md](src/skills/prompt-to-canvas/RULES.md)直接复用上游规则；其中仍保留飞书字体、CLI 和渲染行为等平台专属说明，Excalidraw 执行流程请看[技能入口](src/skills/prompt-to-canvas/SKILL.md)与[画布规则](src/skills/prompt-to-canvas/rules/canvas-rules.md) |
| **交互与设计方法**：先理解用途，再确认风格，从目录选风格后构图、检查和修正 | 在 [SKILL.md](src/skills/prompt-to-canvas/SKILL.md)中适配为本地 Excalidraw 工作流 |

35 种风格及其预览素材属于上游贡献。这里将“创新”限定为本项目在该基础上增加的实现与工作流扩展。

### 本项目增加了哪些部分

| 扩展与创新 | 实现与用途 |
| --- | --- |
| **SVG → Excalidraw 原生场景转换** | [svg-to-scene.mjs](src/skills/prompt-to-canvas/scripts/svg-to-scene.mjs)将支持的 SVG 形状、文字及连接线转换为场景元素，处理旋转/缩放、箭头和中英文文字尺寸估算，使结果可以继续编辑 |
| **Excalidraw 场景校验** | [validate-scene.mjs](src/skills/prompt-to-canvas/scripts/validate-scene.mjs)检查场景类型、必要字段、文字与连接线结构，并提供可选的语言/文字系统检查 |
| **本地编辑与导出体验** | [React 编辑器](src/editor/src/App.jsx)集成 Excalidraw，增加中英文界面、浏览器自动保存及 PNG/SVG 导出；[预构建运行时](src/skills/prompt-to-canvas/assets/editor/)随技能分发 |
| **每次生成独立的编辑器链接** | [open-editor.mjs](src/skills/prompt-to-canvas/scripts/open-editor.mjs)启动本地 HTTP 服务，为新画布分配可用端口与独立场景 URL，减少不同生成结果之间的串用 |
| **面向本地画布的生成约束** | [画布规则](src/skills/prompt-to-canvas/rules/canvas-rules.md)补充用户语言遵循、禁止旧示例混入、Excalidraw 字段规范和可编辑背景矩形等要求 |

### 两个技能如何选择

| 维度 | beautiful-feishu-whiteboard | Prompt to Canvas |
| --- | --- | --- |
| 最终交付 | 飞书 / Lark 文档内的可编辑白板 | 本地 Excalidraw 编辑器中的可编辑场景 |
| 运行条件 | Node.js 20+、飞书账号及已认证的 Lark CLI | Node.js 20+、能执行本地命令的 Agent 与浏览器 |
| SVG 后续流程 | 通过飞书白板工具构建、写入并验证 | 转换 Scene JSON、校验后打开本地编辑器 |
| 更适合 | 围绕飞书文档交付和分享白板 | 在本地调整画布并导出 PNG/SVG |

上游使用 MIT 许可证。本仓库保留了[上游许可证原文](src/skills/prompt-to-canvas/LICENSE.beautiful-feishu-whiteboard)及作者署名；完整来源与依赖说明见 [NOTICE.md](NOTICE.md)。Excalidraw 编辑能力由 Excalidraw 提供，本项目贡献的是转换和集成工作流。

## 安装

需要 **Git、Node.js 20+**，以及能读取技能文件、执行本地命令的 Agent 环境。以下命令适用于 macOS/Linux shell。

先获取仓库：

```bash
git clone https://github.com/Zimzheng/prompt-to-canvas.git
cd prompt-to-canvas
```

选择你的 Agent，执行其中一组命令：

**Codex**

```bash
mkdir -p ~/.codex/skills
cp -R src/skills/prompt-to-canvas ~/.codex/skills/
sh ~/.codex/skills/prompt-to-canvas/scripts/preflight.sh
```

**Claude Code**

```bash
mkdir -p ~/.claude/skills
cp -R src/skills/prompt-to-canvas ~/.claude/skills/
sh ~/.claude/skills/prompt-to-canvas/scripts/preflight.sh
```

预检成功会输出 `Prompt to Canvas preflight OK`。随后在 Agent 中发起新会话并明确指定 `prompt-to-canvas`。

仓库也提供 `bash scripts/deploy.sh`，默认部署到 Codex；可用 `SKILLS_DIR` 指定其他技能目录。该脚本会同步并删除目标技能目录内的多余文件，更新前请备份自己的修改。使用编辑器应遵循技能中的本地 HTTP 启动方式。

## 第一次使用

把内容、用途和希望的风格一起告诉 Agent：

```text
使用 prompt-to-canvas，把下面的虚构项目计划做成可编辑的路线图。
面向产品评审，风格简洁、专业，画布文字使用中文。

项目：团队知识库助手
第 1 阶段：整理文档，建立检索索引。
第 2 阶段：实现问答，显示引用来源。
第 3 阶段：收集反馈，改进答案质量。
请突出每个阶段的目标与交付物。
```

以上是虚构示例。也可以替换为自己的笔记、架构说明或项目复盘。

Agent 会确认用途与风格，生成 SVG、转换并校验场景，再提供本地编辑器链接。打开链接后，调整文字与形状，使用顶部 **PNG / SVG** 按钮导出。

```text
内容与用途 → 信息组织与风格选择 → SVG 构图
          → 可编辑 Excalidraw Scene → 本地编辑 → PNG / SVG
```

技能依赖 Agent 进行分析和构图，不是独立的文本生成图表服务。保持本地编辑器进程运行，链接才能继续访问。

## 保存与隐私

编辑器在本地 HTTP 服务中运行，当前场景通过浏览器 `localStorage` 自动保存。清除浏览器数据、换浏览器或打开新的画布链接时，不应依赖旧场景的自动保存；需要保留结果时请导出文件。

本地编辑器与 Agent 服务是两个环节：交给 Agent 的内容仍受你所用模型服务和运行环境的数据策略约束。当前技能未集成多人协作；PNG/SVG 是已实现的导出格式。

## 开发与验证

普通安装使用仓库内置编辑器。只有修改编辑器源码时，才需要安装 npm 依赖：

```bash
npm ci
npm run dev
```

构建编辑器并同步到可分发技能包：

```bash
npm run build:skill
npm run preflight
```

源码位于 `src/editor/`；可分发技能包位于 `src/skills/prompt-to-canvas/`。`src/static/` 是被 Git 忽略的构建目录；发布运行时位于技能包的 `assets/editor/`。

欢迎通过 [Issue](https://github.com/Zimzheng/prompt-to-canvas/issues)反馈问题，或提交改进风格、规则、脚本与编辑器的 Pull Request。修改编辑器后请构建同步运行时，并检查生成、编辑及导出流程。

## 文档

| 文档 | 内容 |
| --- | --- |
| [技能入口](src/skills/prompt-to-canvas/SKILL.md) | 当前运行条件、完整生成与校验工作流 |
| [风格目录](src/skills/prompt-to-canvas/CATALOG.md) | 35 种风格的气质、正式程度与配色 |
| [绘图规则](src/skills/prompt-to-canvas/RULES.md) | SVG 构图约束 |
| [发布指南](docs/RELEASE.md) | 发布检查与技能包体积策略 |
| [安全政策](SECURITY.md) | 安全问题反馈方式 |

`docs/` 中还保留产品、技术与 API 设计文档；实际使用请以当前技能入口与代码为准。

## 许可证与致谢

采用 [MIT 许可证](LICENSE)。编辑器基于 Excalidraw、React 和 Vite；视觉系统借鉴了 `beautiful-feishu-whiteboard`。第三方来源与许可证说明见 [NOTICE.md](NOTICE.md)。
