# 当前转换接口

当前实现是 SVG → Excalidraw Scene JSON。旧版本文档中的 DiagramSpec、固定布局枚举及装饰
效果属于早期设计草案，不是已经实现的生成 API。可选语义工作笔记不构成新的运行时协议。

## 命令行

```sh
node src/skills/prompt-to-canvas/scripts/svg-to-scene.mjs --svg diagram.svg --out scene.json
node src/skills/prompt-to-canvas/scripts/validate-scene.mjs --scene scene.json --expected-language zh
node src/skills/prompt-to-canvas/scripts/open-editor.mjs --scene scene.json --no-open
```

转换失败返回非零退出码，不写新输出；原路径已有旧文件时保留原文件，不应把它当作本次结果。
警告写入 stderr，并记录在 `metadata.conversionWarnings`。校验失败也返回非零退出码。

## 模块接口

- `convert(svg: string)`：返回原生场景，输入不可转换时抛错。
- `validateScene(scene, { expectedLanguage? })`：返回错误字符串数组；空数组表示结构检查通过。

场景包含 `type: "excalidraw"`、`version: 2`、`elements`、白色无限背景 `appState`、`files` 和
转换元数据。不是所有通用 Excalidraw 元素都在本技能原生生成子集中；图片等元素会被校验器拒绝。

支持的 SVG 标签、路径命令、分组、`data-container-id` / `data-start-id` / `data-end-id` 绑定属性
以及字体选择详见 [RULES.md](../src/skills/prompt-to-canvas/RULES.md)。端点不自动寻找邻近节点，
坐标、连线避障及拓扑由作者负责。校验器不能证明图示事实正确或视觉布局没有碰撞。
