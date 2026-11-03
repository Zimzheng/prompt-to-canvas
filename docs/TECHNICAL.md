# 技术实现与边界

当前链路：用户内容 → Agent 识别实体/关系 → 空间构图与视觉方向 → SVG → 原生 Excalidraw
场景 → 本地编辑器 → PNG/SVG。35 种视觉参考与自定义方向共同服务于内容，不是固定布局模板。

## 转换器

`src/skills/prompt-to-canvas/scripts/svg-to-scene.mjs` 无第三方运行时依赖，解析受限 SVG 子集。
支持原生矩形、椭圆、菱形、开放/闭合折线、采样曲线、可编辑文字、分组及显式关联。
解析器拒绝不支持的可见特性，避免静默遗漏；它不是完整的浏览器 SVG/CSS 实现。

绑定使用现有 Excalidraw 0.18 场景字段，解析后统一建立正反引用；支持前向 ID 引用。
文本采用保守的字宽估算，曲线采样点不是 Bézier 控制柄；没有自动布局、路由避障或字形测量服务。
详细能力见 [RULES.md](../src/skills/prompt-to-canvas/RULES.md)。

## 编辑器

`src/editor` 是 React + Vite + Excalidraw 编辑器，分发运行时位于
`src/skills/prompt-to-canvas/assets/editor`。当前优化不改变编辑器依赖，编辑器桥接脚本同步修复显式空箭头被误填的问题；其余预构建包保持原样。
`open-editor.mjs` 在回环地址启动 HTTP 服务，每次分配独立场景路径和可用端口。
普通使用不需要 npm 安装。开发编辑器使用 `npm ci`、`npm run build:skill`。

## 验证

`npm test` 覆盖原有无描边修复、新几何/继承/绑定、错误输入与 CLI 行为。
`preflight.sh` 检查运行时和资源完整性。场景校验检查 ID、有限几何、元素类型、组 ID、
双向绑定和可选文字系统；不能替代实际渲染及语义检查。

行为评估应记录真实请求、选型、构图、追问数和最终输出，详见
[STYLE_SELECTION_CHECKS.md](STYLE_SELECTION_CHECKS.md)。单次示例和代码测试不能证明分布层面的
风格多样性改善。后续可按需求引入语义场景编译器或选择性自动路由，当前不宣称已具备。
