import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { OC, OF, OS } from "./tokens";

type ProgressConfig = {
  step:  number;
  total: number;
};

type Props = {
  onClose?: () => void;
  onBack?:  () => void;
  topSlot?: React.ReactNode;
  progress?: ProgressConfig;
  title: string;
  subtitle?: string;
  titleLarge?: boolean;
  gap?: number;
};

/* ─── Animated nav button (close × or back ←) ─────────────────────────────── */
function NavButton({
  onPress,
  isClose,
}: {
  onPress: () => void;
  isClose: boolean;
}) {
  const sc = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sc.value }],
  }));

  return (
    <Animated.View
      style={[
        s.navBtn,
        !isClose && s.navBtnBack,
        animStyle,
      ]}
    >
      <Pressable
        onPressIn={() => {
          sc.value = withSpring(0.82, { damping: 14, stiffness: 320 });
        }}
        onPressOut={() => {
          sc.value = withSpring(1.0, { damping: 14, stiffness: 280 });
        }}
        onPress={onPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel={isClose ? "Close" : "Go back"}
        style={s.pressable}
      >
        {isClose ? (
          /* Premium X — two SVG-free crisp lines via Feather at a slightly
             larger touch target than the raw icon size */
          <Feather name="x" size={16} color="#888888" strokeWidth={2.5 as any} />
        ) : (
          <Feather name="arrow-left" size={18} color={OC.black} />
        )}
      </Pressable>
    </Animated.View>
  );
}

/* ─── Header ───────────────────────────────────────────────────────────────── */
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
      {/* ── Animated nav button ──────────────────────────────────────────────── */}
      {handler && (
        <NavButton onPress={handler} isClose={isClose} />
      )}

      {/* ── Optional slot (avatar, illustration, etc.) ────────────────────────── */}
      {topSlot && <View style={s.topSlot}>{topSlot}</View>}

      {/* ── Progress dots ──────────────────────────────────────────────────────── */}
      {progress && (
        <View
          style={s.dotsRow}
          accessibilityLabel={`Step ${progress.step} of ${progress.total}`}
          accessibilityRole="progressbar"
        >
          {Array.from({ length: progress.total }).map((_, i) => {
            const active  = i < progress.step;
            const current = i + 1 === progress.step;
            return (
              <View
                key={i}
                style={[
                  s.dot,
                  current ? s.dotCurrent :
                  active  ? s.dotPast    :
                  s.dotFuture,
                ]}
              />
            );
          })}
        </View>
      )}

      {/* ── Title ──────────────────────────────────────────────────────────────── */}
      <Text style={[s.title, titleLarge && s.titleLg]} accessibilityRole="header">
        {title}
      </Text>

      {/* ── Subtitle + trailing gap ─────────────────────────────────────────────── */}
      {subtitle ? (
        <Text style={[s.subtitle, { marginBottom: gap }]}>{subtitle}</Text>
      ) : (
        <View style={{ height: gap * 0.75 }} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  navBtn: {
    width:           OS.iconBtnSz,
    height:          OS.iconBtnSz,
    borderRadius:    OS.iconBtnR,
    backgroundColor: OC.closeBg,
    alignItems:      "center",
    justifyContent:  "center",
    marginBottom:    28,
    /* subtle lift */
    shadowColor:     "#000",
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.06,
    shadowRadius:    4,
    elevation:       2,
  },
  navBtnBack: {
    backgroundColor: OC.closeBg,
  },
  pressable: {
    width:          "100%",
    height:         "100%",
    alignItems:     "center",
    justifyContent: "center",
  },

  topSlot: { marginBottom: 24 },

  dotsRow: {
    flexDirection: "row",
    gap:           6,
    marginBottom:  20,
  },
  dot: {
    height:       6,
    borderRadius: 3,
  },
  dotCurrent: { width: 24, backgroundColor: OC.black },
  dotPast:    { width: 6,  backgroundColor: OC.black, opacity: 0.35 },
  dotFuture:  { width: 6,  backgroundColor: OC.border },

  title: {
    fontSize:      30,
    fontFamily:    OF.bold,
    color:         OC.black,
    letterSpacing: -0.3,
    marginBottom:  10,
  },
  titleLg: {
    fontSize:      32,
    letterSpacing: -0.5,
    lineHeight:    40,
  },
  subtitle: {
    fontSize:   15,
    fontFamily: OF.regular,
    color:      OC.muted,
    lineHeight: 22,
  },
});
