# Local export

The bundled editor exposes PNG and SVG buttons, implemented using Excalidraw `exportToBlob` and
`exportToSvg`. Open the scene through `scripts/open-editor.mjs`, click the relevant button and save
the download. Check the actual export for font/label clipping. Preserve the editable scene JSON and
SVG source alongside exports when delivering files.

There is no built-in PDF button, clipboard workflow or `getSceneCanvas()` wrapper API in this
package. Do not promise these features based on older design drafts. PDF conversion, when explicitly
requested, is a separate document workflow.
