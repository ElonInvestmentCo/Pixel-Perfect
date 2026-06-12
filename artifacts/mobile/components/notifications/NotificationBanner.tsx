import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useCallback, useEffect, useRef } from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type InAppNotification } from "@/contexts/NotificationContext";

/* ─── Constants ──────────────────────────────────────────────────────────── */

const { width: W }   = Dimensions.get("window");
const BANNER_H       = 90;
const H_MARGIN       = 16;
const DISMISS_DELAY  = 4500;
const PROGRESS_W     = W - H_MARGIN * 2 - 28 * 2; // margin + blur padding

const LIME     = "#C8FF00";
const INDIGO   = "#818cf8";
const SLATE    = "#94a3b8";

const TYPE_CONFIG = {
  transfer: { icon: "arrow-down-left" as const, color: LIME,   iconBg: "rgba(200,255,0,0.18)"    },
  card:     { icon: "credit-card"     as const, color: INDIGO, iconBg: "rgba(129,140,248,0.18)"  },
  info:     { icon: "bell"            as const, color: SLATE,  iconBg: "rgba(148,163,184,0.18)"  },
};

/* ─── Props ──────────────────────────────────────────────────────────────── */

interface Props {
  notification: InAppNotification;
  onDismiss:    () => void;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function NotificationBanner({ notification, onDismiss }: Props) {
  const insets   = useSafeAreaInsets();
  const cfg      = TYPE_CONFIG[notification.type];
  const TOP      = insets.top + 12;

  const translateY     = useSharedValue(-(BANNER_H + TOP + 40));
  const opacity        = useSharedValue(0);
  const progress       = useSharedValue(1);
  const dismissingRef  = useRef(false);

  /* ── dismiss ─────────────────────────────────────────────────────────── */

  const triggerDismiss = useCallback(() => {
    if (dismissingRef.current) return;
    dismissingRef.current = true;

    translateY.value = withTiming(-(BANNER_H + TOP + 40), {
      duration: 300,
      easing:   Easing.in(Easing.cubic),
    });
    opacity.value = withTiming(0, { duration: 220 }, (done) => {
      if (done) runOnJS(onDismiss)();
    });
  }, [onDismiss, TOP, translateY, opacity]);

  /* ── entry + auto-dismiss ────────────────────────────────────────────── */

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 22, stiffness: 190, mass: 0.85 });
    opacity.value    = withTiming(1, { duration: 200 });

    const progressTimer = setTimeout(() => {
      progress.value = withTiming(0, {
        duration: DISMISS_DELAY,
        easing:   Easing.linear,
      });
    }, 350);

    const dismissTimer = setTimeout(triggerDismiss, DISMISS_DELAY + 350);

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(dismissTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── swipe-up gesture ────────────────────────────────────────────────── */

  const startY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (e.translationY < 0) {
        translateY.value = startY.value + e.translationY * 0.65;
      }
    })
    .onEnd((e) => {
      if (e.translationY < -36 || e.velocityY < -700) {
        runOnJS(triggerDismiss)();
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  /* ── animated styles ─────────────────────────────────────────────────── */

  const bannerStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: progress.value * PROGRESS_W,
  }));

  /* ── render ──────────────────────────────────────────────────────────── */

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.wrapper,
          { top: TOP },
          bannerStyle,
        ]}
      >
        <BlurView
          tint="dark"
          intensity={Platform.OS === "ios" ? 88 : 100}
          style={styles.blur}
        >
          {/* Accent border line */}
          <View style={[styles.accentLine, { backgroundColor: cfg.color }]} />

          {/* Icon capsule */}
          <View style={[styles.iconBox, { backgroundColor: cfg.iconBg }]}>
            <Feather name={cfg.icon} size={20} color={cfg.color} />
          </View>

          {/* Text */}
          <View style={styles.textCol}>
            <Text style={styles.title} numberOfLines={1}>
              {notification.title}
            </Text>
            <Text style={styles.body} numberOfLines={1}>
              {notification.body}
            </Text>
          </View>

          {/* Amount badge */}
          {notification.amount ? (
            <View style={[styles.amountBadge, { borderColor: cfg.color + "40" }]}>
              <Text style={[styles.amountText, { color: cfg.color }]}>
                {notification.amount}
              </Text>
            </View>
          ) : null}

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: cfg.color },
                progressStyle,
              ]}
            />
          </View>
        </BlurView>
      </Animated.View>
    </GestureDetector>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  wrapper: {
    position:      "absolute",
    left:          H_MARGIN,
    right:         H_MARGIN,
    height:        BANNER_H,
    borderRadius:  22,
    overflow:      "hidden",
    borderWidth:   1,
    borderColor:   "rgba(255,255,255,0.10)",
    shadowColor:   "#000",
    shadowOffset:  { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius:  24,
    elevation:     24,
  },

  blur: {
    flex:           1,
    flexDirection:  "row",
    alignItems:     "center",
    paddingLeft:    6,
    paddingRight:   14,
    gap:            12,
    backgroundColor: "rgba(10,10,10,0.82)",
  },

  accentLine: {
    width:        4,
    height:       "60%",
    borderRadius: 4,
    flexShrink:   0,
  },

  iconBox: {
    width:           42,
    height:          42,
    borderRadius:    13,
    alignItems:      "center",
    justifyContent:  "center",
    flexShrink:      0,
  },

  textCol: {
    flex: 1,
    gap:  3,
  },

  title: {
    color:         "#FFFFFF",
    fontSize:      14,
    fontWeight:    "700",
    letterSpacing: 0.1,
  },

  body: {
    color:      "rgba(255,255,255,0.55)",
    fontSize:   12,
    fontWeight: "500",
  },

  amountBadge: {
    borderWidth:  1,
    borderRadius: 10,
    paddingVertical:   4,
    paddingHorizontal: 10,
    flexShrink:   0,
  },

  amountText: {
    fontSize:      13,
    fontWeight:    "800",
    letterSpacing: -0.3,
  },

  progressTrack: {
    position:     "absolute",
    bottom:       0,
    left:         28,
    right:        28,
    height:       2,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow:     "hidden",
  },

  progressFill: {
    height:       2,
    borderRadius: 1,
  },
});
