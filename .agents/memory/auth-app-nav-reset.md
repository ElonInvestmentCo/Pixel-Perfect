---
name: Auth→App navigation reset
description: Proper Expo Router route group pattern to fully clear auth/onboarding stack when entering the authenticated app.
---

# Auth→App root navigation reset in Expo Router

## The rule
Use route groups `(auth)` and `(app)`, each with their own `_layout.tsx` Stack. To navigate from auth to the app with a full history clear, climb to the root Stack with `navigation.getParent()` then dispatch `CommonActions.reset`.

```tsx
// Inside any (auth)/* screen:
const navigation = useNavigation(); // → (auth) Stack navigator
const rootNav = navigation.getParent() ?? navigation; // → root Stack navigator
rootNav.dispatch(
  CommonActions.reset({ index: 0, routes: [{ name: "(app)" }] })
);
```

**Why:** `presentation: "modal"` on signup/signin promotes iOS UIModalPresentationPageSheet chrome (pull-down handle, slide-up animation) onto every subsequent screen in the same flat Stack. Moving auth screens into a `(auth)` route group gives them their own nested Stack, and the `CommonActions.reset` on the root Stack replaces the entire `(auth)` group with `(app)`, leaving zero auth history to go back to.

**How to apply:**
- `app/_layout.tsx` root Stack: only `index`, `(auth)`, `(app)` entries. `(app)` gets `gestureEnabled: false` + `animation: "fade"`.
- `app/(auth)/_layout.tsx`: signup/signin marked `presentation: "modal"` (affects only intra-auth transitions).
- `app/(app)/_layout.tsx`: `gestureEnabled: false` on all screens.
- Sign-out: `router.replace("/")` from dashboard returns to onboarding (`app/index.tsx`).
- Relative imports (`../components`, `../lib`) in files moved from `app/` → `app/(auth)/` must be updated to `@/components` / `@/lib` (baseUrl `"."` in tsconfig = `artifacts/mobile/`).
