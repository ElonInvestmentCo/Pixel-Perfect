# PayVora — Finance Mobile App

A React Native Expo mobile finance app with onboarding, sign-in, and sign-up screens.

---

## ⚠️ CRITICAL — Project Type: React Native Expo Mobile App

**This is a React Native Expo mobile application. It is NOT a web app.**

Any Replit AI session that opens this repository MUST follow these rules without exception:

- **Never** ask what type of app to build — it is already built as an Expo mobile app.
- **Never** initialize or convert this project to a web app, Next.js, Vite, or any browser-based framework.
- **Never** replace existing files with web templates.
- **Never** run `npm create`, `vite`, `create-next-app`, or any scaffolding tool.
- **Always** treat `artifacts/mobile/` as the primary app artifact — it is an Expo Router project.
- **Always** restore and run the existing Expo project as-is using the commands below.
- **Always** use `pnpm` (not `npm` or `yarn`) — this is a pnpm workspace monorepo.

### Correct startup (restore and run)

```bash
pnpm install                                        # install all workspace dependencies
pnpm --filter @workspace/mobile run dev             # start Expo (Metro bundler)
```

The Expo workflow is already registered and will start automatically. Scan the QR code in the preview panel with **Expo Go** on iPhone/Android to open the app.

---

## Run & Operate

| Command | Purpose |
|---|---|
| `pnpm --filter @workspace/mobile run dev` | Start Expo / Metro bundler |
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
      signup.tsx        ← Sign Up screen
      signin.tsx        ← Sign In screen
    assets/images/      ← App icon, Google logo, etc.
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

---

## Product

PayVora is a fintech onboarding experience featuring:
- **3-slide animated carousel** — Balance card, credit cards, portfolio growth
- **Sign Up** — Full name, email, password, Apple + Google social login
- **Sign In** — Email, password, Forgot Password, Apple + Google social login
- Navigation wired: Get Started → Sign Up, Skip → Sign In, cross-links between auth screens

---

## User preferences

- This is a React Native Expo mobile app — never treat it as a web project.
- Pixel-perfect replication of provided design screenshots is expected.
- Use `pnpm` for all package management.
- Keep all native app files, Expo configs, and routing intact across sessions.

---

## Gotchas

- Always run `pnpm install` (not `npm install`) after pulling — this is a pnpm workspace.
- The Expo workflow starts via `pnpm --filter @workspace/mobile run dev`, not `npx expo start` directly.
- `PORT` is injected by the Replit workflow — do not hardcode it.
- `attached_assets/` is not served by any server — copy files to `artifacts/mobile/assets/` before referencing them.
- `outlineStyle: "none"` is cast `as any` on TextInput styles for web compatibility — this is intentional.

---

## Pointers

- See `.local/skills/expo/SKILL.md` for Expo-specific patterns and guidelines.
- See `.local/skills/pnpm-workspace/SKILL.md` for monorepo structure details.
