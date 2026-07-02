import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Excalidraw, exportToBlob, exportToSvg } from "@excalidraw/excalidraw";

const LANGUAGE_STORAGE_KEY = "prompt-to-canvas-language";
const AUTOSAVE_PREFIX = "prompt-to-canvas-autosave";
const AUTOSAVE_DEBOUNCE_MS = 500;

const I18N = {
  zh: {
    excalidrawLang: "zh-CN",
    subtitle: "AI 可编辑画布生成器",
    exportPng: "PNG",
    langButton: "EN",
    langLabel: "Switch to English",
    parseError: "场景数据解析失败，已打开空白画布。",
    loading: "正在加载画布...",
    pngExported: "PNG 已导出",
    pngExportFailed: "PNG 导出失败",
    svgExported: "SVG 已导出",
    svgExportFailed: "SVG 导出失败",
  },
  en: {
    excalidrawLang: "en",
    subtitle: "AI Editable Canvas Generator",
    exportPng: "PNG",
    langButton: "中",
    langLabel: "切换到中文",
    parseError: "Scene data could not be parsed. Opened a blank canvas.",
    loading: "Loading canvas...",
    pngExported: "PNG exported",
    pngExportFailed: "PNG export failed",
    svgExported: "SVG exported",
    svgExportFailed: "SVG export failed",
  },
};

function getInitialLanguage() {
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === "zh" || saved === "en") return saved;
  } catch {
    // localStorage can be unavailable in some embedded browser contexts.
  }

  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

function decodeSceneFromURL() {
  const params = new URLSearchParams(window.location.search);
  const data = params.get("data");
  if (!data) return null;

  try {
    const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
    const parsed = JSON.parse(decodeURIComponent(atob(normalized)));
    return window.PromptToCanvas?.normalizeToExcalidrawScene(parsed) ?? parsed;
  } catch (error) {
    console.warn("[Prompt to Canvas] Failed to decode scene data", error);
    return { error: true };
  }
}

function normalizeScene(scene) {
  return window.PromptToCanvas?.normalizeToExcalidrawScene(scene) ?? scene;
}

function getSceneURL() {
  const params = new URLSearchParams(window.location.search);
  const scene = params.get("scene");
  if (!scene) return null;
  return new URL(scene, window.location.href).toString();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function stableSceneSignature(scene) {
  if (!scene || scene.error) return "blank";

  const elements = (scene.elements || []).map((element) => ({
    id: element.id,
    type: element.type,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    text: element.text,
    points: element.points,
  }));

  return btoa(
    encodeURIComponent(
      JSON.stringify({
        source: scene.source || "prompt-to-canvas",
        background: "#ffffff",
        elements,
      }),
    ),
  ).slice(0, 120);
}

function getAutosaveKey(signature) {
  const params = new URLSearchParams(window.location.search);
  const sceneSource = params.get("scene") || params.get("data") || "blank";
  return `${AUTOSAVE_PREFIX}:${window.location.origin}${window.location.pathname}:${sceneSource}:${signature}`;
}

function readAutosavedScene(signature) {
  try {
    const saved = window.localStorage.getItem(getAutosaveKey(signature));
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return parsed.signature === signature ? parsed.scene : null;
  } catch {
    return null;
  }
}

function writeAutosavedScene(signature, scene) {
  try {
    window.localStorage.setItem(
      getAutosaveKey(signature),
      JSON.stringify({
        signature,
        updatedAt: Date.now(),
        scene,
      }),
    );
  } catch (error) {
    console.warn("[Prompt to Canvas] Failed to autosave scene", error);
  }
}

export default function App() {
  const excalidrawApiRef = useRef(null);
  const autosaveTimerRef = useRef(null);
  const didMountExcalidrawRef = useRef(false);
  const [toast, setToast] = useState("");
  const [language, setLanguage] = useState(getInitialLanguage);
  const decodedScene = useMemo(() => decodeSceneFromURL(), []);
  const sceneURL = useMemo(() => getSceneURL(), []);
  const [remoteScene, setRemoteScene] = useState(null);
  const [isLoadingScene, setIsLoadingScene] = useState(Boolean(sceneURL));
  const copy = I18N[language];

  useEffect(() => {
    if (!sceneURL) return undefined;

    let cancelled = false;
    setIsLoadingScene(true);

    fetch(sceneURL)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load scene: ${response.status}`);
        return response.json();
      })
      .then((scene) => {
        if (!cancelled) setRemoteScene(normalizeScene(scene));
      })
      .catch((error) => {
        console.warn("[Prompt to Canvas] Failed to fetch scene", error);
        if (!cancelled) setRemoteScene({ error: true });
      })
      .finally(() => {
        if (!cancelled) setIsLoadingScene(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sceneURL]);

  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(""), 2200);
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(autosaveTimerRef.current);
    };
  }, []);

  const initialData = useMemo(() => {
    const scene = remoteScene || decodedScene;
    const signature = stableSceneSignature(scene);
    const autosavedScene = readAutosavedScene(signature);
    const restoredScene = autosavedScene || scene;
    if (!restoredScene || restoredScene.error) return undefined;

    return {
      elements: restoredScene.elements || [],
      appState: {
        currentItemStrokeColor: "#18181B",
        currentItemBackgroundColor: "transparent",
        ...restoredScene.appState,
        viewBackgroundColor: "#ffffff",
      },
      files: restoredScene.files || {},
      scrollToContent: true,
    };
  }, [decodedScene, remoteScene]);

  const getScene = useCallback(() => {
    const api = excalidrawApiRef.current;
    if (!api) return null;

    return {
      elements: api.getSceneElements(),
      appState: {
        ...api.getAppState(),
        viewBackgroundColor: "#ffffff",
      },
      files: api.getFiles(),
    };
  }, []);

  const exportPNG = useCallback(async () => {
    const scene = getScene();
    if (!scene) return;

    try {
      const blob = await exportToBlob({
        elements: scene.elements,
        appState: scene.appState,
        files: scene.files,
        mimeType: "image/png",
        exportPadding: 32,
      });
      downloadBlob(blob, "prompt-to-canvas.png");
      showToast(copy.pngExported);
    } catch (error) {
      console.error(error);
      showToast(copy.pngExportFailed);
    }
  }, [copy.pngExportFailed, copy.pngExported, getScene, showToast]);

  const exportSVG = useCallback(async () => {
    const scene = getScene();
    if (!scene) return;

    try {
      const svg = await exportToSvg({
        elements: scene.elements,
        appState: scene.appState,
        files: scene.files,
        exportPadding: 32,
      });
      const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
      downloadBlob(blob, "prompt-to-canvas.svg");
      showToast(copy.svgExported);
    } catch (error) {
      console.error(error);
      showToast(copy.svgExportFailed);
    }
  }, [copy.svgExportFailed, copy.svgExported, getScene, showToast]);

  const toggleLanguage = useCallback(() => {
    setLanguage((current) => {
      const next = current === "zh" ? "en" : "zh";
      try {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
      } catch {
        // Ignore persistence failures; the in-memory switch still works.
      }
      return next;
    });
  }, []);

  const handleSceneChange = useCallback(
    (elements, appState, files) => {
      if (!didMountExcalidrawRef.current) {
        didMountExcalidrawRef.current = true;
        return;
      }

      const baseScene = remoteScene || decodedScene;
      const signature = stableSceneSignature(baseScene);

      window.clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = window.setTimeout(() => {
        writeAutosavedScene(signature, {
          type: "excalidraw",
          version: 2,
          source: "prompt-to-canvas",
          elements,
          appState: {
            ...appState,
            collaborators: undefined,
            viewBackgroundColor: "#ffffff",
          },
          files,
        });
      }, AUTOSAVE_DEBOUNCE_MS);
    },
    [decodedScene, remoteScene],
  );

  return (
    <main className="editor-shell" lang={language}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            P2C
          </div>
          <div>
            <strong>Prompt to Canvas</strong>
            <span>{copy.subtitle}</span>
          </div>
        </div>
        <div className="actions">
          <button
            type="button"
            className="language-toggle"
            onClick={toggleLanguage}
            aria-label={copy.langLabel}
            title={copy.langLabel}
          >
            {copy.langButton}
          </button>
          <button type="button" onClick={exportSVG}>
            SVG
          </button>
          <button type="button" className="primary" onClick={exportPNG}>
            {copy.exportPng}
          </button>
        </div>
      </header>
      {(decodedScene?.error || remoteScene?.error) ? (
        <div className="notice">{copy.parseError}</div>
      ) : null}
      <section className="canvas-host">
        {isLoadingScene ? (
          <div className="loading-state">{copy.loading}</div>
        ) : (
          <Excalidraw
            key={sceneURL ? "remote-scene" : "inline-scene"}
            langCode={copy.excalidrawLang}
            excalidrawAPI={(api) => {
              excalidrawApiRef.current = api;
            }}
            initialData={initialData}
            onChange={handleSceneChange}
            UIOptions={{
              canvasActions: {
                export: false,
                loadScene: true,
                saveToActiveFile: false,
              },
            }}
          />
        )}
      </section>
      {toast ? <div className="toast">{toast}</div> : null}
    </main>
  );
}
