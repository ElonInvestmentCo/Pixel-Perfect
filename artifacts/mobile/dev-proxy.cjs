#!/usr/bin/env node
/**
 * dev-proxy.cjs — Replit development reverse proxy
 *
 * Listens on the webview port (5000) and routes:
 *
 *   /api/auth/*   → Railway production backend (HTTPS) — ALWAYS, no toggle.
 *                   Google OAuth, Apple Sign-In, JWT issuance must remain on
 *                   Railway. The Google Cloud Console redirect URI is registered
 *                   there and cannot be changed.
 *
 *   /api/*        → LOCAL_API_TOGGLE=true  → local API server (port 3000)
 *   (non-auth)    → LOCAL_API_TOGGLE unset → Railway (default, same as auth)
 *
 *   /*            → Expo Metro web (port 8081) — always local.
 *
 * WebSocket upgrades (Expo Metro HMR) are tunnelled via raw TCP.
 *
 * Toggle (development only):
 *   Set LOCAL_API_TOGGLE=true in the workflow env or shell to route non-auth
 *   API traffic to the local Express server instead of Railway.
 */
"use strict";

const http  = require("http");
const https = require("https");
const net   = require("net");
const url   = require("url");

const RAILWAY_BACKEND  = "https://pixel-perfect-production-812e.up.railway.app";
const LOCAL_API_PORT   = parseInt(process.env.LOCAL_API_PORT || "3000", 10);
const EXPO_PORT        = parseInt(process.env.EXPO_PORT || "8082", 10);
const PROXY_PORT       = 5000;
const USE_LOCAL_API    = process.env.LOCAL_API_TOGGLE === "true";

if (USE_LOCAL_API) {
  console.log(`[dev-proxy] LOCAL_API_TOGGLE=true — non-auth /api/* → localhost:${LOCAL_API_PORT}`);
} else {
  console.log(`[dev-proxy] LOCAL_API_TOGGLE not set — all /api/* → Railway`);
}

// ── Auth paths — always Railway, no toggle ────────────────────────────────────

function isAuthPath(reqUrl) {
  const pathname = (reqUrl || "/").split("?")[0];
  return pathname.startsWith("/api/auth");
}

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
  const reqPath = req.url || "/";

  if (reqPath.startsWith("/api")) {
    // Auth routes: always Railway regardless of toggle.
    if (isAuthPath(reqPath)) {
      proxyHttpRailway(req, res);
      return;
    }

    // Non-auth data routes: local when toggled, otherwise Railway.
    if (USE_LOCAL_API) {
      proxyHttpLocal(req, res, LOCAL_API_PORT);
    } else {
      proxyHttpRailway(req, res);
    }
    return;
  }

  // Everything else (Expo Metro / web assets).
  proxyHttpLocal(req, res, EXPO_PORT);
});

server.on("upgrade", (req, socket, head) => {
  proxyWs(req, socket, head, EXPO_PORT);
});

server.listen(PROXY_PORT, "0.0.0.0", () => {
  console.log(`\n[dev-proxy] Listening on port ${PROXY_PORT}`);
  console.log(`  /api/auth/*  → Railway (always)  (${RAILWAY_BACKEND})`);
  if (USE_LOCAL_API) {
    console.log(`  /api/*       → Local API server (port ${LOCAL_API_PORT})  ← toggle ON`);
  } else {
    console.log(`  /api/*       → Railway (toggle off)  (${RAILWAY_BACKEND})`);
  }
  console.log(`  /*           → Expo Metro        (port ${EXPO_PORT})\n`);
});
