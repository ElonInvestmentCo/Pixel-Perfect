---
name: Expo package version compat
description: How to install Expo-ecosystem packages without breaking SDK compatibility.
---

# Expo Package Version Compatibility

## Rule
**Always use `pnpm --filter @workspace/mobile exec expo install <pkg>` for any Expo-ecosystem package.**

Never use `pnpm --filter @workspace/mobile add <pkg>` — that installs the latest npm version, which may be many major versions ahead of what the installed Expo SDK supports.

## Why
When this was violated, `pnpm add expo-crypto` installed `expo-crypto@56.0.4` (latest on npm) into an `expo@54` project. Metro tried to watch a native temp directory that the build step created and then deleted, producing:
```
Error: ENOENT: no such file or directory, watch '.../expo-crypto@56.0.4.../expo-crypto_tmp_8197/android/src/...'
```
This crashed the Metro bundler on startup. The fix was to remove the bad version and re-install via `expo install`, which picked `expo-crypto@14.x` (SDK 54 compatible).

## How to apply
Any time you need to add an Expo SDK package:
```bash
pnpm --filter @workspace/mobile exec expo install expo-auth-session expo-apple-authentication expo-secure-store expo-crypto
```
`expo install` reads `expo` version from `package.json` and picks matching package versions automatically.
