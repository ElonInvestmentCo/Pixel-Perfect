// PayVora — React Native Expo mobile app
// Metro bundler config for pnpm monorepo workspace
// DO NOT replace this with a web bundler config (Vite, Webpack, etc.)

const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// Resolve modules from the workspace root first, then project root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Ensure native extensions take priority over web extensions
config.resolver.platforms = ["ios", "android", "native", "web"];

module.exports = config;
