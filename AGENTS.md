# QPay — Agent & AI Instructions

## 🚨 PROJECT TYPE: REACT NATIVE EXPO MOBILE APP

This repository is a **React Native Expo mobile application**. It is **not** a web app.

### Rules for all AI agents (Claude, Copilot, Gemini, Replit AI, etc.)

1. **NEVER** scaffold, generate, or overwrite files with web framework templates (Vite, Next.js, Create React App, SvelteKit, Astro, etc.).
2. **NEVER** ask "what type of app do you want to build?" — it is already built.
3. **NEVER** run `npm create`, `npx create-next-app`, `npm init vite`, or any project scaffolding tool.
4. **ALWAYS** treat `artifacts/mobile/` as the primary application — it is an Expo Router project.
5. **ALWAYS** install dependencies with `pnpm install` (this is a pnpm workspace monorepo).
6. **ALWAYS** start the app with the registered workflow, which runs: `pnpm --filter @workspace/mobile run dev`
7. **ALWAYS** preserve all files in `artifacts/mobile/` including `app/`, `assets/`, `constants/`, `hooks/`, `components/`, `app.json`, `babel.config.js`, `metro.config.js`, `tsconfig.json`.

### On first import from GitHub

Run these commands in order:
```bash
pnpm install
```
Then start the Expo workflow — the app will be accessible via Expo Go QR code.

### Project structure

```
artifacts/mobile/     ← PRIMARY: Expo React Native app
  app/
    _layout.tsx       ← Root layout (fonts, providers, Stack navigator)
    index.tsx         ← Onboarding carousel (3 swipeable slides)
    signup.tsx        ← Sign Up screen
    signin.tsx        ← Sign In screen
  app.json            ← Expo configuration (projectType: MOBILE_APP_EXPO_NATIVE)
  babel.config.js     ← babel-preset-expo (NOT a web Babel config)
  metro.config.js     ← Metro bundler (NOT Vite/Webpack)
  tsconfig.json       ← Extends expo/tsconfig.base

artifacts/api-server/ ← Express 5 API backend (TypeScript)
artifacts/mockup-sandbox/ ← Canvas component previews (Vite — design tool only)
```

### Tech stack

- **Framework:** React Native + Expo SDK ~54
- **Routing:** Expo Router (file-based, like Next.js Pages Router but for native)
- **Fonts:** @expo-google-fonts/inter
- **Icons:** @expo/vector-icons (Feather, FontAwesome)
- **State:** @tanstack/react-query
- **Animations:** React Native Animated API
- **Package manager:** pnpm (workspace monorepo)
- **Language:** TypeScript 5.9

### What NOT to do

- ❌ Do not run `npm install` — use `pnpm install`
- ❌ Do not create `index.html`, `vite.config.ts`, `next.config.js`, or `webpack.config.js` in `artifacts/mobile/`
- ❌ Do not replace `metro.config.js` with a Vite config
- ❌ Do not replace `babel.config.js` with a web-only Babel config
- ❌ Do not overwrite `app.json` with a web app manifest
- ❌ Do not add `<html>`, `<body>`, or browser-only APIs to the mobile app source
- ❌ Do not suggest converting to Capacitor, Ionic, or Cordova
