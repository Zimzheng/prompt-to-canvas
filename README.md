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
