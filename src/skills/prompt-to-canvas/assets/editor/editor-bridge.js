/**
 * Prompt to Canvas - Editor Bridge
 * Loads and normalizes Excalidraw scene data for the bundled editor.
 */

const EXCALIDRAW_VERSION = 2;

function generateId() {
  return "p2c_" + Math.random().toString(36).slice(2, 11);
}

function versionNonce() {
  return Math.floor(Math.random() * 1000000000);
}

function normalizeFontFamily(fontFamily) {
  return typeof fontFamily === "number" ? fontFamily : 1;
}

function normalizeElement(element) {
  const normalized = { ...element };
  normalized.id = normalized.id || generateId();
  normalized.angle = normalized.angle || 0;
  normalized.strokeColor = normalized.strokeColor || normalized.color || "#18181b";
  normalized.backgroundColor = normalized.backgroundColor || normalized.fillColor || "transparent";
  normalized.fillStyle = normalized.fillStyle || "solid";
  normalized.strokeWidth = normalized.strokeWidth || 1;
  normalized.strokeStyle = normalized.strokeStyle || "solid";
  normalized.roughness = normalized.roughness ?? 0;
  normalized.opacity = normalized.opacity ?? 100;
  normalized.groupIds = normalized.groupIds || [];
  normalized.frameId = normalized.frameId ?? null;
  normalized.roundness = normalized.roundness ?? null;
  normalized.seed = normalized.seed || versionNonce();
  normalized.version = normalized.version || 1;
  normalized.versionNonce = normalized.versionNonce || versionNonce();
  normalized.isDeleted = normalized.isDeleted || false;
  normalized.boundElements = normalized.boundElements ?? null;
  normalized.updated = normalized.updated || Date.now();
  normalized.link = normalized.link ?? null;
  normalized.locked = normalized.locked || false;

  delete normalized.fillColor;
  delete normalized.color;

  if (normalized.type === "text") {
    normalized.text = normalized.text || "";
    normalized.originalText = normalized.originalText ?? normalized.text;
    normalized.fontSize = normalized.fontSize || 16;
    normalized.fontFamily = normalizeFontFamily(normalized.fontFamily);
    normalized.textAlign = normalized.textAlign || "left";
    normalized.verticalAlign = normalized.verticalAlign || "top";
    normalized.containerId = normalized.containerId ?? null;
    normalized.lineHeight = normalized.lineHeight || 1.25;
    normalized.backgroundColor = "transparent";
  }

  if (["line", "arrow"].includes(normalized.type)) {
    normalized.points = normalized.points || [[0, 0], [normalized.width || 100, normalized.height || 0]];
    normalized.lastCommittedPoint = normalized.lastCommittedPoint ?? null;
    normalized.startBinding = normalized.startBinding ?? null;
    normalized.endBinding = normalized.endBinding ?? null;
    normalized.startArrowhead = normalized.startArrowhead ?? null;
    normalized.endArrowhead = normalized.type === "arrow" ? (normalized.endArrowhead ?? "arrow") : null;
    normalized.backgroundColor = "transparent";
  }

  return normalized;
}

function normalizeToExcalidrawScene(input) {
  if (!input) {
    return {
      type: "excalidraw",
      version: EXCALIDRAW_VERSION,
      source: "prompt-to-canvas",
      elements: [],
      appState: { viewBackgroundColor: "#ffffff" },
      files: {},
    };
  }

  return {
    type: "excalidraw",
    version: EXCALIDRAW_VERSION,
    source: "prompt-to-canvas",
    elements: (input.elements || []).map(normalizeElement),
    appState: { ...(input.appState || {}), viewBackgroundColor: "#ffffff" },
    files: input.files || {},
  };
}

function encodeScene(sceneData) {
  return btoa(encodeURIComponent(JSON.stringify(sceneData)));
}

function generateShareURL(baseURL, sceneData) {
  return `${baseURL}?data=${encodeScene(sceneData)}`;
}

function loadDiagramViaURL(baseURL, sceneData) {
  const url = generateShareURL(baseURL, sceneData);
  const newWindow = window.open(url, "_blank");
  if (newWindow) newWindow.focus();
  return url;
}

window.PromptToCanvas = {
  normalizeToExcalidrawScene,
  loadDiagramViaURL,
  generateShareURL,
  generateId,
};
