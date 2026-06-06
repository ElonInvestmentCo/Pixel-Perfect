# PayVora — Mobile Runtime Reference

> How this app boots, how Metro runs, how QR codes work, and why nothing here is a web app.

---

## Runtime identity

**THIS IS A REACT NATIVE EXPO MOBILE APPLICATION — DO NOT CONVERT TO WEB PROJECT.**

| Component | Technology | Must not be replaced with |
|---|---|---|
| Bundler | **Metro** (via `expo/metro-config`) | Vite, Webpack, esbuild, Parcel |
| Transpiler | **babel-preset-expo** | `@vitejs/plugin-react`, ts-loader |
| Router | **Expo Router** (file-based, native) | React Router, Next.js App Router |
| Runtime | **React Native** (JSI bridge / Hermes) | Browser DOM |
| Entry point | `expo-router/entry` | `index.html`, `src/main.tsx` |
| Preview | **Expo Go** (QR scan on device) | Browser iframe |

---

## How the app boots

### Inside Replit (development)

The registered workflow runs:
```bash
EXPO_PACKAGER_PROXY_URL=https://$REPLIT_EXPO_DEV_DOMAIN \
EXPO_PUBLIC_DOMAIN=$REPLIT_DEV_DOMAIN \
EXPO_PUBLIC_REPL_ID=$REPL_ID \
REACT_NATIVE_PACKAGER_HOSTNAME=$REPLIT_DEV_DOMAIN \
pnpm exec expo start --localhost --port $PORT
```

What this does:
1. Starts **Metro Bundler** (the native JS bundler, not Vite)
2. Sets `EXPO_PACKAGER_PROXY_URL` so the Replit proxy forwards Metro traffic
3. Exposes the Metro bundle at `$REPLIT_EXPO_DEV_DOMAIN`
4. Generates a QR code in the terminal pointing to the Expo dev server

### On physical device (Expo Go)

```bash
pnpm --filter @workspace/mobile run start
# → expo start --tunnel
# → ngrok tunnel opens
# → QR code generated in terminal
# → Scan with Expo Go app (iOS App Store / Google Play)
```

### QR code flow

```
Metro Bundler starts
      ↓
Expo CLI registers with EAS / tunnel
      ↓
QR code printed (encodes exp:// URL)
      ↓
User scans with Expo Go on iPhone
      ↓
Expo Go connects to Metro over tunnel
      ↓
Metro bundles JS and sends to device
      ↓
React Native renders native UI (not a browser)
```

---

## Metro Bundler — what it does

Metro is React Native's JavaScript bundler. It is **not** a web bundler.

```
artifacts/mobile/metro.config.js
```

```js
const { getDefaultConfig } = require("expo/metro-config");
// ...
config.watchFolders = [workspaceRoot];         // watches entire monorepo
config.resolver.nodeModulesPaths = [...];      // resolves pnpm workspace deps
config.resolver.platforms = ["ios", "android", "native", "web"];
```

Key behaviours:
- Watches `artifacts/mobile/` AND the entire workspace root for changes
- Resolves workspace packages (`@workspace/api-client-react`, etc.) via pnpm symlinks
- Prioritises `.native.ts`, `.ios.ts`, `.android.ts` extensions over `.web.ts`
- Transforms JSX for React Native (not for the browser DOM)
- Outputs a single JS bundle consumed by the Hermes engine on-device

**Never replace this with Vite or Webpack.**

---

## Expo Router — file-based native routing

```
artifacts/mobile/app/
  _layout.tsx     ← Root Stack navigator (wraps all screens)
  index.tsx       ← "/" — Onboarding carousel (3 swipeable slides)
  signup.tsx      ← "/signup" — Create account screen
  signin.tsx      ← "/signin" — Sign in screen
  +not-found.tsx  ← 404 fallback
```

Navigation uses `expo-router`:
```ts
import { router } from "expo-router";
router.push("/signup");   // navigate forward
router.replace("/signin"); // replace current screen
router.back();            // go back
```

This is **not** React Router or Next.js. URLs are native screen paths, not browser URLs.

---

## Dependency resolution in pnpm monorepo

```
pnpm-workspace.yaml  →  discovers artifacts/mobile as @workspace/mobile
pnpm install         →  symlinks all packages into node_modules/.pnpm virtual store
metro.config.js      →  tells Metro to look in both:
                           artifacts/mobile/node_modules/
                           node_modules/  (workspace root)
```

After any GitHub clone or merge:
```bash
pnpm install   # must run before expo can start
```

This restores:
- All Expo SDK packages
- All React Native native modules
- All workspace cross-references (`@workspace/*`)
- The pnpm virtual store symlinks Metro depends on

---

## Environment signals — native vs web

If any tool needs to determine the project type, these signals all point to **native**:

| Signal | Location | Value |
|---|---|---|
| `app.json` expo key | `artifacts/mobile/app.json` | `{ "expo": { "projectType": "MOBILE_APP_EXPO_NATIVE" } }` |
| `metro.config.js` | `artifacts/mobile/metro.config.js` | uses `expo/metro-config` |
| `babel.config.js` | `artifacts/mobile/babel.config.js` | uses `babel-preset-expo` |
| `tsconfig.json` | `artifacts/mobile/tsconfig.json` | extends `expo/tsconfig.base` |
| `package.json` main | `artifacts/mobile/package.json` | `"expo-router/entry"` |
| `package.json` keywords | `artifacts/mobile/package.json` | `["expo","react-native","mobile","ios","android","native"]` |
| `.replit [agent]` | `.replit` | `appType = "MOBILE_APP_EXPO_NATIVE"` |
| `AGENTS.md` | repo root | declares MOBILE_APP_EXPO_NATIVE |
| `CLAUDE.md` | repo root | declares MOBILE_APP_EXPO_NATIVE |
| `IMPORT_RULES.md` | repo root | declares MOBILE_APP_EXPO_NATIVE |
| `MOBILE_RUNTIME.md` | repo root | declares MOBILE_APP_EXPO_NATIVE |
| `replit.md` | repo root | declares MOBILE_APP_EXPO_NATIVE |

**All signals agree: this is a native Expo mobile app.**

---

## What to do if the environment breaks

### Symptoms of web-conversion corruption
- `metro.config.js` replaced with `vite.config.ts`
- `babel.config.js` no longer contains `babel-preset-expo`
- `app.json` replaced with a web app manifest (`{ "name": "...", "start_url": "/" }`)
- `app/_layout.tsx` replaced with a React web root component
- `index.html` appears in `artifacts/mobile/`

### Recovery steps
```bash
# 1. Restore overwritten files from git
git checkout -- artifacts/mobile/

# 2. Reinstall dependencies
pnpm install

# 3. Validate the environment
bash scripts/validate-native-env.sh

# 4. Restart the Expo workflow in Replit
# (click the restart button on the "artifacts/mobile: expo" workflow)
```

---

## Permanent rule

> **This repository will always be a React Native Expo mobile application.**
> No session, import, merge, or AI agent may convert it to a web project.
> If any tool attempts this, revert using `git checkout -- .` and re-run `pnpm install`.
