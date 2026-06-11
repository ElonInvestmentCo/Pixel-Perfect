import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabButton } from "./TabButton";
import { TabIcon } from "./TabIcon";
import {
  ANIMATION_DURATION,
  EXPANDED_HEIGHT,
  LIME,
  PAYVORA_MENU_ITEMS,
  PILL_WIDTH,
  SPRING_CONFIG,
  tabBarStyles,
  type PayvoraMenuItem,
} from "./tabBarStyles";

import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

// Maps Expo Router route names → Feather icon names
const ICON_MAP: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
  index:             "home",
  trade:             "repeat",
  cards:             "credit-card",
  activity:          "clock",
  account:           "user",
  settings:          "settings",
  "buy-gift-card":   "gift",
  "sell-gift-card":  "tag",
  "buy-crypto":      "trending-up",
  "sell-crypto":     "trending-down",
  "virtual-card":    "credit-card",
  bills:             "file-text",
  esim:              "wifi",
  referral:          "users",
  support:           "help-circle",
};

// ─── Expanded menu row ──────────────────────────────────────────────────────

interface ExpandedMenuRowProps {
  item:              PayvoraMenuItem;
  index:             number;
  animationProgress: SharedValue<number>;
  isSelected:        boolean;
  onPress:           () => void;
}

function ExpandedMenuRow({
  item,
  index,
  animationProgress,
  isSelected,
  onPress,
}: ExpandedMenuRowProps) {
  // Staggered slide-up + fade — matches reference ExpandedMenuItems animatedStyle exactly
  const rowStyle = useAnimatedStyle(() => {
    const startThreshold = 0.4 + index * 0.05;
    const endThreshold   = Math.min(startThreshold + 0.3, 1);

    const itemProgress = interpolate(
      animationProgress.value,
      [startThreshold, endThreshold],
      [0, 1],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      itemProgress,
      [0, 0.5, 1],
      [0, 0.8, 1],
      Extrapolation.CLAMP,
    );

    const translateY = withSpring(
      interpolate(itemProgress, [0, 1], [40, 0], Extrapolation.CLAMP),
      SPRING_CONFIG,
    );

    const scale = withSpring(
      interpolate(itemProgress, [0, 0.8, 1], [0.7, 1.02, 1], Extrapolation.CLAMP),
      SPRING_CONFIG,
    );

    // Block touch until row is sufficiently visible — matches reference exactly
    const isInteractive = animationProgress.value > 0.7;

    return {
      opacity,
      transform: [{ translateY }, { scale }],
      pointerEvents: (isInteractive ? "auto" : "none") as "auto" | "none",
    };
  });

  // Selection highlight bg — opacity static, scale spring — matches reference animatedSelectionStyle
  const selectionStyle = useAnimatedStyle(() => ({
    opacity: isSelected ? 0.15 : 0,
    transform: [{ scale: withSpring(isSelected ? 1 : 0.95, SPRING_CONFIG) }],
  }));

  return (
    <Animated.View style={rowStyle}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={tabBarStyles.menuRow}
        accessibilityRole="button"
        accessibilityLabel={item.label}
        accessibilityState={{ selected: isSelected }}
      >
        <Animated.View
          style={[
            tabBarStyles.menuRowBg,
            selectionStyle,
            { backgroundColor: isSelected ? LIME : "rgba(255,255,255,0.06)" },
          ]}
        />
        <View style={tabBarStyles.menuIconBox}>
          <TabIcon name={item.iconName} focused={isSelected} size={20} />
        </View>
        <Text style={[tabBarStyles.menuLabel, { color: isSelected ? LIME : "#AAAAAA" }]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Expand / collapse chevron button ──────────────────────────────────────
// Identical behaviour to reference DummyTab: tap toggles open↔closed.

interface ExpandToggleProps {
  animationProgress: SharedValue<number>;
  onToggle:          () => void;
}

function ExpandToggleButton({ animationProgress, onToggle }: ExpandToggleProps) {
  // Icon fades out as pill expands — matches reference DummyTab animatedIconStyle
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
          [1, 2, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    // Uses tabBarStyles.tab (flex:1, margin:5) — identical to reference DummyTab using styles.tab
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onToggle}
      style={tabBarStyles.tab}
      accessibilityRole="button"
      accessibilityLabel="More options"
    >
      <Animated.View style={[tabBarStyles.expandIconWrapper, iconStyle]}>
        <Feather name="chevrons-up" size={24} color="#AAAAAA" />
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── FloatingTabBar ─────────────────────────────────────────────────────────

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const animationProgress = useSharedValue(0);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);

  const startY = useSharedValue(0);

  // ── helpers (called via runOnJS from gesture worklet) ────────────────────

  function triggerHaptic(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
    Haptics.impactAsync(style).catch(() => {});
  }

  function updateSelectedIndex(index: number) {
    setSelectedMenuIndex(index);
  }

  // ── animation helpers ────────────────────────────────────────────────────

  function animateTo(target: 0 | 1) {
    animationProgress.value = withTiming(target, {
      duration: ANIMATION_DURATION,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }

  // Toggle open↔closed — matches reference DummyTab onPress logic exactly
  function toggleExpanded() {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    if (animationProgress.value === 0) {
      animateTo(1);
    } else {
      animateTo(0);
    }
  }

  function closeExpanded() {
    animateTo(0);
  }

  // ── menu item press (from expanded list) ─────────────────────────────────

  function handleMenuItemPress(index: number) {
    const item = PAYVORA_MENU_ITEMS[index];
    setSelectedMenuIndex(index);
    navigation.navigate(item.route);
    closeExpanded();
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
  }

  // ── pan gesture — swipe-up to expand, swipe-down to collapse ─────────────
  // Matches reference LinearTabBar panGesture exactly (runOnJS ≡ scheduleOnRN)

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      startY.value = event.absoluteY;
      runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Rigid);
    })
    .onUpdate((event) => {
      // While expanded: track which item the finger is hovering over
      if (animationProgress.value > 0.8) {
        const itemHeight = EXPANDED_HEIGHT / PAYVORA_MENU_ITEMS.length;
        let newIndex = Math.floor(event.y / itemHeight);
        newIndex = Math.max(0, Math.min(PAYVORA_MENU_ITEMS.length - 1, newIndex));
        runOnJS(updateSelectedIndex)(newIndex);
      }
    })
    .onEnd((event) => {
      const velocity  = event.velocityY;
      const threshold = 500;

      if (velocity < -threshold && animationProgress.value === 0) {
        // Fast swipe up → open
        animationProgress.value = withTiming(1, {
          duration: ANIMATION_DURATION,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      } else if (velocity > threshold && animationProgress.value === 1) {
        // Fast swipe down → close
        animationProgress.value = withTiming(0, {
          duration: ANIMATION_DURATION,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      } else if (animationProgress.value > 0.8) {
        // Slow release while open → navigate to hovered item and close
        const item = PAYVORA_MENU_ITEMS[selectedMenuIndex];
        runOnJS(navigation.navigate)({ name: item.route, params: {} } as never);
        animationProgress.value = withTiming(0, {
          duration: ANIMATION_DURATION,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      }

      runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Light);
    });

  // ── animated styles ───────────────────────────────────────────────────────

  // Pill height + border radius — keyframes match reference exactly
  const pillWrapperStyle = useAnimatedStyle(() => {
    const height = interpolate(
      animationProgress.value,
      [0, 0.4, 0.7, 1],
      [50, 50, 250, EXPANDED_HEIGHT],
      Extrapolation.CLAMP,
    );

    const borderRadius = interpolate(
      animationProgress.value,
      [0, 0.2, 1],
      [25, 100, 40],
      Extrapolation.CLAMP,
    );

    return { height, borderRadius, width: PILL_WIDTH };
  });

  // Pill scale + translateY — matches reference animatedTabBarStyle
  const pillScaleStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      animationProgress.value,
      [0, 0.5, 1],
      [1, 0.5, 1],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      animationProgress.value,
      [0, 0.5, 1],
      [0, -10, -20],
      Extrapolation.CLAMP,
    );
    return { transform: [{ scale }, { translateY }] };
  });

  // Collapsed tab row fades out as pill expands — matches reference animatedOriginalTabBarStyle
  const floatingBarStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animationProgress.value,
      [0, 0.25, 0.4],
      [1, 0.2, 0],
      Extrapolation.CLAMP,
    );
    // Disable touches while expanding so taps don't fall through — matches reference exactly
    return {
      opacity,
      pointerEvents: (animationProgress.value > 0.25 ? "none" : "auto") as "none" | "auto",
    };
  });

  // ── visible tabs (routes that have an icon and are not hidden) ────────────
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return options?.tabBarIcon !== undefined && (options as any)?.href !== null;
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          tabBarStyles.gestureWrapper,
          { bottom: insets.bottom + 20 },
        ]}
      >
        <Animated.View
          style={[
            tabBarStyles.pillWrapper,
            pillWrapperStyle,
            pillScaleStyle,
          ]}
        >
          <BlurView
            tint="systemThickMaterialDark"
            intensity={85}
            style={tabBarStyles.blurView}
          >
            {/* ── Expanded menu (fades in above the tab bar row) ── */}
            <View style={tabBarStyles.expandedMenu}>
              {PAYVORA_MENU_ITEMS.map((item, index) => (
                <ExpandedMenuRow
                  key={item.route}
                  item={item}
                  index={index}
                  animationProgress={animationProgress}
                  isSelected={selectedMenuIndex === index}
                  onPress={() => handleMenuItemPress(index)}
                />
              ))}
            </View>

            {/* ── Collapsed pill: tab buttons + toggle chevron ── */}
            <Animated.View style={[tabBarStyles.floatingBar, floatingBarStyle]}>
              {visibleRoutes.map((route) => {
                const { options } = descriptors[route.key];
                const isFocused   = state.index === state.routes.indexOf(route);
                const iconName    = ICON_MAP[route.name] ?? "circle";

                return (
                  <TabButton
                    key={route.key}
                    isFocused={isFocused}
                    iconName={iconName as any}
                    accessibilityLabel={options.title ?? route.name}
                    animationProgress={animationProgress}
                    onPress={() => {
                      const event = navigation.emit({
                        type: "tabPress",
                        target: route.key,
                        canPreventDefault: true,
                      });
                      if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                      }
                      triggerHaptic();
                    }}
                    onLongPress={() => {
                      navigation.emit({ type: "tabLongPress", target: route.key });
                    }}
                  />
                );
              })}

              {/* Toggle button — identical behaviour to reference DummyTab */}
              <ExpandToggleButton
                animationProgress={animationProgress}
                onToggle={toggleExpanded}
              />
            </Animated.View>
          </BlurView>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}
