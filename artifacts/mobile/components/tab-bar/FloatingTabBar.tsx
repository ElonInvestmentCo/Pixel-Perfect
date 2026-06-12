import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
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

    const isInteractive = animationProgress.value > 0.7;

    return {
      opacity,
      transform: [{ translateY }, { scale }],
      pointerEvents: (isInteractive ? "auto" : "none") as "auto" | "none",
    };
  });

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

interface ExpandToggleProps {
  animationProgress: SharedValue<number>;
  onToggle:          () => void;
}

function ExpandToggleButton({ animationProgress, onToggle }: ExpandToggleProps) {
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
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onToggle}
      style={tabBarStyles.tab}
      accessibilityRole="button"
      accessibilityLabel="More options"
    >
      <Animated.View style={[tabBarStyles.expandIconWrapper, iconStyle]}>
        <Feather name="chevrons-up" size={26} color="#C0C0C0" />
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

  // ── helpers ──────────────────────────────────────────────────────────────

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

  function toggleExpanded() {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    if (animationProgress.value === 0) {
      animateTo(1);
    } else {
      animateTo(0);
    }
  }

  function closeExpanded() {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    animateTo(0);
  }

  // ── menu item press ───────────────────────────────────────────────────────

  function handleMenuItemPress(index: number) {
    const item = PAYVORA_MENU_ITEMS[index];
    setSelectedMenuIndex(index);
    navigation.navigate(item.route);
    closeExpanded();
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
  }

  // ── pan gesture — swipe-up to expand, swipe-down to collapse ─────────────

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      startY.value = event.absoluteY;
      runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Rigid);
    })
    .onUpdate((event) => {
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
        animationProgress.value = withTiming(1, {
          duration: ANIMATION_DURATION,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      } else if (velocity > threshold && animationProgress.value === 1) {
        animationProgress.value = withTiming(0, {
          duration: ANIMATION_DURATION,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      } else if (animationProgress.value > 0.8) {
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

  // Pill height + border radius
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

  // Pill scale + translateY
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

  // Collapsed tab row fades out as pill expands
  const floatingBarStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animationProgress.value,
      [0, 0.25, 0.4],
      [1, 0.2, 0],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
      pointerEvents: (animationProgress.value > 0.25 ? "none" : "auto") as "none" | "auto",
    };
  });

  // ── Dismiss backdrop ─────────────────────────────────────────────────────
  //
  // Covers the full screen (React Navigation renders tabBar inside a
  // StyleSheet.absoluteFill + pointerEvents="box-none" container, so our
  // absoluteFillObject fills the entire screen).
  //
  // Opacity fades from 0 → 0.45 as the menu opens — subtle dark tint.
  // pointerEvents flips to "auto" early in the open animation so any tap
  // outside the pill fires closeExpanded(); remains "none" when closed so
  // scrolling, gestures, and button actions on the underlying screen are
  // completely unaffected.
  //
  // The backdrop is rendered BEFORE the pill in JSX, so the pill sits on
  // top in z-order and always receives its own touches first.
  const backdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animationProgress.value,
      [0, 0.2, 1],
      [0, 0, 0.45],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
      pointerEvents: (animationProgress.value > 0.1 ? "auto" : "none") as "auto" | "none",
    };
  });

  // ── visible tabs ──────────────────────────────────────────────────────────
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return options?.tabBarIcon !== undefined && (options as any)?.href !== null;
  });

  // ── sliding indicator ─────────────────────────────────────────────────────
  // 5 visible tabs + 1 expand button = 6 equally-wide flex items
  const NUM_ITEMS   = visibleRoutes.length + 1;
  const TAB_W       = PILL_WIDTH / NUM_ITEMS;
  const IND_MARGIN  = 6;

  // Which visible-tab index is currently focused?
  const focusedRoute         = state.routes[state.index];
  const focusedVisibleIndex  = visibleRoutes.findIndex((r) => r.key === focusedRoute?.key);
  const safeFocusedIdx       = Math.max(0, focusedVisibleIndex);

  // Shared value lives at the left-edge of the indicator capsule
  const indicatorLeft = useSharedValue(safeFocusedIdx * TAB_W + IND_MARGIN);

  // Spring-animate the indicator whenever the active tab changes
  useEffect(() => {
    if (focusedVisibleIndex >= 0) {
      indicatorLeft.value = withSpring(
        focusedVisibleIndex * TAB_W + IND_MARGIN,
        { damping: 22, stiffness: 200, mass: 0.85, overshootClamping: false },
      );
    }
  }, [focusedVisibleIndex, indicatorLeft, TAB_W]);

  // Glassmorphism capsule: positioned behind the tab icons/labels
  const slidingIndicatorStyle = useAnimatedStyle(() => ({
    position:        "absolute",
    top:             IND_MARGIN,
    left:            indicatorLeft.value,
    width:           TAB_W - IND_MARGIN * 2,
    height:          72 - IND_MARGIN * 2,
    borderRadius:    14,
    backgroundColor: "rgba(200, 255, 0, 0.14)",
    borderWidth:     1,
    borderColor:     "rgba(200, 255, 0, 0.28)",
    shadowColor:     "#C8FF00",
    shadowOpacity:   0.22,
    shadowRadius:    10,
    shadowOffset:    { width: 0, height: 2 },
  }));

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  //
  // Outer View: absoluteFillObject + pointerEvents="box-none"
  //   → fills the full screen, passes touches through unless a child claims them
  //
  // 1. Backdrop Animated.View (absoluteFillObject, rendered first / lower z-order)
  //      └── TouchableOpacity covering full area → calls closeExpanded()
  //
  // 2. GestureDetector → pill (rendered second / higher z-order)
  //      → pill and its menu items always receive touches before the backdrop
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={s.screenCover} pointerEvents="box-none">

      {/* ── Dismiss backdrop ── */}
      <Animated.View style={[StyleSheet.absoluteFillObject, s.backdrop, backdropStyle]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={closeExpanded}
          activeOpacity={1}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
        />
      </Animated.View>

      {/* ── Pill + pan gesture ── */}
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
              {/* ── Expanded menu ── */}
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

                {/* Glassmorphism sliding indicator — rendered first so it appears BEHIND tabs */}
                <Animated.View style={slidingIndicatorStyle} />

                {visibleRoutes.map((route, visIdx) => {
                  const { options } = descriptors[route.key];
                  const isFocused   = visIdx === focusedVisibleIndex;
                  const iconName    = ICON_MAP[route.name] ?? "circle";

                  return (
                    <TabButton
                      key={route.key}
                      isFocused={isFocused}
                      iconName={iconName as any}
                      label={options.title ?? route.name}
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

                {/* Toggle button */}
                <ExpandToggleButton
                  animationProgress={animationProgress}
                  onToggle={toggleExpanded}
                />
              </Animated.View>
            </BlurView>
          </Animated.View>
        </Animated.View>
      </GestureDetector>

    </View>
  );
}

// ─── Local styles ────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Full-screen container — matches the absoluteFill+box-none wrapper that
  // React Navigation uses for custom tabBar components.
  screenCover: {
    ...StyleSheet.absoluteFillObject,
  },

  // Semi-transparent black backdrop — opacity animated 0→0.45 by backdropStyle.
  backdrop: {
    backgroundColor: "#000000",
  },
});
