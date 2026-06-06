// QPay — React Native Expo mobile app
// Babel config for Expo — DO NOT replace with a web-only Babel config

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [
      // React Compiler (experimental) — runs before other plugins
      ["babel-plugin-react-compiler", {}],
    ],
  };
};
