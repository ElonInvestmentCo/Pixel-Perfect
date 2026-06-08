import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isTablet, OC, OS } from "./tokens";

type Props = {
  children: React.ReactNode;
  /**
   * Wraps children in a KeyboardAvoidingView — enable on text-input screens
   * (signup, signin, reset-password) to keep the CTA above the soft keyboard.
   */
  keyboard?: boolean;
  /**
   * Wraps children in a ScrollView (default true).
   * Set false for fixed-layout screens (phone numpad, OTP).
   */
  scrollable?: boolean;
  /**
   * Element pinned to the bottom above the home-indicator.
   * Used for the Continue CTA on KYC screens (account-reason, identity-upload).
   */
  footer?: React.ReactNode;
  /** Screen background colour — defaults to white. */
  backgroundColor?: string;
  /** Additional styles for the outermost container. */
  containerStyle?: ViewStyle;
};

/**
 * OnboardingLayout — the single structural wrapper for every auth / KYC screen.
 *
 * Handles internally:
 *  • useSafeAreaInsets (no more Platform.OS === "web" hacks)
 *  • Optional KeyboardAvoidingView for text-input screens
 *  • Optional ScrollView with consistent horizontal padding
 *  • Pinned footer with proper home-indicator clearance
 *  • Tablet-responsive max-width centred column
 */
export function OnboardingLayout({
  children,
  keyboard   = false,
  scrollable = true,
  footer,
  backgroundColor = OC.bg,
  containerStyle,
}: Props) {
  const insets = useSafeAreaInsets();
  const topPad = insets.top + OS.topGap;
  const botPad = insets.bottom;

  // ── Inner content ────────────────────────────────────────────────────────────
  const scrollOrFixed = scrollable ? (
    <ScrollView
      contentContainerStyle={[
        s.scrollContent,
        {
          paddingTop:    topPad,
          paddingBottom: footer ? 16 : botPad + OS.botGap,
        },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {isTablet
        ? <View style={s.tabletInner}>{children}</View>
        : children}
    </ScrollView>
  ) : (
    // Fixed layout: children manage their own internal layout.
    // We only inject the top safe-area padding here.
    <View style={[s.fixed, { paddingTop: topPad }]}>
      {isTablet
        ? <View style={[s.tabletInner, { flex: 1 }]}>{children}</View>
        : children}
    </View>
  );

  // ── Optional keyboard wrapper ─────────────────────────────────────────────────
  const inner = keyboard ? (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {scrollOrFixed}
    </KeyboardAvoidingView>
  ) : scrollOrFixed;

  // ── Root ─────────────────────────────────────────────────────────────────────
  return (
    <View style={[s.root, { backgroundColor }, containerStyle]}>
      {inner}
      {footer && (
        <View
          style={[
            s.footerWrap,
            { paddingBottom: botPad + OS.botGap },
          ]}
        >
          {isTablet
            ? <View style={s.tabletInner}>{footer}</View>
            : footer}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },

  scrollContent: {
    flexGrow: 1,
    // All auth screens use the same horizontal page padding.
    paddingHorizontal: OS.pagePadH,
  },

  fixed: {
    flex: 1,
    // Fixed screens (numpad) manage horizontal padding internally.
  },

  footerWrap: {
    paddingHorizontal: OS.pagePadH,
    paddingTop: 12,
  },

  tabletInner: {
    // Centred column on tablets — max 480pt wide.
    width:     OS.maxW ?? "100%",
    alignSelf: "center",
  },
});
