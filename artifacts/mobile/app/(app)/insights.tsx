import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLACK = "#1A1A1A";
const GRAY  = "#9CA3AF";
const LIME  = "#C8FF00";

const MONTHLY = [
  { month: "Jan", spent: 1200 },
  { month: "Feb", spent: 980 },
  { month: "Mar", spent: 1450 },
  { month: "Apr", spent: 860 },
  { month: "May", spent: 1640 },
  { month: "Jun", spent: 1100 },
];

const CATEGORIES = [
  { label: "Subscriptions", amount: "$349", pct: 28, color: "#5B3EFF" },
  { label: "Food & Drink",  amount: "$620", pct: 48, color: LIME },
  { label: "Transport",     amount: "$180", pct: 14, color: "#FF7262" },
  { label: "Shopping",      amount: "$130", pct: 10, color: "#1ABCFE" },
];

const CHART_W  = 320;
const CHART_H  = 140;
const BAR_W    = 28;
const MAX_VAL  = Math.max(...MONTHLY.map((d) => d.spent));
const BAR_AREA = CHART_H - 24;

function BarChart() {
  const colW = CHART_W / MONTHLY.length;

  return (
    <Svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
      {MONTHLY.map((d, i) => {
        const barH  = Math.round((d.spent / MAX_VAL) * BAR_AREA);
        const x     = i * colW + (colW - BAR_W) / 2;
        const y     = BAR_AREA - barH;
        return (
          <React.Fragment key={d.month}>
            <Rect
              x={x} y={y} width={BAR_W} height={barH}
              fill={LIME} rx={6} ry={6}
            />
            <SvgText
              x={x + BAR_W / 2} y={CHART_H - 4}
              textAnchor="middle" fontSize={12} fill={GRAY}
              fontFamily="Inter_400Regular"
            >
              {d.month}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Title ── */}
        <View style={s.titleRow}>
          <Text style={s.title}>Insights</Text>
          <Text style={s.subtitle}>June 2026</Text>
        </View>

        {/* ── Monthly spending chart ── */}
        <View style={s.chartCard}>
          <Text style={s.cardLabel}>Monthly Spending</Text>
          <Text style={s.chartTotal}>$6,230</Text>
          <BarChart />
        </View>

        {/* ── Categories ── */}
        <View style={s.catSection}>
          <Text style={s.catTitle}>By Category</Text>
          <View style={s.catList}>
            {CATEGORIES.map((cat) => (
              <View key={cat.label} style={s.catRow}>
                <View style={s.catLabelRow}>
                  <Text style={s.catLabel}>{cat.label}</Text>
                  <Text style={s.catAmount}>{cat.amount}</Text>
                </View>
                <View style={s.trackBg}>
                  <View style={[s.trackFill, { width: `${cat.pct}%`, backgroundColor: cat.color }]} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },

  titleRow:  { marginBottom: 16 },
  title:     { fontSize: 22, fontFamily: "Inter_700Bold", color: BLACK, letterSpacing: -0.4 },
  subtitle:  { fontSize: 13, fontFamily: "Inter_400Regular", color: GRAY, marginTop: 4 },

  chartCard: {
    backgroundColor: "#FAFAFA", borderRadius: 20,
    padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.05)",
  },
  cardLabel:  { fontSize: 13, fontFamily: "Inter_400Regular", color: GRAY, marginBottom: 4 },
  chartTotal: { fontSize: 28, fontFamily: "Inter_700Bold", color: BLACK, marginBottom: 16, letterSpacing: -0.5 },

  catSection: {},
  catTitle:   { fontSize: 18, fontFamily: "Inter_700Bold", color: BLACK, marginBottom: 16 },
  catList:    { gap: 16 },
  catRow:     {},
  catLabelRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 8,
  },
  catLabel:   { fontSize: 14, fontFamily: "Inter_500Medium", color: BLACK },
  catAmount:  { fontSize: 14, fontFamily: "Inter_700Bold", color: BLACK },
  trackBg:    { height: 8, backgroundColor: "#F3F4F6", borderRadius: 4, overflow: "hidden" },
  trackFill:  { height: "100%", borderRadius: 4 },
});
