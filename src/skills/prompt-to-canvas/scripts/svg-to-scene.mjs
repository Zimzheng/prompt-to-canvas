#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_VERSION = 2;

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      index += 1;
    }
  }
  return args;
}

function decodeEntities(value = "") {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function attrs(source = "") {
  const result = {};
  const attrPattern = /([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let match;
  while ((match = attrPattern.exec(source))) {
    result[match[1]] = decodeEntities(match[3] ?? match[4] ?? "");
  }
  if (result.style) {
    for (const part of result.style.split(";")) {
      const [key, ...rest] = part.split(":");
      if (!key || !rest.length) continue;
      result[key.trim()] = rest.join(":").trim();
    }
  }
  return result;
}

function num(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number.parseFloat(String(value).replace("px", ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function color(value, fallback = "transparent") {
  if (!value || value === "none") return fallback;
  return value;
}

function hasArrow(attributeMap) {
  return Boolean(attributeMap["marker-end"] || attributeMap["marker-start"]);
}

function identity() {
  return [1, 0, 0, 1, 0, 0];
}

function multiply(left, right) {
  return [
    left[0] * right[0] + left[2] * right[1],
    left[1] * right[0] + left[3] * right[1],
    left[0] * right[2] + left[2] * right[3],
    left[1] * right[2] + left[3] * right[3],
    left[0] * right[4] + left[2] * right[5] + left[4],
    left[1] * right[4] + left[3] * right[5] + left[5],
  ];
}

function applyMatrix(matrix, x, y) {
  return [matrix[0] * x + matrix[2] * y + matrix[4], matrix[1] * x + matrix[3] * y + matrix[5]];
}

function parseTransform(transform = "") {
  let matrix = identity();
  const pattern = /(translate|rotate|scale)\s*\(([^)]*)\)/gi;
  let match;
  while ((match = pattern.exec(transform))) {
    const command = match[1].toLowerCase();
    const values = match[2]
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((value) => num(value, 0));
    let next = identity();

    if (command === "translate") {
      next = [1, 0, 0, 1, values[0] || 0, values[1] || 0];
    }

    if (command === "scale") {
      const sx = values[0] ?? 1;
      const sy = values[1] ?? sx;
      next = [sx, 0, 0, sy, 0, 0];
    }

    if (command === "rotate") {
      const radians = ((values[0] || 0) * Math.PI) / 180;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      const rotation = [cos, sin, -sin, cos, 0, 0];
      if (values.length >= 3) {
        const [cx, cy] = [values[1], values[2]];
        next = multiply(multiply([1, 0, 0, 1, cx, cy], rotation), [1, 0, 0, 1, -cx, -cy]);
      } else {
        next = rotation;
      }
    }

    matrix = multiply(matrix, next);
  }
  return matrix;
}

function transformFor(attributeMap, parentMatrix) {
  return multiply(parentMatrix, parseTransform(attributeMap.transform || ""));
}

function bounds(points) {
  const minX = Math.min(...points.map(([x]) => x));
  const minY = Math.min(...points.map(([, y]) => y));
  const maxX = Math.max(...points.map(([x]) => x));
  const maxY = Math.max(...points.map(([, y]) => y));
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

function distance(a, b) {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

function orderedBox(points) {
  const [topLeft, topRight, bottomRight, bottomLeft] = points;
  const width = distance(topLeft, topRight);
  const height = distance(topLeft, bottomLeft);
  const angle = Math.atan2(topRight[1] - topLeft[1], topRight[0] - topLeft[0]);
  const center = [
    (topLeft[0] + topRight[0] + bottomRight[0] + bottomLeft[0]) / 4,
    (topLeft[1] + topRight[1] + bottomRight[1] + bottomLeft[1]) / 4,
  ];

  return {
    x: center[0] - width / 2,
    y: center[1] - height / 2,
    width,
    height,
    angle,
  };
}

function scaleFor(matrix) {
  return Math.sqrt(matrix[0] * matrix[0] + matrix[1] * matrix[1]) || 1;
}

function rectElement(attributeMap, elements, matrix) {
  const x = num(attributeMap.x);
  const y = num(attributeMap.y);
  const width = num(attributeMap.width);
  const height = num(attributeMap.height);
  if (!width || !height) return null;
  const points = [
    applyMatrix(matrix, x, y),
    applyMatrix(matrix, x + width, y),
    applyMatrix(matrix, x + width, y + height),
    applyMatrix(matrix, x, y + height),
  ];
  const box = orderedBox(points);
  const element = baseElement(
    "rectangle",
    attributeMap.id || `rect-${elements.length + 1}`,
    box.x,
    box.y,
    box.width,
    box.height,
    attributeMap,
  );
  element.angle = box.angle;
  const radius = num(attributeMap.rx || attributeMap.ry, 0);
  element.roundness = radius > 0 ? { type: 3 } : null;
  return element;
}

function ellipseElement(attributeMap, elements, matrix, isCircle = false) {
  const rx = isCircle ? num(attributeMap.r) : num(attributeMap.rx);
  const ry = isCircle ? num(attributeMap.r) : num(attributeMap.ry);
  if (!rx || !ry) return null;
  const cx = num(attributeMap.cx);
  const cy = num(attributeMap.cy);
  const points = [
    applyMatrix(matrix, cx - rx, cy - ry),
    applyMatrix(matrix, cx + rx, cy - ry),
    applyMatrix(matrix, cx + rx, cy + ry),
    applyMatrix(matrix, cx - rx, cy + ry),
  ];
  const box = orderedBox(points);
  const element = baseElement(isCircle ? "ellipse" : "ellipse", attributeMap.id || `${isCircle ? "circle" : "ellipse"}-${elements.length + 1}`, box.x, box.y, box.width, box.height, attributeMap);
  element.angle = box.angle;
  return element;
}

function lineElement(attributeMap, elements, matrix) {
  const start = applyMatrix(matrix, num(attributeMap.x1), num(attributeMap.y1));
  const end = applyMatrix(matrix, num(attributeMap.x2), num(attributeMap.y2));
  const box = bounds([start, end]);
  const type = hasArrow(attributeMap) ? "arrow" : "line";
  const element = baseElement(type, attributeMap.id || `${type}-${elements.length + 1}`, box.minX, box.minY, box.width, box.height, attributeMap);
  element.points = [
    [start[0] - box.minX, start[1] - box.minY],
    [end[0] - box.minX, end[1] - box.minY],
  ];
  if (type === "arrow") {
    element.startArrowhead = attributeMap["marker-start"] ? "arrow" : null;
    element.endArrowhead = attributeMap["marker-end"] ? "arrow" : null;
  }
  return element;
}

function parsePolylinePoints(pointsValue = "") {
  const values = pointsValue.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi)?.map((value) => num(value)) || [];
  const points = [];
  for (let index = 0; index < values.length - 1; index += 2) {
    points.push([values[index], values[index + 1]]);
  }
  return points;
}

function polylineElement(attributeMap, elements, matrix) {
  const points = parsePolylinePoints(attributeMap.points).map(([x, y]) => applyMatrix(matrix, x, y));
  if (points.length < 2) return null;
  const box = bounds(points);
  const type = hasArrow(attributeMap) ? "arrow" : "line";
  const element = baseElement(type, attributeMap.id || `${type}-${elements.length + 1}`, box.minX, box.minY, box.width, box.height, attributeMap);
  element.points = points.map(([x, y]) => [x - box.minX, y - box.minY]);
  if (type === "arrow") {
    element.startArrowhead = attributeMap["marker-start"] ? "arrow" : null;
    element.endArrowhead = attributeMap["marker-end"] ? "arrow" : null;
  }
  return element;
}

function textElement(attributeMap, inner, elements, matrix) {
  const text = parseTextContent(inner);
  if (!text) return null;
  const rawFontSize = num(attributeMap["font-size"], 28);
  const fontSize = rawFontSize * scaleFor(matrix);
  const lineCount = Math.max(1, text.split("\n").length);
  const anchorX = num(attributeMap.x);
  const anchorY = num(attributeMap.y);
  const rawWidth = textWidth(text, rawFontSize);
  const lineHeight = 1.35;
  const rawHeight = rawFontSize * lineHeight * lineCount + rawFontSize * 0.3;
  const x = attributeMap["text-anchor"] === "middle" ? anchorX - rawWidth / 2 : attributeMap["text-anchor"] === "end" ? anchorX - rawWidth : anchorX;
  const y = anchorY - rawFontSize * 1.08;
  const box = orderedBox([
    applyMatrix(matrix, x, y),
    applyMatrix(matrix, x + rawWidth, y),
    applyMatrix(matrix, x + rawWidth, y + rawHeight),
    applyMatrix(matrix, x, y + rawHeight),
  ]);
  const element = baseElement("text", attributeMap.id || `text-${elements.length + 1}`, box.x, box.y, box.width, box.height, {
    ...attributeMap,
    fill: attributeMap.fill || attributeMap.stroke || "#1A1A16",
    stroke: attributeMap.fill || attributeMap.stroke || "#1A1A16",
  });
  element.angle = box.angle;
  element.backgroundColor = "transparent";
  element.strokeWidth = 1;
  element.text = text;
  element.originalText = text;
  element.fontSize = fontSize;
  element.fontFamily = 1;
  element.textAlign = attributeMap["text-anchor"] === "middle" ? "center" : attributeMap["text-anchor"] === "end" ? "right" : "left";
  element.verticalAlign = "top";
  element.containerId = null;
  element.lineHeight = lineHeight;
  return element;
}

let seed = 1000;
function baseElement(type, id, x, y, width, height, attributeMap = {}) {
  seed += 1;
  const stroke = color(attributeMap.stroke, "#1A1A16");
  const fill = color(attributeMap.fill, "transparent");
  return {
    id,
    type,
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor: stroke,
    backgroundColor: fill,
    fillStyle: "solid",
    strokeWidth: Math.max(1, num(attributeMap["stroke-width"], type === "text" ? 1 : 2)),
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed,
    version: 1,
    versionNonce: seed + 100000,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
  };
}

function parseViewBox(svg) {
  const tag = svg.match(/<svg\b([^>]*)>/i);
  if (!tag) return { x: 0, y: 0, width: 1600, height: 900 };
  const attributeMap = attrs(tag[1]);
  if (attributeMap.viewBox) {
    const values = attributeMap.viewBox.split(/\s+/).map((item) => num(item, 0));
    if (values.length >= 4) return { x: values[0], y: values[1], width: values[2], height: values[3] };
  }
  return {
    x: 0,
    y: 0,
    width: num(attributeMap.width, 1600),
    height: num(attributeMap.height, 900),
  };
}

function parseTextContent(inner) {
  const tspans = [...inner.matchAll(/<tspan\b([^>]*)>([\s\S]*?)<\/tspan>/gi)];
  if (!tspans.length) {
    return decodeEntities(inner.replace(/<[^>]+>/g, "").trim());
  }
  return tspans.map((match) => decodeEntities(match[2].replace(/<[^>]+>/g, "").trim())).join("\n");
}

function textWidth(text, fontSize) {
  const longest = text
    .split("\n")
    .reduce((max, line) => Math.max(max, [...line].reduce((sum, char) => sum + charWidth(char, fontSize), 0)), 0);
  return Math.max(80, longest * 1.18 + fontSize * 0.8);
}

function charWidth(char, fontSize) {
  if (/\s/.test(char)) return fontSize * 0.35;
  if (/[\u1100-\u11ff\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef]/.test(char)) return fontSize * 1.05;
  if (/[A-Z0-9]/.test(char)) return fontSize * 0.72;
  return fontSize * 0.62;
}

function convert(svg) {
  const viewBox = parseViewBox(svg);
  const elements = [];

  const matrixStack = [identity()];
  const tagPattern = /<\/?([a-zA-Z][\w:-]*)([^>]*?)\/?>/g;
  let match;
  while ((match = tagPattern.exec(svg))) {
    const raw = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = raw.startsWith("</");
    const isSelfClosing = raw.endsWith("/>");

    if (isClosing) {
      if (["svg", "g"].includes(tagName) && matrixStack.length > 1) matrixStack.pop();
      continue;
    }

    const attributeMap = attrs(match[2]);
    const parentMatrix = matrixStack[matrixStack.length - 1];
    const matrix = transformFor(attributeMap, parentMatrix);
    let element = null;

    if (tagName === "rect") element = rectElement(attributeMap, elements, matrix);
    if (tagName === "circle") element = ellipseElement(attributeMap, elements, matrix, true);
    if (tagName === "ellipse") element = ellipseElement(attributeMap, elements, matrix, false);
    if (tagName === "line") element = lineElement(attributeMap, elements, matrix);
    if (tagName === "polyline") element = polylineElement(attributeMap, elements, matrix);

    if (tagName === "text") {
      const closePattern = new RegExp(`</${tagName}>`, "i");
      closePattern.lastIndex = tagPattern.lastIndex;
      const rest = svg.slice(tagPattern.lastIndex);
      const closeMatch = rest.match(closePattern);
      if (closeMatch?.index !== undefined) {
        const inner = rest.slice(0, closeMatch.index);
        element = textElement(attributeMap, inner, elements, matrix);
        tagPattern.lastIndex += closeMatch.index + closeMatch[0].length;
      }
    }

    if (element) elements.push(element);

    if (["svg", "g"].includes(tagName) && !isSelfClosing) {
      matrixStack.push(matrix);
    }
  }

  return {
    type: "excalidraw",
    version: DEFAULT_VERSION,
    source: "prompt-to-canvas svg-to-scene",
    elements,
    appState: {
      viewBackgroundColor: "#ffffff",
    },
    files: {},
    metadata: {
      sourceViewBox: viewBox,
    },
  };
}

const args = parseArgs(process.argv.slice(2));
if (!args.svg || !args.out) {
  console.error("Usage: node scripts/svg-to-scene.mjs --svg diagram.svg --out scene.json");
  process.exit(1);
}

const svgPath = resolve(process.cwd(), args.svg);
const outPath = resolve(process.cwd(), args.out);
const svg = readFileSync(svgPath, "utf8");
const scene = convert(svg);
writeFileSync(outPath, `${JSON.stringify(scene, null, 2)}\n`, "utf8");
console.log(`Converted ${scene.elements.length} SVG elements to ${outPath}`);
