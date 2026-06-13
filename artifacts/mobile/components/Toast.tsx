import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OF } from "@/components/onboarding/tokens";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  id:        number;
  type:      ToastType;
  message:   string;
  onDismiss: () => void;
}

type ToastCfg = {
  icon:      React.ComponentProps<typeof Feather>["name"];
  bg:        string;
  border:    string;
  iconColor: string;
  textColor: string;
};

const CFG: Record<ToastType, ToastCfg> = {
  success: { icon: "check-circle", bg: "#ECFDF5", border: "#6EE7B7", iconColor: "#16A34A", textColor: "#064E3B" },
  error:   { icon: "alert-circle", bg: "#FEF2F2", border: "#FECACA", iconColor: "#DC2626", textColor: "#7F1D1D" },
  info:    { icon: "info",         bg: "#EFF6FF", border: "#BFDBFE", iconColor: "#2563EB", textColor: "#1E3A8A" },
};

export function Toast({ type, message, onDismiss }: ToastProps) {
  const insets  = useSafeAreaInsets();
  const slide   = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const c       = CFG[type];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slide,   { toValue: 0, useNativeDriver: true, tension: 120, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        s.wrap,
        {
          top:             insets.top + 12,
          backgroundColor: c.bg,
          borderColor:     c.border,
          transform:       [{ translateY: slide }],
          opacity,
        },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Feather name={c.icon} size={18} color={c.iconColor} style={s.icon} />
      <Text style={[s.msg, { color: c.textColor }]} numberOfLines={4}>
        {message}
      </Text>
      <TouchableOpacity
        onPress={onDismiss}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Dismiss notification"
      >
        <Feather name="x" size={16} color={c.iconColor} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position:          "absolute",
    left:              16,
    right:             16,
    zIndex:            9999,
    flexDirection:     "row",
    alignItems:        "flex-start",
    paddingHorizontal: 14,
    paddingVertical:   12,
    borderRadius:      14,
    borderWidth:       1,
    gap:               10,
    shadowColor:       "#000",
    shadowOffset:      { width: 0, height: 4 },
    shadowOpacity:     0.10,
    shadowRadius:      12,
    elevation:         8,
  },
  icon: { marginTop: 1 },
  msg: {
    flex:       1,
    fontSize:   14,
    fontFamily: OF.medium,
    lineHeight: 20,
  },
});
