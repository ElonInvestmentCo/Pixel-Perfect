---
name: Metro cache + pnpm monorepo config
description: How to fix 502/bundle errors in Expo + pnpm monorepo; metro.config.js correct patterns.
---

## Root cause of 502 in Expo Go after file deletions

When Expo Router route files are added or deleted, the stale Metro cache contains stale module graph references. Metro fails to resolve modules and returns a JSON error; Replit proxy surfaces this as a 502.

**Fix:** Full cache purge + restart with `--clear`:
```bash
rm -rf /tmp/metro-cache /tmp/metro-file-map-* artifacts/mobile/node_modules/.cache/
# Then restart the workflow (which runs: pnpm exec expo start --clear --localhost --port $PORT)
```

**After recovery:** Remove `--clear` from the dev script — it slows every startup. Only add it for a one-time recovery.

## metro.config.js correct patterns for pnpm workspace

**Why `unstable_enablePackageExports: true` is required:**
Without it, Metro ignores `exports` fields in package.json and falls back to `./index`.
Workspace packages (e.g. `@workspace/api-client-react`) only define their entry via `"exports":{".":"./src/index.ts"}` with no `index.js` at root. Metro then climbs to the workspace root, fails to find its `./index`, and emits:
```
Unable to resolve module ./index from /home/runner/workspace/.
```

**Why spread `config.resolver` not a snapshot:**
The original anti-pattern:
```javascript
const { resolver } = config;  // snapshot captured here
config.resolver.unstable_enablePackageExports = true;  // sets on config.resolver
config.resolver = { ...resolver, ... };  // spreads OLD snapshot — loses the setting above!
```
The correct pattern:
```javascript
config.resolver.unstable_enablePackageExports = true;
// ... other options on config.resolver ...
config.resolver = {
  ...config.resolver,  // spread the CURRENT config.resolver, not a stale snapshot
  assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
};
```

## How Expo Go actually fetches the bundle (pnpm context)

Expo CLI uses `getMetroServerRoot(projectRoot)` to compute the server root. In a pnpm monorepo, this returns the **workspace root** (not projectRoot). The bundle URL in the manifest uses the full pnpm store path:
```
/node_modules/.pnpm/expo-router@6.0.24_.../node_modules/expo-router/entry.bundle
```
This absolute pnpm store path exists and is served correctly. Do NOT test with `/index.bundle?platform=ios` — that URL is wrong for Expo Router and returns a misleading workspace-root resolution error.

**Why:** `getMetroServerRoot` detects the monorepo and sets serverRoot = workspaceRoot. The manifest's launchAsset URL is computed as `path.relative(serverRoot, entryPoint)` — which gives the full pnpm store relative path. This resolves correctly because Metro watches the workspace root via `watchFolders`.
