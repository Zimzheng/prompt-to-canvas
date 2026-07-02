#!/usr/bin/env node
import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(__dirname, "..");
const editorRoot = resolve(skillRoot, "assets/editor");
const DEFAULT_BASE_PORT = 8765;
const DEFAULT_MAX_PORT = 8999;
const PORT_STATE_PATH = join(tmpdir(), "prompt-to-canvas-open-editor-state.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".woff2": "font/woff2",
};

function parseArgs(argv) {
  const args = { host: "127.0.0.1" };
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

function resolveStaticPath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split("?")[0]);
  const relativePath = decodedPath === "/" ? "index.html" : decodedPath.replace(/^\/+/, "");
  const filePath = resolve(editorRoot, relativePath);
  if (!filePath.startsWith(editorRoot)) return null;
  return filePath;
}

function serveFile(request, response, sceneJson, scenePath) {
  const url = new URL(request.url || "/", "http://127.0.0.1");
  if (url.pathname === scenePath) {
    if (!sceneJson) {
      response.writeHead(404, { "content-type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ error: "No scene loaded" }));
      return;
    }

    response.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    response.end(sceneJson);
    return;
  }

  const filePath = resolveStaticPath(request.url || "/");
  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "content-type": MIME_TYPES[extname(filePath)] || "application/octet-stream",
    "cache-control": "no-store",
  });
  createReadStream(filePath).pipe(response);
}

function listen(server, host, port) {
  return new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(port, host, () => {
      server.off("error", rejectListen);
      resolveListen(server.address());
    });
  });
}

function readPreferredPort(explicitPort) {
  if (explicitPort) return Number(explicitPort);

  try {
    const state = JSON.parse(readFileSync(PORT_STATE_PATH, "utf8"));
    const lastPort = Number(state.lastPort);
    if (Number.isInteger(lastPort) && lastPort >= DEFAULT_BASE_PORT && lastPort < DEFAULT_MAX_PORT) {
      return lastPort + 1;
    }
  } catch {
    // Missing or invalid state simply starts from the base port.
  }

  return DEFAULT_BASE_PORT;
}

function writePortState(port) {
  try {
    writeFileSync(
      PORT_STATE_PATH,
      `${JSON.stringify({ lastPort: port, updatedAt: new Date().toISOString() }, null, 2)}\n`,
      "utf8",
    );
  } catch {
    // Port persistence is a convenience; the server can still run without it.
  }
}

function candidatePorts(preferredPort) {
  const start = Number(preferredPort);
  const ports = [];
  for (let port = start; port <= DEFAULT_MAX_PORT; port += 1) ports.push(port);
  for (let port = DEFAULT_BASE_PORT; port < start; port += 1) ports.push(port);
  return ports;
}

function createScenePath() {
  return `/__prompt_to_canvas_scene_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.json`;
}

async function startServer(host, preferredPort, sceneJson, scenePath) {
  for (const port of candidatePorts(preferredPort)) {
    const server = createServer((request, response) => serveFile(request, response, sceneJson, scenePath));
    try {
      const address = await listen(server, host, port);
      writePortState(address.port);
      return { server, port: address.port };
    } catch (error) {
      if (error.code !== "EADDRINUSE") throw error;
    }
  }
  throw new Error(`No open port found in ${DEFAULT_BASE_PORT}-${DEFAULT_MAX_PORT}`);
}

function openUrl(url) {
  if (process.platform === "darwin") {
    spawn("open", [url], { detached: true, stdio: "ignore" }).unref();
    return;
  }
  if (process.platform === "win32") {
    spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
    return;
  }
  spawn("xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
}

const args = parseArgs(process.argv.slice(2));

if (!existsSync(join(editorRoot, "index.html"))) {
  console.error(`Editor assets not found at ${editorRoot}`);
  process.exit(1);
}

const sceneJson = args.scene ? readFileSync(resolve(process.cwd(), args.scene), "utf8") : null;
const scenePath = createScenePath();
const preferredPort = readPreferredPort(args.port);
const { server, port } = await startServer(args.host, preferredPort, sceneJson, scenePath);
const sceneQuery = sceneJson ? `?scene=${encodeURIComponent(scenePath)}&v=${Date.now()}` : "";
const url = `http://${args.host}:${port}/${sceneQuery}`;

console.log(url);
if (!args["no-open"]) openUrl(url);

process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});
