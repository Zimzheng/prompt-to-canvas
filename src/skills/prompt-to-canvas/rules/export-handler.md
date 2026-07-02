# 导出功能处理逻辑

## 导出格式

| 格式 | 文件扩展名 | 适用场景 |
|------|----------|---------|
| PNG | .png | 常规使用，嵌入文档 |
| SVG | .svg | 矢量图，可无损缩放 |
| PDF | .pdf | 正式文档，打印输出 |

## Excalidraw 导出 API

### 使用 Excalidraw 客户端 API

```javascript
// 获取 Excalidraw 容器
const excalidrawContainer = document.getElementById("excalidraw-container");
const excalidrawAPI = excalidrawContainer.getSceneCanvas();

// 导出为 PNG
async function exportToPNG() {
  const png = await excalidrawAPI.exportToCanvas({
    mimeType: "image/png",
    quality: 1,
    exportBackground: true,
  });

  // 下载
  const link = document.createElement("a");
  link.download = "diagram.png";
  link.href = png.toDataURL("image/png");
  link.click();
}

// 导出为 SVG
async function exportToSVG() {
  const svg = await excalidrawAPI.exportToCanvas({
    mimeType: "image/svg+xml",
    exportBackground: true,
  });

  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.download = "diagram.svg";
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
}
```

## 导出按钮 UI

```html
<div class="export-toolbar">
  <button onclick="exportToPNG()" class="export-btn">
    <span>📷</span> PNG
  </button>
  <button onclick="exportToSVG()" class="export-btn">
    <span>✏️</span> SVG
  </button>
  <button onclick="exportToPDF()" class="export-btn">
    <span>📄</span> PDF
  </button>
</div>
```

## PDF 导出方案

PDF 导出需要额外处理，使用 html2canvas + jsPDF：

```javascript
async function exportToPDF() {
  // 获取 Excalidraw 画布
  const canvas = await excalidrawAPI.exportToCanvas({
    mimeType: "image/png",
    quality: 1,
    exportBackground: true,
  });

  // 创建 PDF
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  // 添加图片
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);

  // 下载
  pdf.save("diagram.pdf");
}
```

## 剪贴板复制

支持复制到剪贴板：

```javascript
async function copyToClipboard() {
  const canvas = await excalidrawAPI.exportToCanvas({
    mimeType: "image/png",
    quality: 1,
    exportBackground: true,
  });

  canvas.toBlob(async (blob) => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      showToast("已复制到剪贴板");
    } catch (err) {
      showToast("复制失败，请右键保存图片");
    }
  });
}
```

## 导出配置选项

| 选项 | 默认值 | 说明 |
|------|-------|------|
| exportBackground | true | 是否导出背景 |
| exportWithDarkMode | false | 是否以暗色主题导出 |
| quality | 1 | 图片质量 0-1 |
| padding | 10 | 导出 padding |

## 错误处理

| 错误类型 | 处理方式 |
|---------|---------|
| 导出超时 | 显示 toast 提示，重试按钮 |
| 剪贴板权限拒绝 | 提示用户手动复制 |
| PDF 库加载失败 | 回退到 PNG 导出 |
