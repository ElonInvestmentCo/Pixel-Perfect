#!/usr/bin/env node
/**
 * dev-proxy.cjs — Replit development reverse proxy
 *
 * Listens on the webview port (5000) and routes:
 *   /api/*      → Railway production backend (HTTPS)
 *   /*          → Expo Metro web    (port 8081)
 *
 * WebSocket upgrades (Expo Metro HMR) are tunnelled via raw TCP.
 *
 * NOTE: Metro runs directly on port 8081 (external port 8081) so that
 * Expo Go's exp:// QR URL targets port 8081 directly — bypassing the
 * mTLS-protected webview port 5000 that blocks external phone connections.
 */
"use strict";

const http  = require("http");
const https = require("https");
const net   = require("net");
const url   = require("url");

const RAILWAY_BACKEND = "https://pixel-perfect-production-812e.up.railway.app";
const EXPO_PORT       = 8081;
const PROXY_PORT      = 5000;

// ── HTTP proxy to Railway HTTPS backend ──────────────────────────────────────

function proxyHttpRailway(req, res) {
  const target  = url.parse(RAILWAY_BACKEND);
  const options = {
    hostname : target.hostname,
    port     : 443,
    path     : req.url,
    method   : req.method,
    headers  : {
      ...req.headers,
      host   : target.hostname,
      origin : RAILWAY_BACKEND,
    },
  };

  const upstream = https.request(options, (upstreamRes) => {
    res.writeHead(upstreamRes.statusCode, upstreamRes.headers);
    upstreamRes.pipe(res, { end: true });
  });

  upstream.on("error", (err) => {
    console.error(`[proxy] HTTPS → Railway error: ${err.message}`);
    if (!res.headersSent) res.writeHead(502);
    res.end("Bad Gateway");
  });

  req.pipe(upstream, { end: true });
}

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

  if (path.startsWith("/api")) {
    proxyHttpRailway(req, res);
  } else {
    proxyHttpLocal(req, res, EXPO_PORT);
  }
});

server.on("upgrade", (req, socket, head) => {
  proxyWs(req, socket, head, EXPO_PORT);
});

server.listen(PROXY_PORT, "0.0.0.0", () => {
  console.log(`\n[dev-proxy] Listening on port ${PROXY_PORT}`);
  console.log(`  /api/* → Railway backend  (${RAILWAY_BACKEND})`);
  console.log(`  /*     → Expo Metro       (port ${EXPO_PORT})\n`);
});
