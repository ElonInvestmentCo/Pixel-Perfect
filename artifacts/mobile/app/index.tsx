import { Feather } from "@expo/vector-icons";
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

const LIME  = "#C8FF00";
const BLACK = "#1A1A1A";

// ─── Shared card chip decoration ─────────────────────────────────────────────
const Chip = React.memo(function Chip() {
  return (
    <View style={chip.wrap}>
      <View style={chip.bandH} />
      <View style={chip.bandV} />
      <View style={chip.center} />
    </View>
  );
});

const chip = StyleSheet.create({
  wrap: {
    width: 34, height: 26, borderRadius: 5,
    backgroundColor: "#D4A843", justifyContent: "center",
    alignItems: "center", overflow: "hidden",
  },
  bandH: { position: "absolute", width: "100%", height: 2, backgroundColor: "#B8882A", opacity: 0.6 },
  bandV: { position: "absolute", height: "100%", width: 2, backgroundColor: "#B8882A", opacity: 0.6 },
  center: {
    width: 12, height: 10, borderRadius: 2,
    borderWidth: 1.5, borderColor: "#B8882A",
    position: "absolute",
  },
});

// ─── Concentric ring decoration ───────────────────────────────────────────────
const Rings = React.memo(function Rings({ color }: { color: string }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {[80, 110, 140, 170].map((s, i) => (
        <View key={i} style={{
          position: "absolute", width: s, height: s,
          borderRadius: s / 2, borderWidth: 1.5,
          borderColor: color,
          right: -s * 0.36, bottom: -s * 0.36,
        }} />
      ))}
    </View>
  );
});

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

const CARD_W = SW * 0.7;
const CARD_H = CARD_W * 0.615;

const Slide2 = React.memo(function Slide2() {
  return (
    <View style={il.wrap}>
      <View style={il.circle} />
      <View style={{ width: "100%", position: "relative", height: CARD_H + 60, justifyContent: "center" }}>
        {/* Purple card */}
        <View style={[il.creditCard, {
          backgroundColor: "#5B50D6", zIndex: 1,
          top: 0, left: 10,
          transform: [{ rotate: "-6deg" }],
        }]}>
          <Rings color="rgba(255,255,255,0.15)" />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Chip />
            {[10, 15, 20].map((r, i) => (
              <View key={i} style={{
                position: "absolute", left: 48 + (i * 4), width: r, height: r,
                borderRadius: r / 2, borderWidth: 1.5,
                borderColor: "rgba(255,255,255,0.7)", backgroundColor: "transparent",
              }} />
            ))}
          </View>
          <Text style={{ color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 14 }}>5643 7890</Text>
          <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12 }}>Jennifer Lopez</Text>
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 2 }}>Exp 03/28</Text>
        </View>
        {/* Lime card */}
        <View style={[il.creditCard, {
          backgroundColor: LIME, zIndex: 2,
          bottom: 0, right: 0,
          transform: [{ rotate: "-1.5deg" }],
        }]}>
          <Rings color="rgba(255,255,255,0.3)" />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Chip />
          </View>
          <Text style={{ color: BLACK, fontSize: 13, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginBottom: 14 }}>5643 7890 3281 7865</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <View>
              <Text style={{ color: BLACK, fontSize: 12 }}>Jennifer Lopez</Text>
              <Text style={{ color: "#333", fontSize: 11, marginTop: 2 }}>Exp 03/28</Text>
            </View>
            <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: BLACK, fontStyle: "italic" }}>VISA</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const Slide3 = React.memo(function Slide3() {
  const bars = [40, 65, 50, 80, 55, 95, 70];
  return (
    <View style={il.wrap}>
      <View style={il.circle} />
      <View style={il.card}>
        <Text style={{ fontSize: 12, color: "#8A8A8A", fontFamily: "Inter_400Regular", marginBottom: 4 }}>Portfolio Growth</Text>
        <Text style={{ fontSize: 28, fontFamily: "Inter_700Bold", color: BLACK, marginBottom: 16 }}>+24.5%</Text>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, height: 80 }}>
          {bars.map((h, i) => (
            <View key={i} style={{
              flex: 1, height: `${h}%`,
              backgroundColor: i === bars.length - 1 ? LIME : "#E8E8E8",
              borderRadius: 6,
            }} />
          ))}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m) => (
            <Text key={m} style={{ fontSize: 9, color: "#AAAAAA" }}>{m}</Text>
          ))}
        </View>
      </View>
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
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20, borderWidth: 1.5,
    borderColor: "#D8D8D8", padding: 20,
    zIndex: 2,
  },
  balanceCardImg: {
    width: SW * 1.1,
    height: SW * 0.96,
    zIndex: 2,
    marginTop: 10,
  },
  cardLabel: { fontSize: 13, color: "#8A8A8A", fontFamily: "Inter_400Regular" },
  cardAmount: { fontSize: 34, fontFamily: "Inter_700Bold", color: BLACK, marginVertical: 12, letterSpacing: -0.5 },
  pill: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: LIME, borderWidth: 1.5, borderColor: BLACK,
    borderRadius: 24, paddingVertical: 7, paddingHorizontal: 12, gap: 5,
  },
  iconCircle: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 1.5, borderColor: BLACK,
    alignItems: "center", justifyContent: "center",
  },
  pillText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: BLACK },
  menuBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: LIME, borderWidth: 1.5, borderColor: BLACK,
    alignItems: "center", justifyContent: "center",
  },
  creditCard: {
    position: "absolute",
    width: CARD_W, height: CARD_H,
    borderRadius: 18, padding: 16, overflow: "hidden",
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
    id: "cards",
    Component: Slide2,
    headline: "Pay Your Way\nWorldwide",
    sub: "Tap, swipe, or transfer — your money\ngoes where you go.",
  },
  {
    id: "growth",
    Component: Slide3,
    headline: "Watch Your\nMoney Grow",
    sub: "Track investments and savings goals\nwith real-time insights.",
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
