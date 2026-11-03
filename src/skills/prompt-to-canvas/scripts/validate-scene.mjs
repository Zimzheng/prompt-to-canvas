#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const TYPES = new Set(["rectangle", "ellipse", "diamond", "line", "arrow", "text"]);
const SHAPES = new Set(["rectangle", "ellipse", "diamond"]);

export function validateScene(scene, { expectedLanguage } = {}) {
  const errors = [];
  const fail = message => errors.push(message);
  if (!scene || typeof scene !== "object") return ["Scene must be an object."];
  if (scene.type !== "excalidraw") fail("Scene type must be excalidraw.");
  if (scene.appState?.viewBackgroundColor !== "#ffffff") fail("Scene appState.viewBackgroundColor must be #ffffff; use an editable paper rectangle.");
  if (!Array.isArray(scene.elements)) return [...errors, "Scene elements must be an array."];
  if (!scene.elements.length) fail("Scene contains no elements.");
  const elements = scene.elements;
  const byId = new Map();
  for (const element of elements) {
    if (!element || typeof element !== "object") { fail("Every element must be an object."); continue; }
    const label = element.id || "<missing id>";
    if (typeof element.id !== "string" || !element.id.trim()) fail(`${label}: id must be a nonempty string.`);
    if (byId.has(element.id)) fail(`${label}: duplicate id.`);
    byId.set(element.id, element);
    if (!TYPES.has(element.type)) fail(`${label}: unsupported element type ${element.type}.`);
    for (const key of ["fillColor", "color"]) if (key in element) fail(`${label}: invalid field ${key}.`);
    for (const key of ["x", "y", "width", "height", "angle", "strokeWidth", "opacity"]) {
      if (typeof element[key] !== "number" || !Number.isFinite(element[key])) fail(`${label}: ${key} must be finite.`);
    }
    if (element.width < 0 || element.height < 0) fail(`${label}: dimensions must be nonnegative.`);
    if (SHAPES.has(element.type) && (!element.width || !element.height)) fail(`${label}: shapes need positive dimensions.`);
    if (element.opacity < 0 || element.opacity > 100) fail(`${label}: opacity must be between 0 and 100.`);
    for (const key of ["strokeColor", "backgroundColor"]) {
      if (typeof element[key] !== "string" || !element[key]) fail(`${label}: ${key} must be a colour string.`);
    }
    if (!Array.isArray(element.groupIds) || element.groupIds.some(id => typeof id !== "string" || !id.trim())
      || new Set(element.groupIds).size !== element.groupIds.length) fail(`${label}: groupIds must be unique nonempty strings.`);
    if (element.boundElements !== null && !Array.isArray(element.boundElements)) fail(`${label}: boundElements must be an array or null.`);
    if (element.type === "text") {
      for (const key of ["text", "originalText", "textAlign", "verticalAlign"]) if (typeof element[key] !== "string") fail(`${label}: missing/invalid ${key}.`);
      if (!Number.isInteger(element.fontFamily) || element.fontFamily <= 0) fail(`${label}: fontFamily must be a numeric font ID.`);
      if (!Number.isFinite(element.fontSize) || element.fontSize <= 0 || !Number.isFinite(element.lineHeight) || element.lineHeight <= 0) fail(`${label}: invalid text sizing.`);
    }
    if (["line", "arrow"].includes(element.type)) {
      if (!Array.isArray(element.points) || element.points.length < 2
        || element.points.some(point => !Array.isArray(point) || point.length !== 2 || point.some(value => typeof value !== "number" || !Number.isFinite(value)))) fail(`${label}: invalid line points.`);
      if (element.type === "arrow") for (const key of ["startArrowhead", "endArrowhead"]) if (!(key in element)) fail(`${label}: missing ${key}.`);
    }
  }
  for (const element of elements.filter(element => element && typeof element === "object")) {
    const label = element.id || "<missing id>";
    if (element.containerId != null) {
      const target = byId.get(element.containerId);
      if (element.type !== "text" || !target || !SHAPES.has(target.type)) fail(`${label}: invalid text container.`);
      else if (!Array.isArray(target.boundElements) || !target.boundElements.some(bound => bound?.id === element.id && bound.type === "text")) fail(`${label}: container lacks reciprocal text reference.`);
    }
    for (const key of ["startBinding", "endBinding"]) {
      const binding = element[key];
      if (binding == null) continue;
      const target = byId.get(binding.elementId);
      if (element.type !== "arrow" || !target || !SHAPES.has(target.type)) fail(`${label}: invalid ${key} target.`);
      if (!Number.isFinite(binding.focus) || Math.abs(binding.focus) > 1 || !Number.isFinite(binding.gap) || binding.gap < 0) fail(`${label}: invalid ${key} geometry.`);
      if (!Array.isArray(target?.boundElements) || !target.boundElements.some(bound => bound?.id === element.id && bound.type === "arrow")) fail(`${label}: ${key} lacks reciprocal arrow reference.`);
    }
    if (Array.isArray(element.boundElements)) {
      const boundIds = new Set();
      let texts = 0;
      for (const bound of element.boundElements) {
        if (!bound || typeof bound !== "object") { fail(`${label}: invalid bound element.`); continue; }
        if (boundIds.has(bound.id)) fail(`${label}: duplicate bound reference ${bound.id}.`);
        boundIds.add(bound.id);
        const target = byId.get(bound.id);
        if (!target || target.type !== bound.type) { fail(`${label}: dangling bound reference ${bound.id}.`); continue; }
        if (bound.type === "text") {
          texts++;
          if (target.containerId !== element.id) fail(`${label}: text binding is not reciprocal.`);
        } else if (bound.type === "arrow") {
          if (![target.startBinding?.elementId, target.endBinding?.elementId].includes(element.id)) fail(`${label}: arrow binding is not reciprocal.`);
        } else fail(`${label}: unsupported bound reference type.`);
      }
      if (texts > 1) fail(`${label}: only one bound text label is supported.`);
    }
  }
  if (expectedLanguage) {
    const language = String(expectedLanguage).toLowerCase();
    const profiles = {
      zh: [/[\u3400-\u9fff]/u, null], ja: [/[\u3040-\u30ff\u3400-\u9fff]/u, null], ko: [/[\uac00-\ud7af]/u, null],
      latin: [/[A-Za-zÀ-ÖØ-öø-ÿ]/u, /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/u],
    };
    const key = /^(zh|chinese)/.test(language) ? "zh" : /^(ja|jp|japanese)$/.test(language) ? "ja"
      : /^(ko|kr|korean)$/.test(language) ? "ko" : /^(en|fr|es|de|it|pt|nl|id|vi|latin)$/.test(language) ? "latin" : null;
    if (!key) fail(`Unsupported expected-language: ${expectedLanguage}.`);
    else {
      const texts = elements.filter(element => element?.type === "text").map(element => String(element.text || "").trim()).filter(text => text.replace(/\s+/g, "").length > 2);
      const [pattern, mismatch] = profiles[key];
      const matches = texts.filter(text => pattern.test(text)).length;
      if (texts.length && (!matches || texts.length >= 3 && matches / texts.length < 0.6)) fail(`Expected ${expectedLanguage} as the dominant visible script.`);
      if (mismatch && texts.length >= 3 && texts.filter(text => mismatch.test(text)).length / texts.length > 0.4) fail(`Conflicting visible script for ${expectedLanguage}.`);
    }
  }
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = {};
  for (let i = 2; i < process.argv.length; i += 2) args[process.argv[i].replace(/^--/, "")] = process.argv[i + 1];
  try {
    if (!args.scene) throw new Error("Usage: node scripts/validate-scene.mjs --scene scene.json [--expected-language zh]");
    const scene = JSON.parse(readFileSync(resolve(args.scene), "utf8"));
    const errors = validateScene(scene, { expectedLanguage: args["expected-language"] });
    if (errors.length) { for (const error of errors) console.error(error); process.exitCode = 1; }
    else console.log(`Scene OK: ${resolve(args.scene)}`);
  } catch (error) { console.error(`Scene validation failed: ${error.message}`); process.exitCode = 1; }
}
