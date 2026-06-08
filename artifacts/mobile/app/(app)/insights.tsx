import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLACK  = "#000000";
const LIME   = "#d4ff00";
const GRAY5  = "#6B7280";
const GRAY4  = "#9CA3AF";
const INDIGO = "#6366f1";
const VIOLET = "#7c3aed";
const CYAN   = "#06B6D4";
const ORANGE = "#F97316";

const MONTHLY = [
  { month: "Jan", spent: 1200 },
  { month: "Feb", spent: 980 },
  { month: "Mar", spent: 1450 },
  { month: "Apr", spent: 860 },
  { month: "May", spent: 1640 },
  { month: "Jun", spent: 1100 },
];

const CATEGORIES = [
  { label: "Subscriptions", amount: "$349", pct: 28, color: INDIGO },
  { label: "Food & Drink",  amount: "$620", pct: 48, color: LIME },
  { label: "Transport",     amount: "$180", pct: 14, color: ORANGE },
  { label: "Shopping",      amount: "$130", pct: 10, color: CYAN },
];

const CHART_W  = 340;
const CHART_H  = 160;
const BAR_W    = 30;
const MAX_VAL  = Math.max(...MONTHLY.map((d) => d.spent));
const BAR_AREA = CHART_H - 28;

function BarChart() {
  const colW = CHART_W / MONTHLY.length;
  return (
    <Svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
      {MONTHLY.map((d, i) => {
        const barH = Math.round((d.spent / MAX_VAL) * BAR_AREA);
        const x    = i * colW + (colW - BAR_W) / 2;
        const y    = BAR_AREA - barH;
        return (
          <React.Fragment key={d.month}>
            <Rect x={x} y={y} width={BAR_W} height={barH} fill={LIME} rx={8} ry={8} />
            <SvgText
              x={x + BAR_W / 2} y={CHART_H - 6}
              textAnchor="middle" fontSize={12} fill={GRAY5}
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
        {/* Title */}
        <Text style={s.title}>Insights</Text>
        <Text style={s.subtitle}>June 2026</Text>

        {/* Chart card */}
        <View style={s.chartCard}>
          <Text style={s.cardMeta}>Monthly Spending</Text>
          <Text style={s.chartTotal}>$6,230</Text>
          <BarChart />
        </View>

        {/* Categories */}
        <Text style={s.catTitle}>By Category</Text>
        <View style={s.catList}>
          {CATEGORIES.map((cat) => (
            <View key={cat.label} style={s.catRow}>
              <View style={s.catLabelRow}>
                <Text style={s.catLabel}>{cat.label}</Text>
                <Text style={s.catAmount}>{cat.amount}</Text>
              </View>
              <View style={s.track}>
                <View style={[s.trackFill, { width: `${cat.pct}%`, backgroundColor: cat.color }]} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },

  title:    { fontSize: 24, fontFamily: "Inter_700Bold", color: BLACK },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: GRAY5, marginTop: 4, marginBottom: 20 },

  chartCard: {
    backgroundColor: "#FAFAFA", borderRadius: 20,
    padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: "#F3F4F6",
  },
  cardMeta:   { fontSize: 14, fontFamily: "Inter_400Regular", color: GRAY5, marginBottom: 4 },
  chartTotal: { fontSize: 32, fontFamily: "Inter_700Bold", color: BLACK, marginBottom: 16, letterSpacing: -0.5 },

  catTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: BLACK, marginBottom: 16 },
  catList:  { gap: 16 },
  catRow:   {},
  catLabelRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 8,
  },
  catLabel:  { fontSize: 15, fontFamily: "Inter_500Medium", color: BLACK },
  catAmount: { fontSize: 15, fontFamily: "Inter_700Bold", color: BLACK },
  track:     { height: 8, backgroundColor: "#F3F4F6", borderRadius: 4, overflow: "hidden" },
  trackFill: { height: "100%", borderRadius: 4 },
});
