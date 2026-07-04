# Prompt to Canvas

[English / Global](README.md) | 简体中文

Prompt to Canvas 是一个面向 AI 编码 Agent 的可视化技能包，可以把笔记、项目故事、技术架构、指标数据、计划文档等自然语言内容，转化为精致、可编辑、可导出的 Excalidraw 画布。

它不是模板填充器，也不是一次性图片生成器。Prompt to Canvas 的核心是一个本地优先的设计系统工作流：Agent 会先理解内容，判断叙事重点和信息层级，再从 35 种视觉风格中选择合适方案，手工构图 SVG，转换为 Excalidraw Scene JSON，并在内置本地编辑器中打开，支持 PNG/SVG 导出。

适合用于产品案例、技术架构图、项目复盘、路线图、求职 Portfolio、指标看板、概念图、方案汇报等需要“既好看又能继续编辑”的场景。

## 为什么需要它

AI 直接生成图片很快，但通常不可编辑；传统画图工具可编辑，但从零构图很耗时。Prompt to Canvas 在二者之间加入 SVG 中介层：Agent 在受控的矢量结构中完成设计，再把结果转换成 Excalidraw 原生元素。这样既能获得稳定的视觉质量，也能保留后续编辑能力。

## 核心特性

- **Excalidraw 原生可编辑输出** - 生成结果是形状和文字，不是截图。
- **35 种精选视觉风格** - 覆盖克制、平衡、大胆三类视觉表达，并包含风格预览和设计规则。
- **本地编辑器运行时** - 技能包内置静态编辑器，不依赖托管服务。
- **中英文编辑器 UI** - 编辑器支持中文和英文界面切换。
- **刷新安全的本地自动保存** - 当前画布会在本地浏览器中自动保存。
- **PNG/SVG 导出** - 可以直接从内置编辑器导出图片或矢量文件。

## 安装

克隆仓库后，将技能目录复制到你的 Agent 技能目录。

Codex:

```bash
mkdir -p ~/.codex/skills
cp -R src/skills/prompt-to-canvas ~/.codex/skills/
```

Claude Code:

```bash
mkdir -p ~/.claude/skills
cp -R src/skills/prompt-to-canvas ~/.claude/skills/
```

也可以使用部署脚本。默认目标目录是 `~/.codex/skills`，可通过 `SKILLS_DIR` 覆盖。

```bash
scripts/deploy.sh
SKILLS_DIR="$HOME/.claude/skills" scripts/deploy.sh
```

## 使用方式

用自然语言告诉 Agent 你的内容和目标：

```text
Use prompt-to-canvas to turn these project notes into a polished editable canvas.
```

或直接用中文描述输出目标：

```text
把这段项目经历做成一张适合面试 portfolio 的可编辑可视化图。
```

技能会自动选择视觉风格，构建 SVG 源文件，转换为 Excalidraw Scene JSON，校验场景，并打开本地编辑器链接。

## 开发

安装依赖：

```bash
npm ci
```

启动编辑器开发环境：

```bash
npm run dev
```

构建并同步技能包内置编辑器运行时：

```bash
npm run build:skill
```

运行技能预检：

```bash
npm run preflight
```

## 仓库结构

```text
.
├── docs/                         # 产品、技术、用户和发布文档
├── scripts/                      # 部署辅助脚本
├── src/
│   ├── editor/                   # Vite + React 编辑器源码
│   └── skills/
│       └── prompt-to-canvas/     # 可分发技能包
│           ├── SKILL.md
│           ├── CATALOG.md
│           ├── RULES.md
│           ├── assets/
│           │   ├── editor/       # 预构建编辑器运行时
│           │   └── styles/       # 35 张风格预览图
│           ├── rules/
│           ├── scripts/
│           └── templates/
├── LICENSE
├── NOTICE.md
├── package.json
└── package-lock.json
```

`src/static/` 由 Vite 构建生成，并已被 git 忽略。可发布的编辑器运行时副本位于 `src/skills/prompt-to-canvas/assets/editor/`。

## 发布与体积策略

详见 [docs/RELEASE.md](docs/RELEASE.md)。

技能包预期体积约为 14 MB：

- 约 8 MB：内置 Excalidraw 编辑器运行时。
- 约 5 MB：35 张风格预览 PNG。
- 小于 1 MB：技能规则、脚本、模板和文档。

不要发布 `node_modules/` 或 `src/static/`。

## 致谢

Prompt to Canvas 基于多个开源项目构建：

- `@excalidraw/excalidraw` 提供可编辑画布编辑器。
- React、React DOM、Vite 和 `@vitejs/plugin-react` 提供内置编辑器构建能力。
- `beautiful-feishu-whiteboard` 提供上游技能灵感、风格目录概念和相关视觉系统资产。

许可证和引用说明见 [NOTICE.md](NOTICE.md)。

## 许可证

MIT。详见 [LICENSE](LICENSE)。
