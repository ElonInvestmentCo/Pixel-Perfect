import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { TabIcon } from "./TabIcon";
import { tabBarStyles, type PayvoraIconName } from "./tabBarStyles";

interface TabButtonProps {
  isFocused: boolean;
  iconName: PayvoraIconName;
  accessibilityLabel?: string;
  onPress: () => void;
  onLongPress: () => void;
  animationProgress: SharedValue<number>;
}

export function TabButton({
  isFocused,
  iconName,
  accessibilityLabel,
  onPress,
  onLongPress,
  animationProgress,
}: TabButtonProps) {
  const focusAnim = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    // Animate focus highlight — matches reference AnimatedTab useEffect
    focusAnim.value = withTiming(isFocused ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
    // Trigger haptic on tab switch — matches reference triggerHaptics() in useEffect
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [isFocused, focusAnim]);

  // Focus background animates in — scale starts at 0.8 to match reference exactly
  const focusBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(focusAnim.value, [0, 1], [0, 1]),
    transform: [{ scale: interpolate(focusAnim.value, [0, 1], [0.8, 1]) }],
  }));

  // Icon fades + counter-scales while pill expands — identical to reference AnimatedTab
  const iconStyle = useAnimatedStyle(() => ({
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

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
      style={tabBarStyles.tab}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isFocused }}
    >
      <Animated.View style={[tabBarStyles.tabFocusBg, focusBgStyle]} />
      <Animated.View style={iconStyle}>
        <TabIcon name={iconName} focused={isFocused} />
      </Animated.View>
    </TouchableOpacity>
  );
}
