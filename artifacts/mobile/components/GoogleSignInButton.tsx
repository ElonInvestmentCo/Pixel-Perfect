import React from "react";
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from "react-native";

// ─── Platform-specific SVG assets ─────────────────────────────────────────────
// Each SVG is the complete official Google-branded button (logo + text + pill)
// sourced directly from Google's sign-in brand assets.

// Android variants (40 pt tall, rounded pill, #F2F2F2 bg)
import AndroidCtn from "../assets/svg/google_android_ctn.svg";
import AndroidSI  from "../assets/svg/google_android_si.svg";
import AndroidSU  from "../assets/svg/google_android_su.svg";

// iOS variants (44 pt tall, rounded pill, #F2F2F2 bg)
import IosCtn from "../assets/svg/google_ios_ctn.svg";
import IosSI  from "../assets/svg/google_ios_si.svg";
import IosSU  from "../assets/svg/google_ios_su.svg";

// ─── Natural SVG dimensions (from each file's viewBox) ───────────────────────
const NATURAL = {
  android: {
    signup:   { w: 179, h: 40 },
    signin:   { w: 175, h: 40 },
    continue: { w: 189, h: 40 },
  },
  ios: {
    signup:   { w: 189, h: 44 },
    signin:   { w: 185, h: 44 },
    continue: { w: 199, h: 44 },
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
export type GoogleButtonVariant = "signup" | "signin" | "continue";

interface GoogleSignInButtonProps {
  variant: GoogleButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  /** Extra horizontal padding on each side used by the parent screen (default 24) */
  horizontalPadding?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function GoogleSignInButton({
  variant,
  onPress,
  disabled = false,
  horizontalPadding = 24,
}: GoogleSignInButtonProps) {
  const isIOS = Platform.OS === "ios";
  const platform = isIOS ? "ios" : "android";

  // Pick the correct SVG component
  const SvgComponent = isIOS
    ? variant === "signup"   ? IosSU
      : variant === "signin" ? IosSI
      : IosCtn
    : variant === "signup"   ? AndroidSU
      : variant === "signin" ? AndroidSI
      : AndroidCtn;

  // Scale the SVG to fill the available container width while preserving aspect ratio
  const screenW  = Dimensions.get("window").width;
  const available = screenW - horizontalPadding * 2;
  const natural   = NATURAL[platform][variant];
  const scale     = available / natural.w;
  const svgW      = available;
  const svgH      = Math.round(natural.h * scale);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.78}
      style={[styles.wrapper, { height: svgH, opacity: disabled ? 0.45 : 1 }]}
    >
      {/* Outer View carries the pressed/shadow feedback area */}
      <View style={styles.inner}>
        <SvgComponent width={svgW} height={svgH} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
