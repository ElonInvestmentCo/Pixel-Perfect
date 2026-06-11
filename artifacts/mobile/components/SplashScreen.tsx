/**
 * PayVora — Animated Splash Screen
 *
 * Layers (bottom → top):
 *   1. DiamondFacets   — large triangular facets in PayVora gray palette
 *   2. WorldMapDots    — 56×24 dot grid at low opacity
 *   3. VignetteOverlay — top/bottom edge softening
 *   4. Logo + text     — Reanimated spring entrance
 */

import React, { useEffect } from "react";
import { Dimensions, Platform, StatusBar, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  LinearGradient,
  Polygon,
  Rect,
  Stop,
} from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW, height: SH } = Dimensions.get("window");

// ── PayVora brand palette (matches constants/colors.ts) ────────────────────
const BG_BASE  = "#EBEBEB";   // app background — light gray
const BG_LIGHT = "#FFFFFF";   // lightest facet  — white highlight
const BG_MID   = "#DADADA";   // mid facet       — subtle shadow
const BG_DARK  = "#C4C4C4";   // dark facet      — deeper shadow
const BG_DARK2 = "#B2B2B2";   // darkest facet   — corner depth
const DARK     = "#1A1A1A";   // text / logo primary
const LIME     = "#C8FF00";   // primary accent (colors.light.lime)

// ── World-map ASCII grid (56 cols × 24 rows) ──────────────────────────────
// From reference App.tsx — rendered as white dots at 8% opacity
const MAP_ROWS = [
  "                                                        ",
  "       ####     ##                                      ",
  "     ########  ####  ##   ###                           ",
  "    ######### ###### ### #####  ##########              ",
  "    ######### ########## ####################################",
  "    ######### ########## ###################################",
  "     ######## ########## ##################################",
  "     ######## ########## #################################",
  "      ####### #########  ############################  ## ",
  "       ###### #########  ###########################   ## ",
  "       ######  ########  ######### ###########  ##########",
  "       ######  ########  ######### ###########  ##########",
  "  #    ######  ########  ######### #####         #########",
  " ###   ######  ########  ########  #####          ########",
  " ####  #####    #######  ########  ####            ###### ",
  " ####  ####      ######  #######    ###            ###### ",
  "  ###  ###       ######  ######                    #####  ",
  "  ###  ##         #####  #####                     ####   ",
  "   ##   #          ####   ####                      ##    ",
  "   ##               ###    ##                             ",
  "    #                ##                                   ",
  "                      #                                   ",
  "                                                          ",
  "                                                          ",
];

const MCOLS = 56;
const MCW   = SW / MCOLS;
const MCH   = (SH * 0.86) / 24;
const MAP_Y = SH * 0.06;

// Pre-compute dot positions once at module load — no per-render cost
const MAP_DOTS: { cx: number; cy: number }[] = [];
MAP_ROWS.forEach((row, r) => {
  for (let c = 0; c < MCOLS; c++) {
    if (row[c] === "#") {
      MAP_DOTS.push({
        cx: c * MCW + MCW / 2,
        cy: MAP_Y + r * MCH + MCH / 2,
      });
    }
  }
});

// ── Layer 1 — Diamond facets ──────────────────────────────────────────────
// Replicates CoinPay's large triangular cut-gem pattern across the screen.
// 4 corner triangles + 1 large center diamond + 4 sub-corner accents = 9 polygons.
function DiamondFacets() {
  const W  = SW;
  const H  = SH;
  const CX = W / 2;
  const CY = H * 0.48;   // diamond focal point sits just above center (matches CoinPay)

  return (
    <Svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={StyleSheet.absoluteFillObject}
    >
      {/* Base fill — light gray */}
      <Rect width={W} height={H} fill={BG_BASE} />

      {/* ── 4 main triangular facets (like cut gem) ── */}

      {/* Top triangle → lighter */}
      <Polygon
        points={`0,0 ${W},0 ${CX},${CY}`}
        fill={BG_LIGHT}
        opacity={0.72}
      />

      {/* Left triangle → darker */}
      <Polygon
        points={`0,0 ${CX},${CY} 0,${H}`}
        fill={BG_DARK}
        opacity={0.82}
      />

      {/* Right triangle → mid */}
      <Polygon
        points={`${W},0 ${W},${H} ${CX},${CY}`}
        fill={BG_MID}
        opacity={0.76}
      />

      {/* Bottom triangle → darkest */}
      <Polygon
        points={`0,${H} ${W},${H} ${CX},${CY}`}
        fill={BG_DARK2}
        opacity={0.88}
      />

      {/* ── Central inner diamond highlight (lighter center glow) ── */}
      <Polygon
        points={`
          ${CX - W * 0.52},${CY}
          ${CX},${CY - H * 0.35}
          ${CX + W * 0.52},${CY}
          ${CX},${CY + H * 0.38}
        `}
        fill={BG_LIGHT}
        opacity={0.22}
      />

      {/* ── 4 corner accent facets (sub-triangles, exactly like CoinPay) ── */}

      {/* Top-left sub-corner */}
      <Polygon
        points={`0,0 ${W * 0.38},0 0,${H * 0.24}`}
        fill={BG_DARK}
        opacity={0.48}
      />

      {/* Top-right sub-corner */}
      <Polygon
        points={`${W * 0.62},0 ${W},0 ${W},${H * 0.24}`}
        fill={BG_MID}
        opacity={0.44}
      />

      {/* Bottom-left sub-corner */}
      <Polygon
        points={`0,${H * 0.76} 0,${H} ${W * 0.38},${H}`}
        fill={BG_LIGHT}
        opacity={0.32}
      />

      {/* Bottom-right sub-corner */}
      <Polygon
        points={`${W * 0.62},${H} ${W},${H} ${W},${H * 0.76}`}
        fill={BG_DARK}
        opacity={0.42}
      />
    </Svg>
  );
}

// ── Layer 2 — Dotted world map ────────────────────────────────────────────
// Dark dots at 7% opacity — subtle on the light PayVora background
function WorldMapDots() {
  return (
    <Svg
      width={SW}
      height={SH}
      viewBox={`0 0 ${SW} ${SH}`}
      style={[StyleSheet.absoluteFillObject, { opacity: 0.07 }]}
    >
      {MAP_DOTS.map((d, i) => (
        <Circle key={i} cx={d.cx} cy={d.cy} r={2.2} fill={DARK} />
      ))}
    </Svg>
  );
}

// ── Layer 3 — Edge vignette ────────────────────────────────────────────────
// Subtle top + bottom darkening for depth, matching CoinPay's edge treatment
function VignetteOverlay() {
  return (
    <Svg
      width={SW}
      height={SH}
      viewBox={`0 0 ${SW} ${SH}`}
      style={StyleSheet.absoluteFillObject}
    >
      <Defs>
        <LinearGradient id="vTop" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000000" stopOpacity="0.30" />
          <Stop offset="0.18" stopColor="#000000" stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id="vBot" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0.82" stopColor="#000000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0.28" />
        </LinearGradient>
      </Defs>
      <Rect width={SW} height={SH} fill="url(#vTop)" />
      <Rect width={SW} height={SH} fill="url(#vBot)" />
    </Svg>
  );
}

// ── PayVora logo — two overlapping circles ────────────────────────────────
// Dark circle (left) + lime circle (right) — PayVora brand palette.
// Intersection uses a bg-tinted overlay to create the characteristic depth.
function PayVoraLogo({ size = 88 }: { size?: number }) {
  const r   = size * 0.32;
  const cx1 = size * 0.36;
  const cx2 = size * 0.64;
  const cy  = size * 0.50;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <ClipPath id="leftCircleClip">
          <Circle cx={cx1} cy={cy} r={r} />
        </ClipPath>
      </Defs>

      {/* Left circle — dark / primary */}
      <Circle cx={cx1} cy={cy} r={r} fill={DARK} />

      {/* Right circle — lime accent */}
      <Circle cx={cx2} cy={cy} r={r} fill={LIME} opacity={0.92} />

      {/* Intersection — bg overlay creates visible depth between the two colours */}
      <Circle
        cx={cx2}
        cy={cy}
        r={r}
        fill={BG_BASE}
        opacity={0.42}
        clipPath="url(#leftCircleClip)"
      />
    </Svg>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const insets = useSafeAreaInsets();

  // Shared animation values
  const logoScale   = useSharedValue(0.62);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textY       = useSharedValue(18);
  const tagOpacity  = useSharedValue(0);

  useEffect(() => {
    // Logo springs in — matches reference: duration 0.9s, elastic spring ease [0.34,1.46,0.64,1]
    logoOpacity.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.ease) });
    logoScale.value   = withSpring(1, { damping: 14, stiffness: 120, mass: 0.8 });

    // Brand name fades + slides up — delay 450ms, 600ms duration
    textOpacity.value = withDelay(
      450,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) }),
    );
    textY.value = withDelay(
      450,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }),
    );

    // Tagline fades in — delay 750ms
    tagOpacity.value = withDelay(750, withTiming(1, { duration: 500 }));

    // Hold for 2.2s total then hand off
    const timer = setTimeout(onFinish, 2200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logoAnimStyle = useAnimatedStyle(() => ({
    opacity:   logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimStyle = useAnimatedStyle(() => ({
    opacity:   textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));

  const tagAnimStyle = useAnimatedStyle(() => ({
    opacity: tagOpacity.value,
  }));

  const bottomIndicatorBottom =
    insets.bottom > 0 ? insets.bottom - 4 : 10;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BG_BASE}
        translucent={Platform.OS === "android"}
      />

      {/* ── Background layers (bottom → top) ── */}
      <DiamondFacets />
      <WorldMapDots />
      <VignetteOverlay />

      {/* ── Center logo + text ── */}
      <View style={[styles.center, { pointerEvents: "none" }]}>

        <Animated.View style={[styles.logoWrap, logoAnimStyle]}>
          <PayVoraLogo size={92} />
        </Animated.View>

        <Animated.View style={[styles.textBlock, textAnimStyle]}>
          <Text style={styles.brandName}>PayVora</Text>
          <Animated.Text style={[styles.tagline, tagAnimStyle]}>
            GLOBAL PAYMENTS
          </Animated.Text>
        </Animated.View>
      </View>

      {/* Home indicator */}
      <View
        style={[styles.homeIndicator, { bottom: bottomIndicatorBottom, pointerEvents: "none" }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: BG_BASE,
  },

  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems:     "center",
    justifyContent: "center",
    gap:            22,
  },

  logoGlow: {
    position:        "absolute",
    width:           200,
    height:          200,
    borderRadius:    100,
    backgroundColor: "transparent",
    shadowColor:     DARK,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.10,
    shadowRadius:    40,
    elevation:       0,
  },

  logoWrap: {
    alignItems: "center",
  },

  textBlock: {
    alignItems: "center",
    gap:        8,
  },

  brandName: {
    color:          DARK,
    fontSize:       28,
    fontWeight:     "700",
    letterSpacing:  0.6,
    fontFamily:     Platform.OS === "ios" ? "System" : "sans-serif-medium",
  },

  tagline: {
    color:          "rgba(26,26,26,0.48)",
    fontSize:       11,
    fontWeight:     "500",
    letterSpacing:  3.8,
    fontFamily:     Platform.OS === "ios" ? "System" : "sans-serif",
  },

  homeIndicator: {
    position:        "absolute",
    alignSelf:       "center",
    width:           130,
    height:          5,
    borderRadius:    3,
    backgroundColor: "rgba(26,26,26,0.18)",
  },
});
