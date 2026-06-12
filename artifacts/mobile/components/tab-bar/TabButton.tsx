import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Text, TouchableOpacity } from "react-native";
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
import { GRAY_INACTIVE, LIME, tabBarStyles, type PayvoraIconName } from "./tabBarStyles";

interface TabButtonProps {
  isFocused: boolean;
  iconName: PayvoraIconName;
  label?: string;
  accessibilityLabel?: string;
  onPress: () => void;
  onLongPress: () => void;
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
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [isFocused, focusAnim]);

  const focusBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(focusAnim.value, [0, 1], [0, 1]),
    transform: [{ scale: interpolate(focusAnim.value, [0, 1], [0.8, 1]) }],
  }));

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
        <TabIcon name={iconName} focused={isFocused} size={26} />
      </Animated.View>
      {label ? (
        <Text
          style={[
            tabBarStyles.tabLabel,
            { color: isFocused ? LIME : GRAY_INACTIVE },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}
