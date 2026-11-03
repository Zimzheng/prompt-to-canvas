#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

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
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, value) => String.fromCodePoint(value[0].toLowerCase() === "x" ? parseInt(value.slice(1), 16) : parseInt(value, 10)))
    .replace(/&amp;/g, "&");
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
  if (transform.replace(/(?:translate|rotate|scale)\s*\([^)]*\)/gi, "").trim()) {
    throw new Error(`Unsupported SVG transform: ${transform}`);
  }
  let matrix = identity();
  const pattern = /(translate|rotate|scale)\s*\(([^)]*)\)/gi;
  let match;
  while ((match = pattern.exec(transform))) {
    const command = match[1].toLowerCase();
    const values = match[2]
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    const expected = command === "rotate" ? [1, 3] : [1, 2];
    if (!expected.includes(values.length) || values.some(value => !Number.isFinite(value))) {
      throw new Error(`Invalid SVG transform: ${transform}`);
    }
    let next = identity();

    if (command === "translate") {
      next = [1, 0, 0, 1, values[0] || 0, values[1] || 0];
    }

    if (command === "scale") {
      const sx = values[0] ?? 1;
      const sy = values[1] ?? sx;
      if (sx <= 0 || sy <= 0 || Math.abs(sx - sy) > 1e-8) {
        throw new Error("Only positive uniform scale is supported.");
      }
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
  const numberPattern = /[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi;
  const values = (pointsValue.match(numberPattern) || []).map(Number);
  if (pointsValue.replace(numberPattern, "").replace(/[\s,]/g, "") || values.length % 2 || values.length < 4) {
    throw new Error("SVG points require at least two complete coordinate pairs.");
  }
  const points = [];
  for (let index = 0; index < values.length; index += 2) points.push([values[index], values[index + 1]]);
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
  element.fontFamily = Number(attributeMap["data-font-family"] || 1);
  if (![1, 2, 3].includes(element.fontFamily)) throw new Error("data-font-family must be 1, 2 or 3.");
  element.textAlign = attributeMap["text-anchor"] === "middle" ? "center" : attributeMap["text-anchor"] === "end" ? "right" : "left";
  element.verticalAlign = "top";
  element.containerId = null;
  element.lineHeight = lineHeight;
  return element;
}

let seed = 1000;
function baseElement(type, id, x, y, width, height, attributeMap = {}) {
  seed += 1;
  // SVG has no stroke unless explicitly painted. Preserve borderless style surfaces,
  // including paper backgrounds; Excalidraw's default dark stroke would invent a frame.
  const rawStrokeWidth = num(attributeMap["stroke-width"], type === "text" ? 1 : 2);
  const stroke = type !== "text" && rawStrokeWidth <= 0 ? "transparent" : color(attributeMap.stroke, "transparent");
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
    strokeWidth: Math.max(1, rawStrokeWidth),
    strokeStyle: attributeMap["stroke-dasharray"] && attributeMap["stroke-dasharray"] !== "none" ? "dashed" : "solid",
    roughness: 0,
    opacity: Math.round(100 * Number(attributeMap.__opacity ?? 1)),
    groupIds: [...(attributeMap.__groups || [])],
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

// Parse a deliberately small SVG subset. Reject unknown visible features rather than dropping them.
const INHERITED = new Set([
  "fill", "stroke", "stroke-width", "stroke-dasharray", "font-size", "text-anchor",
  "marker-start", "marker-end", "data-font-family", "font-family", "font-weight", "letter-spacing",
]);
const GRAPHICS = new Set(["rect", "circle", "ellipse", "line", "polyline", "polygon", "path", "text"]);
const ATTRIBUTES = new Set([
  "id", "style", "transform", "fill", "stroke", "stroke-width", "stroke-dasharray", "opacity",
  "font-size", "text-anchor", "font-family", "font-weight", "letter-spacing", "marker-start", "marker-end",
  "x", "y", "x1", "y1", "x2", "y2", "width", "height", "rx", "ry", "r", "cx", "cy", "points", "d",
  "viewBox", "version", "xmlns", "xmlns:xlink", "xml:space", "role", "aria-label",
  "data-font-family", "data-container-id", "data-start-id", "data-end-id",
]);

function parseSVG(svg) {
  if (/<!DOCTYPE|<!ENTITY/i.test(svg)) throw new Error("SVG DTDs and entities are unsupported.");
  const root = { tag: "document", attributes: {}, children: [] };
  const stack = [root];
  const tokens = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<\/?[a-zA-Z][\w:-]*(?:[^<>"']|"[^"]*"|'[^']*')*>|[^<]+/g;
  let cursor = 0;
  for (const match of svg.matchAll(tokens)) {
    if (match.index !== cursor) throw new Error(`Malformed SVG near offset ${cursor}.`);
    cursor = match.index + match[0].length;
    const token = match[0];
    if (token.startsWith("<!--") || token.startsWith("<?")) continue;
    if (!token.startsWith("<")) { stack.at(-1).children.push(token); continue; }
    const tag = token.match(/^<\/?([\w:-]+)/)[1];
    if (token.startsWith("</")) {
      if (stack.length === 1 || stack.at(-1).tag !== tag) throw new Error(`Mismatched closing tag: ${tag}`);
      stack.pop();
      continue;
    }
    const attributeSource = token.slice(tag.length + 1).replace(/\/?>$/, "");
    if (attributeSource.replace(/([\w:-]+)\s*=\s*("[^"]*"|'[^']*')/g, "").trim()) {
      throw new Error(`Malformed attributes on <${tag}>.`);
    }
    const node = { tag, attributes: attrs(attributeSource), children: [] };
    stack.at(-1).children.push(node);
    if (!token.endsWith("/>")) stack.push(node);
  }
  if (cursor !== svg.length || stack.length !== 1) throw new Error("Incomplete SVG document.");
  const roots = root.children.filter(node => typeof node !== "string");
  if (root.children.some(node => typeof node === "string" && node.trim()) || roots.length !== 1 || roots[0].tag !== "svg") throw new Error("Expected one SVG root.");
  return roots[0];
}

function linearElement(points, attributeMap, elements, matrix, closed = false) {
  const transformed = points.map(([x, y]) => applyMatrix(matrix, x, y));
  if (transformed.length < 2) throw new Error(`${attributeMap.id || "path"}: at least two points required.`);
  if (closed && distance(transformed[0], transformed.at(-1)) > 1e-8) transformed.push([...transformed[0]]);
  const box = bounds(transformed);
  const type = hasArrow(attributeMap) ? "arrow" : "line";
  const element = baseElement(type, attributeMap.id || `${type}-${elements.length + 1}`,
    box.minX, box.minY, box.width, box.height, attributeMap);
  element.points = transformed.map(([x, y]) => [x - box.minX, y - box.minY]);
  if (type === "arrow") {
    element.backgroundColor = "transparent";
    element.startArrowhead = attributeMap["marker-start"] ? "arrow" : null;
    element.endArrowhead = attributeMap["marker-end"] ? "arrow" : null;
  }
  return element;
}

function polygonElement(attributeMap, elements, matrix) {
  const points = parsePolylinePoints(attributeMap.points);
  const box = bounds(points);
  const cx = (box.minX + box.maxX) / 2;
  const cy = (box.minY + box.maxY) / 2;
  const corners = [[cx, box.minY], [box.maxX, cy], [cx, box.maxY], [box.minX, cy]];
  const matches = points.map(point => corners.findIndex(corner => distance(point, corner) < 1e-5));
  const diamond = points.length === 4 && new Set(matches).size === 4 && !matches.includes(-1)
    && matches.every((value, index) => [1, 3].includes((matches[(index + 1) % 4] - value + 4) % 4));
  if (diamond && !hasArrow(attributeMap)) {
    const element = rectElement({ ...attributeMap, x: box.minX, y: box.minY, width: box.width, height: box.height }, elements, matrix);
    element.type = "diamond";
    element.roundness = null;
    return element;
  }
  return linearElement(points, attributeMap, elements, matrix, true);
}

function pathPoints(d) {
  const tokens = d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi) || [];
  if (d.replace(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?|[\s,]/gi, "")) {
    throw new Error("Invalid SVG path data.");
  }
  let index = 0, command = null, current = [0, 0], first = null, closed = false;
  const points = [];
  const arity = { M: 2, L: 2, H: 1, V: 1, C: 6, Q: 4 };
  while (index < tokens.length) {
    if (/^[a-z]$/i.test(tokens[index])) {
      command = tokens[index++];
      if (index === tokens.length && command.toUpperCase() !== "Z") throw new Error(`Missing arguments for ${command}.`);
      if (command.toUpperCase() === "Z") {
        if (!first || index < tokens.length) throw new Error("Only a single SVG path subpath is supported.");
        closed = true;
        break;
      }
    }
    const upper = command?.toUpperCase();
    if (!arity[upper]) throw new Error(`Unsupported SVG path command: ${command || "missing M"}`);
    if (!first && upper !== "M") throw new Error("SVG paths must start with M.");
    const values = tokens.slice(index, index + arity[upper]).map(Number);
    if (values.length !== arity[upper] || values.some(value => !Number.isFinite(value))) throw new Error(`Invalid ${command} path arguments.`);
    index += arity[upper];
    const relative = command === command.toLowerCase();
    const pair = offset => [values[offset] + (relative ? current[0] : 0), values[offset + 1] + (relative ? current[1] : 0)];
    if (upper === "M") {
      if (first) throw new Error("Only a single SVG path subpath is supported.");
      current = pair(0); first = [...current]; points.push([...current]);
      command = relative ? "l" : "L";
    } else if (["L", "H", "V"].includes(upper)) {
      current = upper === "L" ? pair(0) : upper === "H"
        ? [values[0] + (relative ? current[0] : 0), current[1]]
        : [current[0], values[0] + (relative ? current[1] : 0)];
      points.push([...current]);
    } else {
      const start = [...current], control1 = pair(0);
      const control2 = upper === "C" ? pair(2) : null;
      const end = pair(upper === "C" ? 4 : 2);
      // Sample by control polygon length with bounded cost. Endpoints are exact.
      const length = distance(start, control1) + (control2 ? distance(control1, control2) + distance(control2, end) : distance(control1, end));
      const steps = Math.max(8, Math.min(128, Math.ceil(length / 12)));
      for (let step = 1; step <= steps; step++) {
        const t = step / steps, u = 1 - t;
        points.push([0, 1].map(axis => control2
          ? u*u*u*start[axis] + 3*u*u*t*control1[axis] + 3*u*t*t*control2[axis] + t*t*t*end[axis]
          : u*u*start[axis] + 2*u*t*control1[axis] + t*t*end[axis]));
      }
      current = end;
    }
  }
  return { points, closed };
}

function bindingFor(arrow, target, atStart) {
  const point = arrow.points[atStart ? 0 : arrow.points.length - 1];
  const x = arrow.x + point[0], y = arrow.y + point[1];
  const cx = target.x + target.width / 2, cy = target.y + target.height / 2;
  const c = Math.cos(-target.angle), s = Math.sin(-target.angle);
  const dx = c * (x - cx) - s * (y - cy), dy = s * (x - cx) + c * (y - cy);
  const nx = dx / Math.max(1, target.width / 2), ny = dy / Math.max(1, target.height / 2);
  const horizontal = Math.abs(nx) >= Math.abs(ny);
  // Excalidraw focus is a signed distance to the centre, relative to the target side.
  const focus = horizontal ? ny * Math.sign(nx || 1) : -nx * Math.sign(ny || 1);
  const extent = target.type === "ellipse" ? Math.hypot(nx, ny)
    : target.type === "diamond" ? Math.abs(nx) + Math.abs(ny) : Math.max(Math.abs(nx), Math.abs(ny));
  const radialGap = extent > 0 ? Math.hypot(dx, dy) * (1 - 1 / extent) : 0;
  return { elementId: target.id, focus: Math.max(-1, Math.min(1, focus)), gap: Math.max(1, radialGap) };
}

// Native bound curves use their adjacent point to find the boundary intersection. Dense points
// immediately beside an endpoint can end up inside a moved node; preserve a useful tangent span.
function prepareBoundCurves(elements, pending) {
  const byId = new Map(elements.map(element => [element.id, element]));
  for (const { element, attributes } of pending) {
    if (element.type !== "arrow" || !/[CQcq]/.test(attributes.d || "")) continue;
    const targets = ["data-start-id", "data-end-id"].map(attribute => byId.get(attributes[attribute]?.replace(/^#/, ""))).filter(Boolean);
    if (!targets.length) continue;
    const clearance = Math.max(64, ...targets.map(target => Math.max(target.width, target.height) / 2)) + 24;
    const original = element.points;
    const lengths = [0];
    for (let index = 1; index < original.length; index++) lengths.push(lengths.at(-1) + distance(original[index - 1], original[index]));
    const total = lengths.at(-1);
    if (total > 0) {
      // Uniform arc-length samples avoid a long endpoint chord followed by a dense cluster,
      // which produces a visible kink in the native curve renderer.
      const count = Math.min(original.length - 1, Math.max(2, Math.floor(total / (clearance * 1.15))));
      const resampled = [[...original[0]]];
      let segment = 1;
      for (let index = 1; index < count; index++) {
        const at = total * index / count;
        while (segment < lengths.length - 1 && lengths[segment] < at) segment++;
        const span = lengths[segment] - lengths[segment - 1];
        const ratio = span > 0 ? (at - lengths[segment - 1]) / span : 0;
        resampled.push([0, 1].map(axis => original[segment - 1][axis] + ratio * (original[segment][axis] - original[segment - 1][axis])));
      }
      resampled.push([...original.at(-1)]);
      element.points = resampled;
    }
    // Removed samples can change the bounding box; keep all absolute point locations intact.
    const absolute = element.points.map(([x, y]) => [element.x + x, element.y + y]);
    const box = bounds(absolute);
    element.x = box.minX; element.y = box.minY; element.width = box.width; element.height = box.height;
    element.points = absolute.map(([x, y]) => [x - box.minX, y - box.minY]);
  }
}

function resolveBindings(elements, pending) {
  const byId = new Map(elements.map(element => [element.id, element]));
  const addReciprocal = (target, element) => {
    target.boundElements ||= [];
    target.boundElements.push({ id: element.id, type: element.type });
  };
  for (const { element, attributes } of pending) {
    for (const [attribute, field] of [["data-container-id", "containerId"], ["data-start-id", "startBinding"], ["data-end-id", "endBinding"]]) {
      if (!attributes[attribute]) continue;
      const id = attributes[attribute].replace(/^#/, "");
      const target = byId.get(id);
      if (!target || !["rectangle", "ellipse", "diamond"].includes(target.type)) {
        throw new Error(`${element.id}: ${attribute} references missing/non-bindable node ${id}.`);
      }
      if (field === "containerId") {
        if (element.type !== "text") throw new Error(`${element.id}: only text can use data-container-id.`);
        if (target.boundElements?.some(bound => bound.type === "text")) throw new Error(`${id}: only one bound text label is supported.`);
        element.containerId = id;
        element.verticalAlign = "middle";
        element.autoResize = true;
      } else {
        if (element.type !== "arrow") throw new Error(`${element.id}: endpoint bindings require an arrow marker.`);
        element[field] = bindingFor(element, target, field === "startBinding");
      }
      if (!target.boundElements?.some(bound => bound.id === element.id)) addReciprocal(target, element);
    }
  }
}

export function convert(svg) {
  seed = 1000;
  const root = parseSVG(svg);
  const elements = [], pending = [], warnings = new Set(), ids = new Set();
  let groupCount = 0;
  function visit(node, parent) {
    if (typeof node === "string") {
      if (node.trim()) throw new Error("Visible text must be inside <text>.");
      return;
    }
    const { tag, attributes: own } = node;
    if (["defs", "title", "desc", "metadata"].includes(tag)) return;
    if (!["svg", "g", ...GRAPHICS].includes(tag)) throw new Error(`Unsupported SVG element <${tag}>${own.id ? ` #${own.id}` : ""}.`);
    for (const [key, value] of Object.entries(own)) {
      if (!ATTRIBUTES.has(key) && !key.startsWith("aria-")) throw new Error(`${own.id || tag}: unsupported SVG attribute/style ${key}.`);
      if (["fill", "stroke"].includes(key) && /url\(|var\(|^(?:currentColor|inherit|initial|unset)$/i.test(value)) throw new Error(`${own.id || tag}: paint servers and CSS variables are unsupported.`);
      if (["font-family", "font-weight", "letter-spacing"].includes(key)) warnings.add(`${key} is not reproduced; use native font IDs, scale and spacing.`);
      if (["width", "height", "rx", "ry", "r", "cx", "cy", "x", "y", "x1", "y1", "x2", "y2", "font-size", "stroke-width"].includes(key)
        && !/^[+-]?(?:\d*\.\d+|\d+\.?\d*)(?:e[+-]?\d+)?(?:px)?$/i.test(value)) throw new Error(`${own.id || tag}: ${key} requires a finite number, not ${value}.`);
    }
    for (const key of ["x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "width", "height", "rx", "ry", "r", "font-size", "stroke-width"]) {
      if (own[key] !== undefined && !Number.isFinite(Number(own[key].replace(/px$/, "")))) throw new Error(`${own.id || tag}: ${key} must be finite.`);
    }
    for (const key of ["width", "height", "rx", "ry", "r", "font-size", "stroke-width"]) {
      if (own[key] !== undefined && num(own[key]) < 0) throw new Error(`${own.id || tag}: ${key} must be nonnegative.`);
    }
    const inherited = Object.fromEntries(Object.entries(parent.style).filter(([key]) => INHERITED.has(key)));
    const style = { ...inherited, ...own };
    if (own.id) {
      if (ids.has(own.id)) throw new Error(`Duplicate SVG ID: ${own.id}`);
      ids.add(own.id);
    }
    const matrix = transformFor(own, parent.matrix);
    const opacity = own.opacity === undefined ? 1 : Number(own.opacity);
    if (!Number.isFinite(opacity) || opacity < 0 || opacity > 1) throw new Error(`${own.id || tag}: opacity must be between 0 and 1.`);
    const totalOpacity = parent.opacity * opacity;
    const groups = tag === "g" ? [own.id || `svg-group-${++groupCount}`, ...parent.groups] : parent.groups;
    if (["svg", "g"].includes(tag) && opacity !== 1) warnings.add("Group opacity is applied per element, not as an isolated compositing layer.");
    const attributeMap = { ...style, __opacity: totalOpacity, __groups: groups };
    if (style["stroke-width"] !== undefined) attributeMap["stroke-width"] = num(style["stroke-width"]) * scaleFor(matrix);
    let element = null;
    if (tag === "rect") element = rectElement(attributeMap, elements, matrix);
    if (tag === "circle") element = ellipseElement(attributeMap, elements, matrix, true);
    if (tag === "ellipse") element = ellipseElement(attributeMap, elements, matrix, false);
    if (tag === "line") element = lineElement(attributeMap, elements, matrix);
    if (tag === "polyline") element = polylineElement(attributeMap, elements, matrix);
    if (tag === "polygon") element = polygonElement(attributeMap, elements, matrix);
    if (tag === "path") {
      const { points, closed } = pathPoints(attributeMap.d || "");
      element = linearElement(points, attributeMap, elements, matrix, closed);
      if (/[CQcq]/.test(attributeMap.d)) {
        element.roundness = { type: 2 };
        warnings.add("Bezier paths are sampled into editable line points, not exact curve handles.");
      }
    }
    if (tag === "text") {
      const text = textContent(node);
      element = textElement(attributeMap, escapeText(text), elements, matrix);
    }
    if (GRAPHICS.has(tag) && !element) throw new Error(`${own.id || tag}: empty or zero-sized graphic.`);
    if (element) {
      if (elements.some(existing => existing.id === element.id)) throw new Error(`Duplicate generated element ID: ${element.id}`);
      if ([element.x, element.y, element.width, element.height].some(value => !Number.isFinite(value)) || element.width < 0 || element.height < 0) {
        throw new Error(`${element.id}: invalid geometry.`);
      }
      if (element.type === "arrow") element.backgroundColor = "transparent";
      if (element.type === "arrow" || element.type === "line") {
        element.lastCommittedPoint = null;
        element.startBinding = null;
        element.endBinding = null;
      }
      elements.push(element);
      pending.push({ element, attributes: own });
    }
    if (["svg", "g"].includes(tag)) {
      for (const child of node.children) visit(child, { style, matrix, opacity: totalOpacity, groups });
    } else if (tag !== "text" && node.children.some(child => typeof child !== "string" || child.trim())) {
      throw new Error(`${tag}: nested graphics are unsupported.`);
    }
  }
  visit(root, { style: {}, matrix: identity(), opacity: 1, groups: [] });
  if (!elements.length) throw new Error("SVG contains no editable graphics.");
  prepareBoundCurves(elements, pending);
  resolveBindings(elements, pending);
  return {
    type: "excalidraw", version: DEFAULT_VERSION, source: "prompt-to-canvas svg-to-scene",
    elements, appState: { viewBackgroundColor: "#ffffff" }, files: {},
    metadata: { sourceViewBox: parseViewBox(svg), conversionWarnings: [...warnings] },
  };
}

function escapeText(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function textContent(node) {
  const spans = node.children.filter(child => typeof child !== "string");
  if (!spans.length) return decodeEntities(node.children.join("").trim());
  if (node.children.some(child => typeof child === "string" && child.trim())) {
    throw new Error("Use either plain text or explicit tspan lines, not mixed inline runs.");
  }
  return spans.map(span => {
    if (span.tag !== "tspan" || span.children.some(child => typeof child !== "string")) throw new Error("Only plain tspan lines are supported inside text.");
    if (Object.keys(span.attributes).some(key => !["x", "y", "dy"].includes(key))) throw new Error("Inline tspan styling is unsupported; style the parent text.");
    return decodeEntities(span.children.join("").trim());
  }).join("\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.svg || !args.out) {
    console.error("Usage: node scripts/svg-to-scene.mjs --svg diagram.svg --out scene.json");
    process.exitCode = 1;
  } else {
    try {
      const svg = readFileSync(resolve(args.svg), "utf8");
      const scene = convert(svg);
      for (const warning of scene.metadata.conversionWarnings) console.warn(`SVG warning: ${warning}`);
      writeFileSync(resolve(args.out), `${JSON.stringify(scene, null, 2)}\n`, "utf8");
      console.log(`Converted ${scene.elements.length} SVG elements to ${resolve(args.out)}`);
    } catch (error) {
      console.error(`SVG conversion failed: ${error.message}`);
      process.exitCode = 1;
    }
  }
}
