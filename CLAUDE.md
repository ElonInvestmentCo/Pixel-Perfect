# PayVora — Instructions for Claude

## Project type: React Native Expo mobile app (NOT a web app)

This is a **pnpm workspace monorepo** containing a React Native Expo mobile application.

### Critical rules

- Primary app lives in `artifacts/mobile/` — Expo Router, React Native, Metro bundler.
- `artifacts/mockup-sandbox/` uses Vite but is **only** a canvas design tool, not the main app.
- `artifacts/api-server/` is the Express 5 backend.
- **Never scaffold web templates** over `artifacts/mobile/`.
- **Always use `pnpm`** — never `npm` or `yarn`.

### Setup after cloning

```bash
pnpm install
# Expo workflow starts automatically via Replit workflows
# Or manually: pnpm --filter @workspace/mobile run dev
```

### Key files — never delete or overwrite these

| File | Purpose |
|---|---|
| `artifacts/mobile/app.json` | Expo config (`projectType: MOBILE_APP_EXPO_NATIVE`) |
| `artifacts/mobile/babel.config.js` | `babel-preset-expo` — native, not web |
| `artifacts/mobile/metro.config.js` | Metro bundler with monorepo path resolution |
| `artifacts/mobile/tsconfig.json` | Extends `expo/tsconfig.base` |
| `artifacts/mobile/app/_layout.tsx` | Root layout with fonts, providers, Stack |
| `artifacts/mobile/app/index.tsx` | Onboarding carousel |
| `artifacts/mobile/app/signup.tsx` | Sign Up screen |
| `artifacts/mobile/app/signin.tsx` | Sign In screen |

### Coding conventions

- StyleSheet from react-native (not CSS/Tailwind)
- Colors: lime accent `#C8FF00`, background `#EBEBEB`, white cards
- Fonts: Inter (400/500/600/700) via `@expo-google-fonts/inter`
- Navigation: `router.push("/route")` via `expo-router`
- Safe area: `useSafeAreaInsets()` from `react-native-safe-area-context`
