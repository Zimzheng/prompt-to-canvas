---
title: 技术方案文档
version: 1.0.0
last_updated: 2026-06-30
---

# Prompt to Canvas 技术方案

## 1. 系统架构

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                      Claude Code Agent                          │
│                   (作为 AI 专家分析引擎)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ 内容结构识别 │  │ 数据提取器  │  │ 可视化策略规划器         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Diagram Specification                       │
│               (结构化图表描述 JSON)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Excalidraw Web Editor                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Canvas   │  │ Toolbar  │  │ Library  │  │ Export Engine    │  │
│  │ Rendering│  │ Shapes   │  │ Templates│  │ PNG/SVG         │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 目录结构

```
canvasskill/
├── docs/
│   ├── PRD.md              # 产品需求文档
│   ├── TECHNICAL.md        # 技术方案文档
│   ├── USER_GUIDE.md       # 用户指南
│   └── API.md              # API 设计文档
├── src/
│   ├── skills/
│   │   └── prompt-to-canvas/
│   │       ├── SKILL.md    # Skill 主入口
│   │       ├── rules/
│   │       │   ├── analysis-prompt.md      # AI 分析 Prompt
│   │       │   ├── visualization-strategy.md # 可视化策略库
│   │       │   └── export-handler.md       # 导出处理逻辑
│   │       └── templates/
│   │           ├── portfolio-dual.json     # Portfolio 模板
│   │           ├── timeline.json            # 时间线模板
│   │           └── comparison.json          # 对比图模板
│   ├── editor/
│   │   ├── index.html        # Vite 编辑器入口
│   │   └── src/              # React + Excalidraw 源码
│   └── static/
│       ├── index.html        # 构建后的 Excalidraw 编辑器页面
│       ├── editor-bridge.js  # 编辑器桥接逻辑
│       └── assets/           # Vite 构建产物
├── scripts/
│   └── generate-template.js   # 模板生成脚本
└── README.md
```

## 2. 核心模块设计

### 2.1 AI 专家分析引擎

#### 分析流程

```
用户输入内容
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 1: 内容要素识别                                         │
│  • 项目/经历要素：名称、背景、规模、角色                        │
│  • 成果要素：量化指标、排名、荣誉                              │
│  • 挑战要素：难点、问题、约束                                  │
│  • 方案要素：方法、架构、技术、策略                            │
└──────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 2: 数据提取与结构化                                      │
│  • 数值类：百分比、倍数、人数、时间                            │
│  • 对比类：Before/After、目标/实际                            │
│  • 排名类：Top N、唯一、首批                                  │
└──────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────────┐
│  Step 3: 可视化策略推荐                                        │
│  • 图表类型：架构图、数据大屏、时间线、对比图                   │
│  • 布局策略：双栏、纵向、横向、网格                            │
│  • 配色方案：professional/vibrant/minimal/tech               │
│  • 强调策略：哪些信息需要突出显示                               │
└──────────────────────────────────────────────────────────────┘
```

#### AI 分析 Prompt

详见 [`src/skills/prompt-to-canvas/rules/analysis-prompt.md`](./src/skills/prompt-to-canvas/rules/analysis-prompt.md)

### 2.2 Excalidraw 集成

#### 集成方案

| 方案 | 优点 | 缺点 |
|------|------|------|
| **A. Vite 本地打包 Excalidraw** | 直接可用、无需运行时依赖外网 | 构建产物较大 |
| **B. CDN 加载 Excalidraw** | 零构建、页面轻 | 依赖外网 |
| **C. 自研 Fabric.js 线条编辑器** | 完全可控 | 线条、箭头、历史和导出维护成本高 |

**当前采用方案 A**：使用 Vite + React 打包 `@excalidraw/excalidraw`，构建产物输出到 `src/static`。

#### 编辑器定制化

| 定制项 | 实现方式 |
|--------|---------|
| 品牌色 | CSS 变量覆盖 |
| 隐藏工具栏按钮 | Excalidraw UI 配置 |
| 预设模板 | 预加载 Scene JSON |
| 导出功能 | 调用 Excalidraw API |

### 2.3 模板系统

#### 模板结构 (JSON)

```json
{
  "name": "portfolio-dual",
  "displayName": "Portfolio 双栏图",
  "description": "左侧架构/过程，右侧数据成果",
  "palette": {
    "primary": "#1e293b",
    "secondary": "#3b82f6",
    "accent": "#10b981",
    "background": "#f8fafc",
    "text": "#1e293b"
  },
  "layout": {
    "type": "dual-column",
    "leftWidth": "60%",
    "rightWidth": "40%"
  },
  "elements": [
    {
      "id": "header",
      "type": "text",
      "position": "top",
      "content": "{{title}}"
    },
    {
      "id": "left-panel",
      "type": "panel",
      "position": "left",
      "children": ["architecture", "design-decisions"]
    },
    {
      "id": "right-panel",
      "type": "panel",
      "position": "right",
      "children": ["metrics", "achievements"]
    }
  ]
}
```

## 3. 数据流设计

### 3.1 生成流程

```
1. 用户输入 → AI 分析 → DiagramSpec JSON
2. DiagramSpec → Excalidraw Scene → Render
3. 用户编辑 → Export API → PNG/SVG
```

### 3.2 DiagramSpec 格式

```typescript
interface DiagramSpec {
  version: string;
  metadata: {
    title: string;
    subtitle?: string;
    tags: string[];
    palette: PaletteType;
  };
  layout: LayoutSpec;
  elements: ElementSpec[];
  emphasis: EmphasisSpec[];
}

interface LayoutSpec {
  type: 'dual-column' | 'timeline' | 'comparison' | 'grid' | 'freeform';
  width: number;
  height: number;
  padding: number;
}

interface ElementSpec {
  id: string;
  type: 'text' | 'rect' | 'circle' | 'badge' | 'chart' | 'divider' | 'image';
  position: { x: number; y: number };
  size?: { width: number; height: number };
  style?: Record<string, string>;
  content?: string;
  children?: string[];
}
```

## 4. 部署方案

### 4.1 当前版本部署

Skill 文件复制到 Claude Code 的 skills 目录：

```
~/.claude/skills/prompt-to-canvas/
├── SKILL.md
├── rules/
├── templates/
└── src/
```

### 4.2 Web 编辑器部署

| 方案 | 部署方式 | 适用场景 |
|------|---------|---------|
| **静态构建产物** | `npm run build` 后部署 `src/static` | 推荐，生产使用 |
| **本地文件** | file:// 协议 | 开发调试 |
| **内网部署** | 企业内网 | B2B 版本 |

### 4.3 依赖清单

| 依赖 | 版本 | 用途 | 来源 |
|------|------|------|------|
| @excalidraw/excalidraw | 0.18+ | 画布引擎 | npm |
| React | 18+ | Excalidraw 依赖 | npm |
| ReactDOM | 18+ | Excalidraw 依赖 | npm |
| Vite | 6+ | 编辑器构建 | npm |

## 5. 性能指标

| 指标 | 目标值 | 说明 |
|------|-------|------|
| 首屏加载 | < 3s | 本地静态资源加载 |
| 图表生成 | < 1s | JSON → Scene 转换 |
| 导出 PNG | < 2s | 包含渲染时间 |
| 用户操作延迟 | < 100ms | 编辑响应 |

## 6. 兼容性

| 平台 | 支持情况 |
|------|---------|
| Claude Code | ✅ 完整支持 |
| Cursor | ✅ 可通过 skill 调用 |
| Codex | ✅ 可通过 skill 调用 |
| Claude Web | ⚠️ 需要手动打开编辑器链接 |
| 移动端 | ⚠️ 编辑体验受限，建议 PC 使用 |

## 7. 未来规划

| Phase | 目标 | 优先级 |
|-------|------|--------|
| Phase 2 | 模板中心（更多预设模板） | P1 |
| Phase 2 | 用途自动推断 | P1 |
| Phase 3 | 企业版（B2B定制） | P2 |
| Phase 3 | API 开放 | P2 |

---

*文档版本：v1.0.0 | 最后更新：2026-06-30*
