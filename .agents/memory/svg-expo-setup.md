---
name: SVG in Expo Mobile (react-native-svg-transformer)
description: How to import SVG files as React components in an Expo React Native app using react-native-svg-transformer.
---

## Rule
To import `.svg` files as React components (`import Foo from './foo.svg'`), you must install `react-native-svg-transformer` and update `metro.config.js`. `react-native-svg` alone is not sufficient — it only provides primitives (`Svg`, `Path`, etc.), not file transforms.

## Why
Metro does not know how to handle `.svg` source files by default. The transformer rewrites SVG XML into React Native SVG component calls at bundle time. Without it, Metro throws a module-not-found or parse error.

## How to apply
1. `pnpm --filter @workspace/mobile add -D react-native-svg-transformer`
2. In `metro.config.js`, after `getDefaultConfig`:
   ```js
   const { transformer, resolver } = config;
   config.transformer = {
     ...transformer,
     babelTransformerPath: require.resolve("react-native-svg-transformer"),
   };
   config.resolver = {
     ...resolver,
     assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
     sourceExts: [...resolver.sourceExts, "svg"],
   };
   ```
3. Add `declarations.d.ts` with SVG module declaration:
   ```ts
   declare module "*.svg" {
     import React from "react";
     import { SvgProps } from "react-native-svg";
     const content: React.FC<SvgProps>;
     export default content;
   }
   ```
4. Restart Metro after config change (cache clear recommended).
5. Place SVG files in `assets/svg/` (not `attached_assets/` — not served).
6. Pass `width` and `height` as numeric props to the imported SVG component; `width="100%"` string also works for fill-width rendering.
