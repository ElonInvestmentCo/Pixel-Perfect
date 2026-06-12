import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { GRAY_INACTIVE, LIME, tabBarStyles, type PayvoraIconName } from "./tabBarStyles";

const ICON_SIZE = 22;

interface TabButtonProps {
  isFocused:         boolean;
  iconName:          PayvoraIconName;
  label?:            string;
  accessibilityLabel?: string;
  onPress:           () => void;
  onLongPress:       () => void;
  animationProgress: SharedValue<number>;
}

export function TabButton({
  isFocused,
  iconName,
  label,
  accessibilityLabel,
  onPress,
  onLongPress,
  animationProgress,
}: TabButtonProps) {
  const focusAnim = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    focusAnim.value = withTiming(isFocused ? 1 : 0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
    if (isFocused) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [isFocused, focusAnim]);

  // Fade + shrink whole tab when pill expands (existing behaviour)
  const barFadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animationProgress.value,
      [0, 0.25, 0.4],
      [1, 0.5, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          animationProgress.value,
          [0, 0.5, 1],
          [1, 0.5, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  // Scale-up the tab content when focused
  const contentScaleStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(focusAnim.value, [0, 1], [1, 1.07]) },
    ],
  }));

  // Inactive icon fades out, active icon fades in → smooth cross-fade
  const inactiveIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(focusAnim.value, [0, 0.4, 1], [1, 0.3, 0]),
  }));

  const activeIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(focusAnim.value, [0, 0.6, 1], [0, 0.7, 1]),
  }));

  // Label color cross-fades between muted gray and lime
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      focusAnim.value,
      [0, 1],
      [GRAY_INACTIVE, LIME],
    ),
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onLongPress={onLongPress}
      style={tabBarStyles.tab}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isFocused }}
    >
      <Animated.View style={[styles.tabContent, barFadeStyle]}>
        <Animated.View style={contentScaleStyle}>
          {/* Cross-fade icon: inactive (gray) fades out, active (lime) fades in */}
          <View style={styles.iconWrap}>
            <Animated.View style={[StyleSheet.absoluteFill, styles.iconCenter, inactiveIconStyle]}>
              <Feather name={iconName} size={ICON_SIZE} color={GRAY_INACTIVE} />
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, styles.iconCenter, activeIconStyle]}>
              <Feather name={iconName} size={ICON_SIZE} color={LIME} />
            </Animated.View>
          </View>

          {label ? (
            <Animated.Text style={[tabBarStyles.tabLabel, labelStyle]} numberOfLines={1}>
              {label}
            </Animated.Text>
          ) : null}
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    alignItems:     "center",
    justifyContent: "center",
    gap:            3,
  },
  iconWrap: {
    width:  ICON_SIZE,
    height: ICON_SIZE,
  },
  iconCenter: {
    alignItems:     "center",
    justifyContent: "center",
  },
});
