import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW } = Dimensions.get("window");

// ─── Colors ───────────────────────────────────────────────────────────────────
const LIME    = "#C8FF00";
const BLACK   = "#1A1A1A";
const GRAY_BG = "#EBEBEB";
const PURPLE  = "#5B50D6";
const DOT_ON  = "#4338CA";

// ─── Chip SVG-style component ──────────────────────────────────────────────────
function ChipIcon({ color = "#D4A843" }: { color?: string }) {
  return (
    <View style={[chipStyles.chip, { borderColor: color }]}>
      <View style={[chipStyles.band, chipStyles.bandH, { backgroundColor: color }]} />
      <View style={[chipStyles.band, chipStyles.bandV, { backgroundColor: color }]} />
      <View style={[chipStyles.center, { borderColor: color }]} />
    </View>
  );
}
const chipStyles = StyleSheet.create({
  chip: {
    width: 34,
    height: 26,
    borderRadius: 5,
    borderWidth: 1.5,
    backgroundColor: "#D4A843",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  band: { position: "absolute", opacity: 0.6 },
  bandH: { width: "100%", height: 2 },
  bandV: { height: "100%", width: 2 },
  center: {
    width: 12,
    height: 10,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: "#B8882A",
    backgroundColor: "transparent",
    position: "absolute",
  },
});

// ─── Concentric circles decoration ────────────────────────────────────────────
function CircleDecor({ color }: { color: string }) {
  return (
    <View style={decorStyles.wrap} pointerEvents="none">
      {[90, 110, 130, 150].map((size, i) => (
        <View
          key={i}
          style={[
            decorStyles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: color,
              right: -size * 0.38,
              bottom: -size * 0.38,
            },
          ]}
        />
      ))}
    </View>
  );
}
const decorStyles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  ring: {
    position: "absolute",
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },
});

// ─── Page 1: Balance card ──────────────────────────────────────────────────────
function BalancePage() {
  return (
    <View style={pg.topContent}>
      <View style={pg.decorCircle} />
      <View style={pg.balanceCard}>
        <View style={pg.labelRow}>
          <Text style={pg.labelText}>Total Balance</Text>
          <Feather name="eye" size={16} color="#8A8A8A" style={{ marginLeft: 6 }} />
        </View>
        <Text style={pg.amountText}>$0.00</Text>
        <View style={pg.actionsRow}>
          <TouchableOpacity style={pg.actionPill} activeOpacity={0.8}>
            <View style={pg.actionIconCircle}>
              <Feather name="arrow-up" size={14} color={BLACK} />
            </View>
            <Text style={pg.actionText}>Transfer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[pg.actionPill, { marginLeft: 10 }]} activeOpacity={0.8}>
            <View style={pg.actionIconCircle}>
              <Feather name="arrow-down" size={14} color={BLACK} />
            </View>
            <Text style={pg.actionText}>Receive</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[pg.menuCircle, { marginLeft: 10 }]} activeOpacity={0.8}>
            <Feather name="menu" size={16} color={BLACK} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const pg = StyleSheet.create({
  topContent: { alignItems: "center", paddingHorizontal: 20, position: "relative" },
  decorCircle: {
    position: "absolute",
    width: SW * 0.75,
    height: SW * 0.75,
    borderRadius: SW * 0.375,
    backgroundColor: "#E0E0E0",
    top: -SW * 0.08,
  },
  balanceCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#D8D8D8",
    padding: 20,
    zIndex: 2,
  },
  labelRow: { flexDirection: "row", alignItems: "center" },
  labelText: { fontSize: 13, color: "#8A8A8A" },
  amountText: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: BLACK,
    marginTop: 6,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  actionsRow: { flexDirection: "row", alignItems: "center" },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LIME,
    borderWidth: 1.5,
    borderColor: BLACK,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
  },
  actionIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: BLACK,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: BLACK },
  menuCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: LIME,
    borderWidth: 1.5,
    borderColor: BLACK,
    alignItems: "center",
    justifyContent: "center",
  },
});

// ─── Page 2: Cards ────────────────────────────────────────────────────────────
const CARD_W = SW * 0.72;
const CARD_H = CARD_W * 0.615;

function CardsPage() {
  return (
    <View style={cd.topContent}>
      {/* Background circle */}
      <View style={cd.decorCircle} />

      {/* Card stack container */}
      <View style={cd.stackContainer}>
        {/* Purple card — behind */}
        <View style={[cd.card, cd.purpleCard]}>
          <CircleDecor color="rgba(255,255,255,0.18)" />
          <View style={cd.cardTopRow}>
            <ChipIcon color="#D4A843" />
            <View style={cd.nfcIcon}>
              {[10, 15, 20].map((r, i) => (
                <View key={i} style={[cd.nfcRing, { width: r, height: r, borderRadius: r / 2, opacity: 0.8 - i * 0.2 }]} />
              ))}
            </View>
          </View>
          <Text style={cd.purpleCardNum}>5643 7890</Text>
          <Text style={cd.purpleCardName}>Jennifer Lopez</Text>
          <Text style={cd.purpleCardExp}>Exp 03/28</Text>
        </View>

        {/* Lime card — front */}
        <View style={[cd.card, cd.limeCard]}>
          <CircleDecor color="rgba(255,255,255,0.25)" />
          <View style={cd.cardTopRow}>
            <ChipIcon color="#C69A2A" />
            <View style={cd.nfcIcon}>
              {[10, 15, 20].map((r, i) => (
                <View key={i} style={[cd.nfcRingDark, { width: r, height: r, borderRadius: r / 2, opacity: 0.6 - i * 0.15 }]} />
              ))}
            </View>
          </View>
          <Text style={cd.limeCardNum}>5643 7890 3281 7865</Text>
          <View style={cd.limeCardBottom}>
            <View>
              <Text style={cd.limeCardName}>Jennifer Lopez</Text>
              <Text style={cd.limeCardExp}>Exp 03/28</Text>
            </View>
            <Text style={cd.visaText}>VISA</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const cd = StyleSheet.create({
  topContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    position: "relative",
    height: SW * 0.85,
  },
  decorCircle: {
    position: "absolute",
    width: SW * 0.75,
    height: SW * 0.75,
    borderRadius: SW * 0.375,
    backgroundColor: "#E0E0E0",
    top: -SW * 0.08,
  },
  stackContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  card: {
    position: "absolute",
    width: CARD_W,
    height: CARD_H,
    borderRadius: 18,
    padding: 16,
    overflow: "hidden",
  },
  purpleCard: {
    backgroundColor: PURPLE,
    top: 20,
    left: 4,
    transform: [{ rotate: "-6deg" }],
    zIndex: 1,
  },
  limeCard: {
    backgroundColor: LIME,
    bottom: 10,
    right: 0,
    transform: [{ rotate: "-2deg" }],
    zIndex: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  nfcIcon: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  nfcRing: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.8)",
    backgroundColor: "transparent",
  },
  nfcRingDark: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.4)",
    backgroundColor: "transparent",
  },
  purpleCardNum: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 16,
  },
  purpleCardName: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  purpleCardExp: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  limeCardNum: {
    color: BLACK,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  limeCardBottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  limeCardName: {
    color: BLACK,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  limeCardExp: {
    color: "#333333",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  visaText: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: BLACK,
    fontStyle: "italic",
    letterSpacing: -0.5,
  },
});

// ─── Slide data ────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: "balance",
    headline: "The Modern Way\nYour Money",
    subtitle: "Spend, save, and grow their money all\ntogether in on place.",
    renderContent: () => <BalancePage />,
  },
  {
    id: "cards",
    headline: "Pay Your Way\nWorldwide",
    subtitle: "Spend, save, and grow their money all\ntogether in on place.",
    renderContent: () => <CardsPage />,
  },
  {
    id: "growth",
    headline: "Watch Your\nMoney Grow",
    subtitle: "Spend, save, and grow their money all\ntogether in on place.",
    renderContent: () => <BalancePage />,
  },
];

// ─── Root screen ──────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View style={[root.container, { backgroundColor: GRAY_BG }]}>
      {/* ── Skip ── */}
      <View style={[root.skipRow, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity style={root.skipBtn} activeOpacity={0.7}>
          <Text style={root.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* ── Slides ── */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={{ width: SW }}>
            <View style={root.illustrationArea}>
              {item.renderContent()}
            </View>
          </View>
        )}
        style={root.flatList}
      />

      {/* ── Bottom white sheet ── */}
      <View style={[root.bottomSheet, { paddingBottom: bottomPad + 24 }]}>
        <Text style={root.headline}>{SLIDES[activeIndex].headline}</Text>
        <Text style={root.subtitle}>{SLIDES[activeIndex].subtitle}</Text>

        {/* Pagination dots */}
        <View style={root.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                root.dot,
                i === activeIndex ? root.dotActive : root.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Get Started */}
        <TouchableOpacity style={root.getStartedBtn} activeOpacity={0.85}>
          <Text style={root.getStartedText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const root = StyleSheet.create({
  container: { flex: 1 },
  skipRow: { paddingHorizontal: 20, marginBottom: 16 },
  skipBtn: {
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderColor: BLACK,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 7,
    backgroundColor: "#FFFFFF",
  },
  skipText: { fontSize: 14, fontFamily: "Inter_500Medium", color: BLACK },
  flatList: { flexGrow: 0 },
  illustrationArea: {
    height: SW * 0.88,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 36,
    alignItems: "center",
  },
  headline: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: BLACK,
    textAlign: "center",
    lineHeight: 38,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#8A8A8A",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 14,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 22,
    marginBottom: 26,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotActive: { backgroundColor: DOT_ON },
  dotInactive: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#C0C0C0",
  },
  getStartedBtn: {
    width: "100%",
    backgroundColor: LIME,
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  getStartedText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: BLACK,
    letterSpacing: 0.1,
  },
});
