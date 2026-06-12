#!/usr/bin/env node
/**
 * dev-proxy.cjs — Replit development reverse proxy
 *
 * Listens on the webview port (5000) and routes:
 *   /api/*      → Railway backend  (https://pixel-perfect-production-812e.up.railway.app)
 *   /__mockup   → Mockup sandbox   (port 8081)
 *   /*          → Expo Metro web   (port 5001)
 *
 * WebSocket upgrades (Expo Metro HMR) are tunnelled via raw TCP.
 *
 * API calls are forwarded to the Railway backend over HTTPS so the web
 * preview and the mobile app share the same production-equivalent backend.
 */
"use strict";

const http  = require("http");
const https = require("https");
const net   = require("net");
const url   = require("url");

const RAILWAY_URL  = "https://pixel-perfect-production-812e.up.railway.app";
const EXPO_PORT    = 5001;
const MOCKUP_PORT  = 8081;
const PROXY_PORT   = 5000;

// ── HTTP proxy to a local port ────────────────────────────────────────────────

function proxyHttpLocal(req, res, targetPort) {
  const options = {
    hostname : "127.0.0.1",
    port     : targetPort,
    path     : req.url,
    method   : req.method,
    headers  : { ...req.headers, host: `127.0.0.1:${targetPort}` },
  };

  const upstream = http.request(options, (upstreamRes) => {
    res.writeHead(upstreamRes.statusCode, upstreamRes.headers);
    upstreamRes.pipe(res, { end: true });
  });

  upstream.on("error", (err) => {
    console.error(`[proxy] HTTP → :${targetPort} error: ${err.message}`);
    if (!res.headersSent) res.writeHead(502);
    res.end("Bad Gateway");
  });

  req.pipe(upstream, { end: true });
}

// ── HTTPS proxy to Railway ────────────────────────────────────────────────────

function proxyHttpRailway(req, res) {
  const parsed  = url.parse(RAILWAY_URL);
  const options = {
    hostname : parsed.hostname,
    port     : 443,
    path     : req.url,
    method   : req.method,
    headers  : {
      ...req.headers,
      host: parsed.hostname,
    },
  };

  // Remove hop-by-hop headers that confuse upstream
  delete options.headers["connection"];
  delete options.headers["keep-alive"];
  delete options.headers["transfer-encoding"];
  delete options.headers["upgrade"];
  delete options.headers["proxy-connection"];

  const upstream = https.request(options, (upstreamRes) => {
    // Add CORS headers so the browser preview doesn't block responses
    const headers = { ...upstreamRes.headers };
    headers["access-control-allow-origin"]  = "*";
    headers["access-control-allow-methods"] = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
    headers["access-control-allow-headers"] = "Content-Type,Authorization";
    res.writeHead(upstreamRes.statusCode, headers);
    upstreamRes.pipe(res, { end: true });
  });

  upstream.on("error", (err) => {
    console.error(`[proxy] HTTPS → Railway error: ${err.message}`);
    if (!res.headersSent) res.writeHead(502);
    res.end("Bad Gateway");
  });

  req.pipe(upstream, { end: true });
}

// ── WebSocket TCP tunnel (for Expo Metro HMR) ─────────────────────────────────

function proxyWs(req, clientSocket, head, targetPort) {
  const upstream = net.connect(targetPort, "127.0.0.1");

  upstream.on("connect", () => {
    const headerLines = Object.entries(req.headers)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\r\n");
    upstream.write(`${req.method} ${req.url} HTTP/1.1\r\n${headerLines}\r\n\r\n`);
    if (head && head.length > 0) upstream.write(head);
    upstream.pipe(clientSocket);
    clientSocket.pipe(upstream);
  });

  const destroy = (err) => {
    if (err) console.error(`[proxy] WS error: ${err.message}`);
    clientSocket.destroy();
    upstream.destroy();
  };

  upstream.on("error", destroy);
  clientSocket.on("error", destroy);
  upstream.on("close", () => clientSocket.destroy());
  clientSocket.on("close", () => upstream.destroy());
}

// ── Server ────────────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const path = req.url || "/";

  // Preflight — handle CORS for Railway-bound requests
  if (req.method === "OPTIONS" && path.startsWith("/api")) {
    res.writeHead(204, {
      "access-control-allow-origin":  "*",
      "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "access-control-allow-headers": "Content-Type,Authorization",
    });
    res.end();
    return;
  }

  if (path.startsWith("/api")) {
    proxyHttpRailway(req, res);
  } else if (path.startsWith("/__mockup")) {
    proxyHttpLocal(req, res, MOCKUP_PORT);
  } else {
    proxyHttpLocal(req, res, EXPO_PORT);
  }
});

server.on("upgrade", (req, socket, head) => {
  proxyWs(req, socket, head, EXPO_PORT);
});

server.listen(PROXY_PORT, "0.0.0.0", () => {
  console.log(`\n[dev-proxy] Listening on port ${PROXY_PORT}`);
  console.log(`  /api/* → Railway  (${RAILWAY_URL})`);
  console.log(`  /*     → Expo Metro  (port ${EXPO_PORT})\n`);
});
