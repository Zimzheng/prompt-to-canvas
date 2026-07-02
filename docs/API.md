# Prompt to Canvas API 设计

## 概述

本 API 用于 AI 专家分析与 Excalidraw 编辑器之间的数据交换。

## 数据结构

### DiagramSpec

图表规格定义，所有图表都以此格式生成和存储。

```typescript
interface DiagramSpec {
  version: string;           // 版本号 "1.0.0"
  metadata: DiagramMetadata;  // 元信息
  layout: LayoutSpec;         // 布局定义
  elements: ElementSpec[];    // 元素列表
  emphasis: EmphasisSpec[];   // 强调配置
}

interface DiagramMetadata {
  title: string;              // 主标题
  subtitle?: string;          // 副标题
  tags: string[];            // 标签（如 ["AI", "Agent", "供应链"]）
  palette: PaletteType;       // 配色方案
  author?: string;            // 作者
  createdAt?: string;         // 创建时间 ISO 格式
}

type PaletteType = 'professional' | 'vibrant' | 'minimal' | 'tech';

interface LayoutSpec {
  type: 'dual-column' | 'timeline' | 'comparison' | 'grid' | 'freeform';
  width: number;              // 画布宽度 px
  height: number;             // 画布高度 px
  padding: number;            // 内边距 px
  backgroundColor?: string;   // 背景色
}

interface ElementSpec {
  id: string;                 // 唯一标识
  type: ElementType;          // 元素类型
  position: Position;         // 位置
  size?: Size;                 // 尺寸
  style?: ElementStyle;        // 样式
  content?: string;           // 内容
  children?: string[];        // 子元素 ID 列表
  metadata?: Record<string, any>; // 额外数据
}

type ElementType =
  | 'text'           // 文本
  | 'heading'        // 标题
  | 'rect'           // 矩形
  | 'rounded-rect'   // 圆角矩形
  | 'circle'         // 圆形
  | 'badge'          // 标签徽章
  | 'divider'        // 分隔线
  | 'arrow'          // 箭头
  | 'connector'      // 连接线
  | 'metric-card'    // 指标卡片
  | 'timeline-item'  // 时间线项
  | 'comparison-bar' // 对比条
  | 'panel';         // 面板容器

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface ElementStyle {
  fill?: string;              // 填充色
  stroke?: string;            // 描边色
  strokeWidth?: number;       // 描边宽度
  opacity?: number;           // 透明度 0-1
  fontSize?: number;          // 字体大小
  fontWeight?: string;        // 字体粗细
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;         // 文字颜色
  borderRadius?: number;      // 圆角半径
  shadow?: boolean;           // 是否阴影
}

interface EmphasisSpec {
  elementId: string;          // 元素 ID
  level: 'high' | 'medium' | 'low';
  effect?: 'glow' | 'highlight' | 'pulse';
}
```

### AnalysisResult

AI 专家分析结果。

```typescript
interface AnalysisResult {
  elements: ContentElement[];
  metrics: ExtractedMetric[];
  narrative: NarrativeStructure;
  visualization: VisualizationRecommendation;
}

interface ContentElement {
  type: 'project' | 'metric' | 'challenge' | 'solution' | 'recognition' | 'process';
  content: string;
  emphasis: 'high' | 'medium' | 'low';
  visual: 'card' | 'badge' | 'chart' | 'quote' | 'timeline';
}

interface ExtractedMetric {
  value: string;              // "90%" "2x" "50万"
  label: string;              // "自动化率" "效率提升"
  comparison?: {
    before: string;
    after: string;
  };
}

interface NarrativeStructure {
  primary: string;           // 核心叙事 10 字内
  secondary: string;          // 支撑叙事 20 字内
  structure: 'problem-solution' | 'timeline' | 'comparison' | 'architecture';
}

interface VisualizationRecommendation {
  type: 'portfolio_dual' | 'timeline' | 'comparison' | 'architecture' | 'dashboard';
  layout: {
    direction: 'horizontal' | 'vertical';
    sections: string[];
  };
  palette: PaletteType;
  emphasis: string[];         // 需要强调的元素内容关键词
}
```

## Excalidraw Scene 格式

Excalidraw 使用自己的 Scene 格式存储画布数据。

```typescript
interface ExcalidrawScene {
  type: 'excalidraw';
  version: number;
  source: string;
  elements: ExcalidrawElement[];
  appState: ExcalidrawAppState;
}

interface ExcalidrawElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: string;
  strokeWidth: number;
  roughness: number;
  groupIds: string[];
  roundness: number | null;
  boundElements: string[] | null;
  link: string | null;
  locked: boolean;
  baseline: number;
  startBinding: string | null;
  endBinding: string | null;
  lastCommittedBounds: any;
  text: string | null;
  rawText: string | null;
  fontFamily: number;
  fontSize: number;
  textAlign: string;
  verticalAlign: string;
  containerId: string | null;
  originalText: string;
  lineHeight: number;
  backgroundIndex: number;
}

interface ExcalidrawAppState {
  gridSize: number | null;
  statistics: any;
  currentItemStrokeColor: string;
  currentItemBackgroundColor: string;
  currentItemFillStyle: string;
  currentItemStrokeWidth: number;
  currentItemRoughness: number;
  currentItemOpacity: number;
  currentItemFontFamily: number;
  currentItemFontSize: number;
  currentItemTextAlign: string;
  currentItemVerticalAlign: string;
  currentFileName: string;
  theme: 'light' | 'dark';
  viewBackgroundColor: string;
}
```

## 使用示例

### 从 AnalysisResult 生成 DiagramSpec

```javascript
function generateDiagramSpec(analysis: AnalysisResult): DiagramSpec {
  return {
    version: '1.0.0',
    metadata: {
      title: analysis.narrative.primary,
      subtitle: analysis.narrative.secondary,
      palette: analysis.visualization.palette,
      tags: []
    },
    layout: {
      type: mapToLayoutType(analysis.visualization.type),
      width: 1600,
      height: 900,
      padding: 40
    },
    elements: mapToElements(analysis),
    emphasis: mapToEmphasis(analysis)
  };
}
```

### 从 DiagramSpec 生成 Excalidraw Scene

```javascript
function diagramSpecToScene(spec: DiagramSpec): ExcalidrawScene {
  return {
    type: 'excalidraw',
    version: 2,
    source: 'prompt-to-canvas',
    elements: spec.elements.map(createExcalidrawElement),
    appState: {
      viewBackgroundColor: spec.layout.backgroundColor || '#ffffff',
      gridSize: null,
      theme: 'light'
    }
  };
}
```

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-06-30 | 初始版本 |
