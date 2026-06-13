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

const LOGO = require("../assets/images/icon.png");

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

const SlideBtc = React.memo(function SlideBtc() {
  return (
    <View style={il.wrap}>
      <Image
        source={require("../assets/images/btc-coins.png")}
        style={il.squareImg}
        resizeMode="contain"
      />
    </View>
  );
});

const SlideGiftCards = React.memo(function SlideGiftCards() {
  return (
    <View style={il.wrap}>
      <Image
        source={require("../assets/images/gift-cards.png")}
        style={il.squareImg}
        resizeMode="contain"
      />
    </View>
  );
});

const il = StyleSheet.create({
  wrap: {
    width: SW,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    overflow: "visible",
  },
  circle: {
    position:        "absolute",
    width:           SW * 0.68,
    height:          SW * 0.68,
    borderRadius:    SW * 0.34,
    backgroundColor: "#D8D8D8",
    opacity:         0.28,
  },
  squareImg: {
    width:  280,
    height: 280,
  },
  balanceCardImg: {
    // Square container matches the 1:1 asset — no letterboxing, card fills the frame
    width:  SW * 0.88,
    height: SW * 0.88,
    zIndex: 2,
  },
});

// ─── Slide metadata ───────────────────────────────────────────────────────────
const SLIDES = [
  {
    id:        "balance",
    Component: Slide1,
    headline:  "The Modern Way\nYour Money",
    sub:       "Spend, save, and grow your money all\ntogether in one place.",
  },
  {
    id:        "buying",
    Component: SlideBtc,
    headline:  "Buying & Selling",
    sub:       "Buy and sell cryptocurrencies with\npopular payment solutions.",
  },
  {
    id:        "giftcards",
    Component: SlideGiftCards,
    headline:  "Redeem Gift Cards",
    sub:       "Instantly redeem and send gift cards\nto anyone, anywhere in the world.",
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
    inputRange:  [(index - 1) * SW, index * SW, (index + 1) * SW],
    outputRange: [8, 24, 8],
    extrapolate: "clamp",
  });
  const opacity = scrollX.interpolate({
    inputRange:  [(index - 1) * SW, index * SW, (index + 1) * SW],
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
  const topPad = insets.top;
  const botPad = insets.bottom;

  // On web, ?slide=N forces a starting slide for screenshot capture.
  const startSlide =
    typeof window !== "undefined"
      ? Math.max(0, Math.min(SLIDES.length - 1, Number(new URLSearchParams(window.location.search).get("slide") ?? 0)))
      : 0;

  const scrollX       = useRef(new Animated.Value(startSlide * SW)).current;
  const scrollRef     = useRef<any>(null);
  const navigatingRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(startSlide);

  // Scroll to the forced start slide after layout
  useEffect(() => {
    if (startSlide > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: startSlide * SW, animated: false });
      }, 50);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      {/* Top bar: logo + skip */}
      <View style={[rs.topBar, { paddingTop: topPad + 10 }]}>
        <View style={rs.logoContainer}>
          <Image source={LOGO} style={rs.logoImg} resizeMode="contain" />
        </View>
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
  root:   { flex: 1 },
  topBar: {
    paddingHorizontal: 22,
    marginBottom:      4,
    flexDirection:     "row",
    alignItems:        "center",
    justifyContent:    "space-between",
  },
  logoContainer: {
    width:           110,
    height:          42,
    borderRadius:    12,
    backgroundColor: "#0A0A0A",
    overflow:        "hidden",
    alignItems:      "center",
    justifyContent:  "center",
  },
  logoImg: { width: 110, height: 110 },
  skipBtn: {
    alignSelf:         "flex-start",
    backgroundColor:   "#fff",
    borderWidth:       1.5,
    borderColor:       BLACK,
    borderRadius:      20,
    paddingHorizontal: 18,
    paddingVertical:   6,
  },
  skipText: { fontSize: 14, fontFamily: "Inter_500Medium", color: BLACK },
  slider:   { flexGrow: 0, overflow: "visible" },
  slide:    { width: SW, overflow: "visible" },
  bottom: {
    flex:                1,
    backgroundColor:     "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal:   28,
    paddingTop:          24,
    alignItems:          "center",
  },
  dotsRow:   { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  textBlock: { alignItems: "center", marginBottom: 24, minHeight: 100 },
  headline: {
    fontSize:      28,
    fontFamily:    "Inter_700Bold",
    color:         BLACK,
    textAlign:     "center",
    lineHeight:    36,
    letterSpacing: -0.3,
    marginBottom:  10,
  },
  sub: {
    fontSize:   14,
    fontFamily: "Inter_400Regular",
    color:      "#8A8A8A",
    textAlign:  "center",
    lineHeight: 22,
  },
  cta: {
    width:           "100%",
    backgroundColor: LIME,
    borderRadius:    28,
    height:          56,
    alignItems:      "center",
    justifyContent:  "center",
    marginBottom:    14,
  },
  ctaText:     { fontSize: 17, fontFamily: "Inter_700Bold", color: BLACK },
  signinLink:  { paddingVertical: 4 },
  signinLinkText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#8A8A8A" },
  signinLinkBold: { fontFamily: "Inter_600SemiBold", color: BLACK },
});
