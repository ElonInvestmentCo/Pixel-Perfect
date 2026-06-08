---
name: KeyboardProvider Expo Go compatibility
description: react-native-keyboard-controller crashes Expo Go because it requires a native module not bundled in Expo Go.
---

## Problem
`react-native-keyboard-controller`'s `KeyboardProvider` requires a native module that is only available in development builds, not in Expo Go. Wrapping the root layout with it caused the `ErrorBoundary` to catch the crash and show a blank white screen.

## Fix
Use a lazy `try/catch` require in `app/_layout.tsx` so the module degrades gracefully in Expo Go:

```tsx
let KeyboardProviderSafe: React.ComponentType<{ children: React.ReactNode }>;
try {
  const mod = require("react-native-keyboard-controller");
  if (mod?.KeyboardProvider) {
    KeyboardProviderSafe = mod.KeyboardProvider;
  } else {
    KeyboardProviderSafe = ({ children }) => <>{children}</>;
  }
} catch {
  KeyboardProviderSafe = ({ children }) => <>{children}</>;
}
```

**Why:** The native module is unavailable at runtime in Expo Go; the ErrorBoundary catches the throw and renders its fallback (white screen). The lazy require pattern silently degrades to a fragment wrapper.

**How to apply:** Any native module that is optional or not bundled in Expo Go should use this pattern in the root layout or any provider component.
