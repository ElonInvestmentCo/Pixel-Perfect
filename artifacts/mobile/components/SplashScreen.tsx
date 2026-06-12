/**
 * PayVora — Animated Splash Screen
 *
 * Displays the official PayVora logo (logo.png) with a spring-entrance
 * animation: scale + opacity, matching the original 2.2 s timing.
 */

import React, { useEffect } from "react";
import { Dimensions, Image, Platform, StatusBar, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: SW, height: SH } = Dimensions.get("window");

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const logoScale   = useSharedValue(0.62);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.ease) });
    logoScale.value   = withSpring(1, { damping: 14, stiffness: 120, mass: 0.8 });

    const timer = setTimeout(onFinish, 2200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logoAnimStyle = useAnimatedStyle(() => ({
    opacity:   logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
        translucent={Platform.OS === "android"}
      />

      <Animated.View style={[styles.logoWrap, logoAnimStyle]}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: "#000000",
    alignItems:      "center",
    justifyContent:  "center",
  },

  logoWrap: {
    alignItems:     "center",
    justifyContent: "center",
  },

  logo: {
    width:  SW,
    height: SH,
  },
});
