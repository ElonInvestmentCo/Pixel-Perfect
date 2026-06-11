// PayVora — React Native Expo mobile app
// Metro bundler config for pnpm monorepo workspace
// DO NOT replace this with a web bundler config (Vite, Webpack, etc.)

const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot  = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// ─── Monorepo: watch the whole workspace so symlinked packages resolve ────────
config.watchFolders = [workspaceRoot];

// ─── Block Replit internal temp directories from being watched ────────────────
// Metro's FallbackWatcher crashes when it tries to watch a temp path that is
// deleted mid-session (e.g. .local/skills/.old-* written by Replit's agent).
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : []),
  /\/\.local\/.*/,
  /\/attached_assets\/.*/,
];

// ─── Module resolution: project first, then workspace root ────────────────────
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot,  "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Respect package.json "exports" field.
// Without this, Metro ignores "exports" and falls back to "./index" — which
// does not exist for workspace packages that only define an exports map
// (e.g. @workspace/api-client-react uses "exports":{".":"./src/index.ts"}).
// Metro then climbs up to the workspace root, tries to resolve its ./index,
// and emits "Unable to resolve module ./index from /home/runner/workspace/."
config.resolver.unstable_enablePackageExports = true;

// Native extensions take priority over web extensions
config.resolver.platforms = ["ios", "android", "native", "web"];

// ─── SVG transformer ──────────────────────────────────────────────────────────
// Spread config.transformer / config.resolver AFTER all options above are set
// so nothing is accidentally overwritten by the spread.
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};
config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
};

module.exports = config;
