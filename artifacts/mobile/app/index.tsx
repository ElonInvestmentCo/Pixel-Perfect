import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW } = Dimensions.get("window");

const LIME  = "#e6f51b";
const BLACK = "#1A1A1A";

// ─── Slide illustrations ──────────────────────────────────────────────────────
const Slide1 = React.memo(function Slide1() {
  return (
    <View style={il.wrap}>
      <View style={il.circle} />
      <Image
        source={require("../assets/images/balance-card-slide.png")}
        style={il.balanceCardImg}
        resizeMode="contain"
      />
    </View>
  );
});

// ─── BTC coins illustration (from zip asset) ─────────────────────────────────
const SlideBtc = React.memo(function SlideBtc() {
  return (
    <View style={il.wrap}>
      <Image
        source={require("../assets/images/btc-coins.png")}
        style={il.btcImg}
        resizeMode="contain"
      />
    </View>
  );
});

const il = StyleSheet.create({
  wrap: { width: SW, paddingHorizontal: 24, alignItems: "center", justifyContent: "center", flex: 1 },
  circle: {
    position: "absolute",
    width: SW * 0.68, height: SW * 0.68,
    borderRadius: SW * 0.34,
    backgroundColor: "#D8D8D8",
    opacity: 0.28,
  },
  btcImg: {
    width: 280,
    height: 280,
  },
  balanceCardImg: {
    width: SW * 1.2,
    height: SW * 1.05,
    zIndex: 2,
    marginTop: 10,
  },
});

// ─── Slide metadata ───────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: "balance",
    Component: Slide1,
    headline: "The Modern Way\nYour Money",
    sub: "Spend, save, and grow your money all\ntogether in one place.",
  },
  {
    id: "buying",
    Component: SlideBtc,
    headline: "Buying & Selling",
    sub: "Buy and sell cryptocurrencies with popular payment solutions",
  },
  {
    id: "wallet",
    Component: SlideBtc,
    headline: "Secure Wallet",
    sub: "Keep your assets safe with military-grade encryption technology",
  },
  {
    id: "transfers",
    Component: SlideBtc,
    headline: "Fast Transfers",
    sub: "Send and receive crypto instantly anywhere in the world",
  },
  {
    id: "portfolio",
    Component: SlideBtc,
    headline: "Track Portfolio",
    sub: "Monitor your investments with real-time price updates and charts",
  },
];

// ─── Animated dot ─────────────────────────────────────────────────────────────
const AnimatedDot = React.memo(function AnimatedDot({
  index,
  scrollX,
}: {
  index: number;
  scrollX: Animated.Value;
}) {
  const width = scrollX.interpolate({
    inputRange: [(index - 1) * SW, index * SW, (index + 1) * SW],
    outputRange: [8, 24, 8],
    extrapolate: "clamp",
  });
  const opacity = scrollX.interpolate({
    inputRange: [(index - 1) * SW, index * SW, (index + 1) * SW],
    outputRange: [0.3, 1, 0.3],
    extrapolate: "clamp",
  });
  return <Animated.View style={[dot.base, { width, opacity }]} />;
});

const dot = StyleSheet.create({
  base: { height: 8, borderRadius: 4, backgroundColor: BLACK, marginHorizontal: 3 },
});

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  // insets.top: Dynamic Island ~59pt, notch ~44pt, older iPhone ~20pt, Android varies
  // insets.bottom: home indicator ~34pt, older iPhone 0pt
  const topPad = insets.top;
  const botPad = insets.bottom;

  const scrollX      = useRef(new Animated.Value(0)).current;
  const scrollRef    = useRef<any>(null);
  const navigatingRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = scrollX.addListener(({ value }) => {
      setActiveIndex(Math.round(value / SW));
    });
    return () => scrollX.removeListener(id);
  }, [scrollX]);

  const safeNavigate = React.useCallback((fn: () => void) => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    fn();
    setTimeout(() => { navigatingRef.current = false; }, 600);
  }, []);

  const activeSlide = useMemo(() => SLIDES[activeIndex], [activeIndex]);

  return (
    <View style={[rs.root, { backgroundColor: "#EBEBEB" }]}>
      {/* Skip */}
      <View style={[rs.topBar, { paddingTop: topPad + 10 }]}>
        <TouchableOpacity
          style={rs.skipBtn}
          onPress={() => safeNavigate(() => router.push("/signin"))}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
        >
          <Text style={rs.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        style={rs.slider}
        contentContainerStyle={{ alignItems: "center" }}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={[rs.slide, { height: SW * 0.85 }]}>
            <slide.Component />
          </View>
        ))}
      </Animated.ScrollView>

      {/* Bottom sheet */}
      <View style={[rs.bottom, { paddingBottom: botPad + 20 }]}>
        {/* Dots */}
        <View style={rs.dotsRow}>
          {SLIDES.map((_, i) => (
            <AnimatedDot key={i} index={i} scrollX={scrollX} />
          ))}
        </View>

        {/* Text — changes between slides */}
        <View style={rs.textBlock}>
          <Text style={rs.headline}>{activeSlide.headline}</Text>
          <Text style={rs.sub}>{activeSlide.sub}</Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={rs.cta}
          onPress={() => safeNavigate(() => router.push("/signup"))}
          accessibilityRole="button"
          accessibilityLabel="Get started"
        >
          <Text style={rs.ctaText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={rs.signinLink}
          onPress={() => safeNavigate(() => router.push("/signin"))}
          accessibilityRole="button"
          accessibilityLabel="Already have an account? Sign In"
        >
          <Text style={rs.signinLinkText}>
            Already have an account? <Text style={rs.signinLinkBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const rs = StyleSheet.create({
  root: { flex: 1 },
  topBar: { paddingHorizontal: 22, marginBottom: 4 },
  skipBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1.5, borderColor: BLACK,
    borderRadius: 20, paddingHorizontal: 18, paddingVertical: 6,
  },
  skipText: { fontSize: 14, fontFamily: "Inter_500Medium", color: BLACK },
  slider: { flexGrow: 0 },
  slide: { width: SW },
  bottom: {
    flex: 1, backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 28, paddingTop: 24, alignItems: "center",
  },
  dotsRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  textBlock: { alignItems: "center", marginBottom: 24, minHeight: 100 },
  headline: {
    fontSize: 28, fontFamily: "Inter_700Bold",
    color: BLACK, textAlign: "center",
    lineHeight: 36, letterSpacing: -0.3, marginBottom: 10,
  },
  sub: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    color: "#8A8A8A", textAlign: "center", lineHeight: 22,
  },
  cta: {
    width: "100%", backgroundColor: LIME,
    borderRadius: 28, height: 56,
    alignItems: "center", justifyContent: "center",
    marginBottom: 14,
  },
  ctaText: { fontSize: 17, fontFamily: "Inter_700Bold", color: BLACK },
  signinLink: { paddingVertical: 4 },
  signinLinkText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#8A8A8A" },
  signinLinkBold: { fontFamily: "Inter_600SemiBold", color: BLACK },
});
