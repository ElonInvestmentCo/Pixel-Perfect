---
name: Expo Go QR code 502 on Replit
description: Why Expo Go gets 502 on Replit and the exact workflow fix using PORT=5000 + dev script.
---

## Rule
Always run Expo via `PORT=5000 pnpm --filter @workspace/mobile run dev` with `waitForPort: 5000` and `outputType: "webview"`.

**Never** use `--port 8082` without a dev-proxy — Metro with `--localhost` binds only to `127.0.0.1:8082`, which is not externally reachable. The QR code says "port 8082" but phones cannot connect → 502.

**Never** omit `PORT=5000` — Replit's default `$PORT=3000` is occupied by the API server, causing Metro to prompt interactively and fail in CI mode.

## Why
The `dev` script in `artifacts/mobile/package.json` sets:
- `EXPO_PACKAGER_PROXY_URL=https://$REPLIT_EXPO_DEV_DOMAIN` — QR code uses `exps://...expo.janeway.replit.dev` (stable, accessible from any phone)
- `REACT_NATIVE_PACKAGER_HOSTNAME=$REPLIT_DEV_DOMAIN` — Metro knows its public hostname
- `--port $PORT` — Metro starts on port 5000 when `PORT=5000` is set

Replit routes `*.expo.janeway.replit.dev` → port 5000 (via `waitForPort`), so Expo Go connects directly to Metro.

## How to apply
Workflow config:
```javascript
await configureWorkflow({
  name: "Start Expo Native App",
  command: "PORT=5000 pnpm --filter @workspace/mobile run dev",
  waitForPort: 5000,
  outputType: "webview",
  autoStart: true
});
```

The API server runs on port 3000. Railway handles all backend API calls (no local proxy needed).
