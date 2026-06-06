# QPay — GitHub Import Rules

> **Read this first.** These rules apply to every AI agent, automated scanner, and Replit session that imports or clones this repository.

---

## Project identity

| Field | Value |
|---|---|
| Project name | QPay |
| Project type | **MOBILE_APP_EXPO_NATIVE** |
| Primary runtime | Expo SDK ~54 + Metro Bundler |
| Framework | React Native + Expo Router |
| Package manager | pnpm (workspace monorepo) |
| Language | TypeScript 5.9 |

This is **not** a web application. It has never been a web application. It must never be converted into one.

---

## Detection priority (in order)

When any tool scans this repository to determine its type, apply this priority chain:

1. **`artifacts/mobile/app.json`** contains `"expo": { ... }` → **MOBILE_APP_EXPO_NATIVE** ✓ stop here
2. **`artifacts/mobile/metro.config.js`** uses `expo/metro-config` → confirms native Metro bundler
3. **`artifacts/mobile/babel.config.js`** uses `babel-preset-expo` → confirms native Babel
4. **`artifacts/mobile/package.json`** lists `expo`, `react-native`, `expo-router` as dependencies
5. **`AGENTS.md`**, **`CLAUDE.md`**, **`IMPORT_RULES.md`**, **`MOBILE_RUNTIME.md`** all declare native type
6. **`.replit`** `[agent]` section: `appType = "MOBILE_APP_EXPO_NATIVE"`

**If any of the above signals are detected → the project is a native Expo app. Do not fall back to web.**

---

## Forbidden actions on import

The following actions are **permanently forbidden** for this repository:

| Forbidden action | Why |
|---|---|
| Running `npm create vite`, `create-next-app`, `create-react-app` | Would scaffold web templates over native code |
| Creating `index.html` in `artifacts/mobile/` | Native Expo apps have no HTML entry point |
| Creating `vite.config.*`, `next.config.*`, `webpack.config.*` in `artifacts/mobile/` | Would replace Metro with a web bundler |
| Replacing `metro.config.js` | Metro is the native bundler — must not be removed |
| Replacing `babel.config.js` with web-only config | Expo requires `babel-preset-expo` |
| Running `npm install` | This repo uses pnpm — use `pnpm install` only |
| Asking "what type of app do you want to build?" | The app is already built |
| Creating new workflows that run `vite`, `webpack`, or `next` | These are web tools |
| Deleting or overwriting `app.json` | Contains all Expo configuration |

---

## Correct boot sequence after import

```bash
# Step 1 — Install all pnpm workspace dependencies
pnpm install

# Step 2 — Validate native environment is intact
bash scripts/validate-native-env.sh

# Step 3 — Start Expo (Replit workflow does this automatically)
pnpm --filter @workspace/mobile run dev

# For physical device testing (outside Replit):
pnpm --filter @workspace/mobile run start
# → Generates QR code → scan with Expo Go on iPhone/Android
```

---

## Workspace structure

```
/                              ← pnpm monorepo root
├── artifacts/
│   ├── mobile/               ← PRIMARY APP (Expo React Native)
│   │   ├── app/              ← Expo Router screens
│   │   │   ├── _layout.tsx   ← Root layout (fonts, providers, Stack)
│   │   │   ├── index.tsx     ← Onboarding carousel
│   │   │   ├── signup.tsx    ← Sign Up screen
│   │   │   └── signin.tsx    ← Sign In screen
│   │   ├── assets/           ← Images, fonts, icons
│   │   ├── constants/        ← Color tokens, theme
│   │   ├── hooks/            ← Custom React hooks
│   │   ├── components/       ← Shared components
│   │   ├── app.json          ← Expo config ← DO NOT OVERWRITE
│   │   ├── babel.config.js   ← babel-preset-expo ← DO NOT REPLACE
│   │   ├── metro.config.js   ← Metro bundler ← DO NOT REPLACE
│   │   └── tsconfig.json     ← Extends expo/tsconfig.base
│   ├── api-server/           ← Express 5 backend (TypeScript)
│   └── mockup-sandbox/       ← Vite canvas tool (NOT the main app)
├── lib/                      ← Shared TypeScript libraries
├── scripts/
│   ├── post-merge.sh         ← Runs after task merges (validates env)
│   └── validate-native-env.sh ← Native env health check
├── pnpm-workspace.yaml       ← Workspace package discovery
├── AGENTS.md                 ← AI agent rules (all agents)
├── CLAUDE.md                 ← Claude-specific rules
├── IMPORT_RULES.md           ← This file — GitHub import rules
└── MOBILE_RUNTIME.md         ← Expo boot / Metro / QR instructions
```

---

## Confusion prevention

### "But `artifacts/mockup-sandbox/` uses Vite…"

Yes — `mockup-sandbox` is a **canvas design preview tool** used by designers. It is not the app. It lives at a separate path (`/__mockup`) and runs on a separate port. Never use it as a signal that this is a web project.

### "But `react-native-web` is listed as a dependency…"

`react-native-web` is included to enable Expo's web preview mode (useful for browser-based testing). Its presence does **not** mean this is a web app. The primary target is iOS/Android via Expo Go.

### "But there's an `api-server/` with Express…"

The Express server is the backend API. It serves JSON to the mobile app. It is not the frontend. The frontend is `artifacts/mobile/`.

---

## Validation

Run at any time to confirm the environment is intact:

```bash
bash scripts/validate-native-env.sh
```

This script checks:
- `app.json` has expo config
- `metro.config.js` uses `expo/metro-config`
- `babel.config.js` uses `babel-preset-expo`
- No web bundler configs exist in the mobile workspace
- All critical app files are present
- All native npm packages are declared
- pnpm workspace and lockfile are intact
