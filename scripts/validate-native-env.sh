#!/bin/bash
# =============================================================================
# QPay — Native Environment Validator
# THIS IS A REACT NATIVE EXPO MOBILE APPLICATION — DO NOT CONVERT TO WEB PROJECT.
#
# Run this script after GitHub import or any dependency change to confirm
# the Expo / React Native environment is intact before starting Metro.
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

MOBILE_DIR="artifacts/mobile"
ERRORS=0
WARNINGS=0

echo ""
echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}  QPay — Native Environment Validation${NC}"
echo -e "${BOLD}${CYAN}  Project type: MOBILE_APP_EXPO_NATIVE${NC}"
echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════${NC}"
echo ""

# ── Helper functions ──────────────────────────────────────────────────────────
pass() { echo -e "  ${GREEN}✓${NC}  $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC}  $1"; ((WARNINGS++)); }
fail() { echo -e "  ${RED}✗${NC}  $1"; ((ERRORS++)); }
section() { echo ""; echo -e "${BOLD}▸ $1${NC}"; }

# ── 1. Confirm this is NOT a web project ─────────────────────────────────────
section "Project type detection"

if [ -f "$MOBILE_DIR/app.json" ]; then
  if grep -q '"expo"' "$MOBILE_DIR/app.json"; then
    pass "app.json contains expo config (native project confirmed)"
  else
    fail "app.json missing expo key — project may have been overwritten"
  fi
else
  fail "app.json not found at $MOBILE_DIR/app.json"
fi

if [ -f "$MOBILE_DIR/metro.config.js" ]; then
  if grep -q "expo/metro-config" "$MOBILE_DIR/metro.config.js"; then
    pass "metro.config.js uses expo/metro-config (Metro bundler confirmed)"
  else
    fail "metro.config.js does not use expo/metro-config — may have been replaced with a web bundler config"
  fi
else
  fail "metro.config.js not found — Metro bundler is not configured"
fi

if [ -f "$MOBILE_DIR/babel.config.js" ]; then
  if grep -q "babel-preset-expo" "$MOBILE_DIR/babel.config.js"; then
    pass "babel.config.js uses babel-preset-expo (native Babel confirmed)"
  else
    fail "babel.config.js does not use babel-preset-expo — may have been replaced with a web config"
  fi
else
  fail "babel.config.js not found"
fi

# Web framework poison checks
for POISON in "vite.config" "next.config" "webpack.config" "astro.config" "svelte.config"; do
  if ls "$MOBILE_DIR/$POISON".* 2>/dev/null | grep -q .; then
    fail "DETECTED WEB CONFIG: $MOBILE_DIR/$POISON.* — this file must not exist in a native Expo project"
  fi
done
pass "No web bundler config files detected in mobile workspace"

# ── 2. Critical Expo files ────────────────────────────────────────────────────
section "Critical Expo files"

REQUIRED_FILES=(
  "$MOBILE_DIR/app.json"
  "$MOBILE_DIR/babel.config.js"
  "$MOBILE_DIR/metro.config.js"
  "$MOBILE_DIR/tsconfig.json"
  "$MOBILE_DIR/expo-env.d.ts"
  "$MOBILE_DIR/app/_layout.tsx"
  "$MOBILE_DIR/app/index.tsx"
  "$MOBILE_DIR/app/signup.tsx"
  "$MOBILE_DIR/app/signin.tsx"
  "$MOBILE_DIR/assets/images/icon.png"
)

for FILE in "${REQUIRED_FILES[@]}"; do
  if [ -f "$FILE" ]; then
    pass "$FILE"
  else
    fail "MISSING: $FILE"
  fi
done

# ── 3. Native dependencies ────────────────────────────────────────────────────
section "Native dependency check"

MOBILE_PKG="$MOBILE_DIR/package.json"
if [ -f "$MOBILE_PKG" ]; then
  NATIVE_DEPS=("expo" "react-native" "expo-router" "react-native-screens" "react-native-safe-area-context" "react-native-gesture-handler" "expo-splash-screen" "expo-font")
  for DEP in "${NATIVE_DEPS[@]}"; do
    if grep -q "\"$DEP\"" "$MOBILE_PKG"; then
      pass "$DEP declared in package.json"
    else
      fail "$DEP missing from package.json"
    fi
  done
else
  fail "package.json not found at $MOBILE_PKG"
fi

# Check node_modules are installed
if [ -d "$MOBILE_DIR/node_modules/expo" ]; then
  EXPO_VERSION=$(node -e "console.log(require('$MOBILE_DIR/node_modules/expo/package.json').version)" 2>/dev/null || echo "unknown")
  pass "expo installed (version: $EXPO_VERSION)"
else
  warn "expo not installed in node_modules — run: pnpm install"
fi

if [ -d "$MOBILE_DIR/node_modules/react-native" ]; then
  RN_VERSION=$(node -e "console.log(require('$MOBILE_DIR/node_modules/react-native/package.json').version)" 2>/dev/null || echo "unknown")
  pass "react-native installed (version: $RN_VERSION)"
else
  warn "react-native not installed — run: pnpm install"
fi

# ── 4. pnpm workspace integrity ───────────────────────────────────────────────
section "pnpm workspace integrity"

if [ -f "pnpm-workspace.yaml" ]; then
  pass "pnpm-workspace.yaml exists"
else
  fail "pnpm-workspace.yaml missing — workspace structure broken"
fi

if [ -f "pnpm-lock.yaml" ]; then
  pass "pnpm-lock.yaml exists"
else
  warn "pnpm-lock.yaml missing — run: pnpm install to regenerate"
fi

if [ -d "node_modules/.pnpm" ]; then
  pass "pnpm virtual store exists (node_modules/.pnpm)"
else
  warn "pnpm virtual store not found — run: pnpm install"
fi

# ── 5. Summary ───────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════${NC}"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}${BOLD}  ✓ All checks passed — native environment is healthy${NC}"
  echo -e "${GREEN}  Start with: pnpm --filter @workspace/mobile run dev${NC}"
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}${BOLD}  ⚠ $WARNINGS warning(s) — run: pnpm install to restore${NC}"
  echo -e "${YELLOW}  Then start: pnpm --filter @workspace/mobile run dev${NC}"
else
  echo -e "${RED}${BOLD}  ✗ $ERRORS error(s), $WARNINGS warning(s) detected${NC}"
  echo -e "${RED}  The native Expo environment may have been corrupted.${NC}"
  echo -e "${RED}  Restore steps:${NC}"
  echo -e "${RED}    1. git checkout -- .          # restore overwritten config files${NC}"
  echo -e "${RED}    2. pnpm install               # reinstall dependencies${NC}"
  echo -e "${RED}    3. bash scripts/validate-native-env.sh  # re-run this check${NC}"
fi
echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════${NC}"
echo ""

exit $ERRORS
