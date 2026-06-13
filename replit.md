# PayVora — Finance Mobile App

A React Native Expo mobile finance app with onboarding, sign-in, and sign-up screens.

---

## ⚠️ CRITICAL — Project Type: React Native Expo Mobile App (NATIVE ONLY)

**This is a React Native Expo mobile application. It is NOT a web app. It must NEVER be run, previewed, or treated as a web application.**

Any Replit AI session that opens this repository MUST follow these rules without exception:

- **Never** ask what type of app to build — it is already built as an Expo native mobile app.
- **Never** initialize or convert this project to a web app, Next.js, Vite, or any browser-based framework.
- **Never** replace existing files with web templates.
- **Never** run `npm create`, `vite`, `create-next-app`, or any scaffolding tool.
- **Never** use `expo start --tunnel` — this creates an Expo-hosted tunnel that expires; the Replit dev domain is stable and preferred.
- **Never** use `--port 8082` without a dev-proxy — Metro on localhost:8082 is not externally accessible; Expo Go cannot reach it.
- **Never** omit `PORT=5000` prefix — without it, `$PORT` defaults to 3000 (taken by the API server) and Metro fails to start.
- **Always** treat `artifacts/mobile/` as the primary app artifact — it is an Expo Router project.
- **Always** start Expo using: `PORT=5000 pnpm --filter @workspace/mobile run dev` — the `dev` script sets `EXPO_PACKAGER_PROXY_URL` so the QR code uses the stable `*.expo.janeway.replit.dev` domain.
- **Always** set `waitForPort: 5000` and `outputType: "webview"` on the Expo workflow.
- **Always** use `pnpm` (not `npm` or `yarn`) — this is a pnpm workspace monorepo.
- **Always** restore and run the existing Expo project as-is.

### Correct startup

```bash
pnpm install                        # install all workspace dependencies
PORT=5000 pnpm --filter @workspace/mobile run dev   # start Expo on port 5000 via dev script
```

### Correct workflow configuration (REQUIRED — do not change)

```javascript
await configureWorkflow({
  name: "Start Expo Native App",
  command: "PORT=5000 pnpm --filter @workspace/mobile run dev",
  waitForPort: 5000,
  outputType: "webview",
  autoStart: true
});
```

The canvas preview shows Expo Web on port 5000. To test natively, scan the `exp://` QR code in the workflow console with **Expo Go** on iPhone or Android. The QR code URL will be `exp://...expo.janeway.replit.dev` — stable across restarts.

### Why this works (and what breaks it)
- The `dev` script sets `EXPO_PACKAGER_PROXY_URL=https://$REPLIT_EXPO_DEV_DOMAIN` — this makes the QR code point to the Replit Expo proxy domain (accessible from any phone).
- `PORT=5000` overrides the Replit default `$PORT=3000` (which the API server already occupies).
- Replit routes the `*.expo.janeway.replit.dev` domain to port 5000, so Expo Go connects directly to Metro.
- All API calls go to Railway by default (no local toggle set). Backend is Railway.

---

## Run & Operate

| Command | Purpose |
|---|---|
| `pnpm --filter @workspace/mobile exec expo start --tunnel --port 8082` | Start Expo in tunnel mode (native QR code) |
| `pnpm --filter @workspace/api-server run dev` | Start API server (port 8080) |
| `pnpm run typecheck` | Full TypeScript check across all packages |
| `pnpm run build` | Typecheck + build all packages |

---

## Stack

- **Monorepo:** pnpm workspaces, Node.js 24, TypeScript 5.9
- **Mobile:** React Native + Expo SDK, Expo Router (file-based routing)
- **Fonts:** `@expo-google-fonts/inter` (Inter 400/500/600/700)
- **Icons:** `@expo/vector-icons` (Feather, FontAwesome)
- **State:** React Query (`@tanstack/react-query`)
- **API:** Express 5 (TypeScript) — `artifacts/api-server/`
- **Navigation:** Expo Router with Stack screens

---

## Where things live

```
artifacts/
  mobile/               ← Expo React Native app (PRIMARY)
    app/
      _layout.tsx       ← Root layout, font loading, providers
      index.tsx         ← Onboarding carousel (3 swipeable slides)
      (auth)/           ← Sign up, sign in, verify, reset screens
      (app)/            ← Authenticated tab screens (home, cards, settings)
    assets/images/      ← App icon, balance-card.png, Google logo, etc.
    constants/colors.ts ← Color tokens (LIME=#C8FF00, etc.)
  api-server/           ← Express API backend
  mockup-sandbox/       ← Canvas component preview (Vite)
```

---

## Architecture decisions

- Onboarding uses a horizontal `Animated.ScrollView` with `pagingEnabled` for slide transitions; dot indicators animate via `scrollX` interpolation.
- Auth screens (Sign Up / Sign In) are plain white, matching original design specs — no custom header, simple gray `#F5F5F5` input fields.
- Google sign-in button uses a static image asset (`assets/images/google-logo.png`) rather than an SVG recreation.
- Colors are centralised in `constants/colors.ts`; primary accent is lime `#C8FF00`.
- All fonts loaded via `@expo-google-fonts/inter` in the root layout before render.
- Home screen balance card is a static image (`assets/images/balance-card.png`) — do not replace with a coded card component.

---

## Product

PayVora is a fintech onboarding experience featuring:
- **3-slide animated carousel** — Balance card, credit cards, portfolio growth
- **Sign Up** — Full name, email, password, Apple + Google social login
- **Sign In** — Email, password, Forgot Password, Apple + Google social login
- **Authenticated app** — Home (balance card image + transactions), Cards, Settings tabs
- Navigation wired: Get Started → Sign Up, Skip → Sign In, cross-links between auth screens

---

## User preferences

- This is a React Native Expo mobile app — never treat it as a web project.
- Pixel-perfect replication of provided design screenshots is expected.
- Use `pnpm` for all package management.
- Keep all native app files, Expo configs, and routing intact across sessions.
- The Expo workflow MUST always use tunnel mode with console output and NO waitForPort.

---

## Gotchas

- Always run `pnpm install` (not `npm install`) after pulling — this is a pnpm workspace.
- The Expo workflow uses `expo start --tunnel --port 8082` directly — NOT `pnpm run dev` (dev script uses `$PORT` which is only set when waitForPort is configured, creating a circular dependency).
- Do NOT add `waitForPort` to the Expo workflow — it triggers Replit's web iframe preview which cannot render a native React Native app.
- `attached_assets/` is not served by any server — copy files to `artifacts/mobile/assets/` before referencing them.
- `outlineStyle: "none"` is cast `as any` on TextInput styles for web compatibility — this is intentional.
- If Metro complains about port 8082 being in use on restart, kill stale processes with `fuser -k 8082/tcp` then restart the workflow.

---

## Pointers

- See `.local/skills/expo/SKILL.md` for Expo-specific patterns and guidelines.
- See `.local/skills/pnpm-workspace/SKILL.md` for monorepo structure details.
