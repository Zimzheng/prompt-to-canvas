#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function languageProfile(language) {
  const normalized = String(language || "").toLowerCase();
  if (["zh", "zh-cn", "zh-tw", "chinese"].includes(normalized)) {
    return {
      name: "Chinese",
      pattern: /[\u3400-\u9fff]/u,
      mismatchPattern: null,
    };
  }
  if (["ja", "jp", "japanese"].includes(normalized)) {
    return {
      name: "Japanese",
      pattern: /[\u3040-\u30ff\u3400-\u9fff]/u,
      mismatchPattern: null,
    };
  }
  if (["ko", "kr", "korean"].includes(normalized)) {
    return {
      name: "Korean",
      pattern: /[\uac00-\ud7af]/u,
      mismatchPattern: null,
    };
  }
  if (["en", "fr", "es", "de", "it", "pt", "nl", "id", "vi", "latin"].includes(normalized)) {
    return {
      name: "Latin-script",
      pattern: /[A-Za-zÀ-ÖØ-öø-ÿ]/u,
      mismatchPattern: /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/u,
    };
  }
  return null;
}

const args = parseArgs(process.argv.slice(2));
const scenePath = args.scene ? resolve(process.cwd(), args.scene) : null;

if (!scenePath) {
  console.error("Usage: node scripts/validate-scene.mjs --scene scene.json");
  process.exit(1);
}

const scene = JSON.parse(readFileSync(scenePath, "utf8"));
const elements = scene.elements || [];
const textElements = elements.filter((element) => element.type === "text");

if (scene.type !== "excalidraw") fail("Scene type must be excalidraw.");
if (!Array.isArray(elements)) fail("Scene elements must be an array.");
if (scene.appState?.viewBackgroundColor !== "#ffffff") {
  fail("Scene appState.viewBackgroundColor must be #ffffff. Put style paper/background colors in editable rectangle elements instead.");
}

for (const element of elements) {
  const label = element.id || "<missing id>";
  if ("fillColor" in element) fail(`${label}: use backgroundColor, not fillColor.`);
  if ("color" in element) fail(`${label}: use strokeColor, not color.`);
  if (typeof element.fontFamily === "string") fail(`${label}: fontFamily must be numeric, not a string.`);

  for (const key of ["id", "type", "x", "y", "width", "height", "strokeColor", "backgroundColor"]) {
    if (!(key in element)) fail(`${label}: missing ${key}.`);
  }

  if (element.type === "text") {
    for (const key of ["text", "originalText", "fontSize", "fontFamily", "textAlign", "verticalAlign", "lineHeight"]) {
      if (!(key in element)) fail(`${label}: text element missing ${key}.`);
    }
  }

  if (["line", "arrow"].includes(element.type) && !Array.isArray(element.points)) {
    fail(`${label}: ${element.type} element missing points.`);
  }
}

if (args["expected-language"]) {
  const profile = languageProfile(args["expected-language"]);
  const visibleTexts = textElements.map((element) => String(element.text || "").trim()).filter(Boolean);
  const meaningfulTexts = visibleTexts.filter((text) => text.replace(/\s+/g, "").length > 2);

  if (profile) {
    const matchingTexts = meaningfulTexts.filter((text) => profile.pattern.test(text));
    const mismatchingTexts = profile.mismatchPattern
      ? meaningfulTexts.filter((text) => profile.mismatchPattern.test(text))
      : [];
    if (meaningfulTexts.length > 0 && matchingTexts.length === 0) {
      fail(`Expected ${profile.name} visible canvas text, but no matching text elements were found.`);
    }
    if (meaningfulTexts.length >= 3 && matchingTexts.length / meaningfulTexts.length < 0.6) {
      fail(`Expected ${profile.name} as the dominant canvas language/script, but only ${matchingTexts.length}/${meaningfulTexts.length} meaningful text elements matched.`);
    }
    if (mismatchingTexts.length >= 3 && mismatchingTexts.length / meaningfulTexts.length > 0.4) {
      fail(`Expected ${profile.name} visible canvas text, but ${mismatchingTexts.length}/${meaningfulTexts.length} meaningful text elements use a conflicting script.`);
    }
  }
}

if (!process.exitCode) {
  console.log(`Scene OK: ${scenePath}`);
}
