#!/bin/bash
# =============================================================================
# PayVora — Post-merge setup script
# THIS IS A REACT NATIVE EXPO MOBILE APPLICATION — DO NOT CONVERT TO WEB PROJECT.
#
# Runs automatically after task agent merges. Restores pnpm workspace
# and validates the native Expo environment is still intact.
# =============================================================================

set -e

echo ""
echo "▸ PayVora post-merge: restoring pnpm workspace..."
pnpm install --frozen-lockfile

echo ""
echo "▸ PayVora post-merge: pushing DB schema (dev only)..."
pnpm --filter db push 2>/dev/null || echo "  (no DB changes or DB not available — skipping)"

echo ""
echo "▸ PayVora post-merge: validating native Expo environment..."
bash scripts/validate-native-env.sh

echo ""
echo "✓ Post-merge complete. Native environment confirmed intact."
echo "  Start Expo with: pnpm --filter @workspace/mobile run dev"
