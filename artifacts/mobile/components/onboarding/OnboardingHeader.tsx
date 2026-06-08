import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { OC, OF, OS } from "./tokens";

type ProgressConfig = {
  /** 1-based current step */
  step: number;
  /** Total number of steps */
  total: number;
};

type Props = {
  // ── Navigation button (provide exactly one) ──────────────────────────────
  /** Renders an × close button — dismisses the current flow */
  onClose?: () => void;
  /** Renders a ← back chevron — returns to the previous step */
  onBack?:  () => void;

  // ── Optional element rendered between the nav button and the title ────────
  /** E.g. an emoji avatar badge used on sign-in / reset-password screens */
  topSlot?: React.ReactNode;

  // ── Step progress dots (KYC flow) ─────────────────────────────────────────
  progress?: ProgressConfig;

  // ── Text content ──────────────────────────────────────────────────────────
  title: string;
  subtitle?: string;

  // ── Styling ───────────────────────────────────────────────────────────────
  /** Use 32pt title — for KYC screens with longer multi-line titles */
  titleLarge?: boolean;
  /** Space rendered after the subtitle (or title when no subtitle). Default 32 */
  gap?: number;
};

/**
 * OnboardingHeader — consistent header block for every auth / KYC screen.
 *
 * Renders (top-to-bottom):
 *   1. Close (×) or Back (←) icon button
 *   2. Optional topSlot (emoji avatar, etc.)
 *   3. Optional progress step dots
 *   4. Title
 *   5. Subtitle (optional)
 *   6. Vertical spacer equal to `gap`
 */
export function OnboardingHeader({
  onClose,
  onBack,
  topSlot,
  progress,
  title,
  subtitle,
  titleLarge = false,
  gap = 32,
}: Props) {
  const handler = onClose ?? onBack;
  const isClose = Boolean(onClose);

  return (
    <View>
      {/* ── Nav button ──────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[s.navBtn, !isClose && s.navBtnBack]}
        onPress={handler}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel={isClose ? "Close" : "Go back"}
      >
        <Feather
          name={isClose ? "x" : "arrow-left"}
          size={isClose ? 15 : 18}
          color={isClose ? "#999999" : OC.black}
        />
      </TouchableOpacity>

      {/* ── Optional slot (avatar, illustration, etc.) ───────────────────────── */}
      {topSlot && <View style={s.topSlot}>{topSlot}</View>}

      {/* ── Progress dots (KYC flow) ─────────────────────────────────────────── */}
      {progress && (
        <View
          style={s.dotsRow}
          accessibilityLabel={`Step ${progress.step} of ${progress.total}`}
          accessibilityRole="progressbar"
        >
          {Array.from({ length: progress.total }).map((_, i) => {
            const active = i < progress.step;
            const current = i + 1 === progress.step;
            return (
              <View
                key={i}
                style={[
                  s.dot,
                  current  ? s.dotCurrent  :
                  active   ? s.dotPast     :
                  s.dotFuture,
                ]}
              />
            );
          })}
        </View>
      )}

      {/* ── Title ────────────────────────────────────────────────────────────── */}
      <Text
        style={[s.title, titleLarge && s.titleLg]}
        accessibilityRole="header"
      >
        {title}
      </Text>

      {/* ── Subtitle + trailing gap ──────────────────────────────────────────── */}
      {subtitle ? (
        <Text style={[s.subtitle, { marginBottom: gap }]}>{subtitle}</Text>
      ) : (
        <View style={{ height: gap * 0.75 }} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  // ── Nav button ──────────────────────────────────────────────────────────────
  navBtn: {
    width:  OS.iconBtnSz,
    height: OS.iconBtnSz,
    borderRadius: OS.iconBtnR,
    backgroundColor: OC.closeBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  // Back button uses the same dimensions but slightly different visual weight
  navBtnBack: {
    backgroundColor: OC.closeBg,
  },

  // ── Top slot ────────────────────────────────────────────────────────────────
  topSlot: {
    marginBottom: 24,
  },

  // ── Progress dots ───────────────────────────────────────────────────────────
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotCurrent: {
    // Active step — wide pill
    width: 24,
    backgroundColor: OC.black,
  },
  dotPast: {
    // Completed step — narrow filled
    width: 6,
    backgroundColor: OC.black,
    opacity: 0.35,
  },
  dotFuture: {
    // Upcoming step — narrow unfilled
    width: 6,
    backgroundColor: OC.border,
  },

  // ── Typography ──────────────────────────────────────────────────────────────
  title: {
    fontSize: 30,
    fontFamily: OF.bold,
    color: OC.black,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  titleLg: {
    fontSize: 32,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: OF.regular,
    color: OC.muted,
    lineHeight: 22,
  },
});
