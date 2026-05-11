const childProcess = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");

const HOST = "127.0.0.1";
const DEFAULT_PORT = 8000;
const WEB_DIR = path.join(__dirname, "web");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function getArgValue(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? Number(process.argv[index + 1]) : fallback;
}

function shouldOpenBrowser() {
  return !process.argv.includes("--no-open");
}

function resolveRequestPath(url) {
  const parsedUrl = new URL(url, `http://${HOST}`);
  const safePath = path
    .normalize(decodeURIComponent(parsedUrl.pathname))
    .replace(/^(\.\.[/\\])+/, "");
  const requestedPath = safePath === path.sep ? "index.html" : safePath.slice(1);
  return path.join(WEB_DIR, requestedPath);
}

function openBrowser(url) {
  if (process.platform === "win32") {
    childProcess.exec(`start "" "${url}"`);
    return;
  }

  if (process.platform === "darwin") {
    childProcess.exec(`open "${url}"`);
    return;
  }

  childProcess.exec(`xdg-open "${url}"`);
}

function createServer() {
  return http.createServer((request, response) => {
    const filePath = resolveRequestPath(request.url);

    if (!filePath.startsWith(WEB_DIR)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream",
      });
      response.end(content);
    });
  });
}

function listen(port) {
  const server = createServer();

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && port < DEFAULT_PORT + 50) {
      listen(port + 1);
      return;
    }

    throw error;
  });

  server.listen(port, HOST, () => {
    const url = `http://${HOST}:${port}`;
    console.log("EMI Calculator web app is running locally.");
    console.log(`Open: ${url}`);
    console.log("Press Ctrl+C to stop the server.");

    if (shouldOpenBrowser()) {
      openBrowser(url);
    }
  });
}

listen(getArgValue("--port", DEFAULT_PORT));
