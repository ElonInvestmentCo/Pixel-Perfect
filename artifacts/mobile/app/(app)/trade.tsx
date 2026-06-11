import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLACK  = "#000000";
const LIME   = "#C8FF00";
const GRAY5  = "#6B7280";
const GRAY2  = "#E5E7EB";

const GIFT_CARDS = [
  { id: "amazon",  name: "Amazon",   color: "#FF9900", abbr: "AMZ" },
  { id: "apple",   name: "Apple",    color: "#1C1C1E", abbr: "APL" },
  { id: "google",  name: "Google",   color: "#4285F4", abbr: "GGL" },
  { id: "netflix", name: "Netflix",  color: "#E50914", abbr: "NTF" },
];

const CRYPTOS = [
  { id: "btc",  name: "Bitcoin",  symbol: "BTC",  price: "$67,420", change: "+2.4%", up: true,  color: "#F7931A" },
  { id: "eth",  name: "Ethereum", symbol: "ETH",  price: "$3,512",  change: "+1.8%", up: true,  color: "#627EEA" },
  { id: "usdt", name: "Tether",   symbol: "USDT", price: "$1.00",   change: "0.0%",  up: true,  color: "#26A17B" },
  { id: "sol",  name: "Solana",   symbol: "SOL",  price: "$178",    change: "-0.9%", up: false, color: "#9945FF" },
];

export default function TradeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.screenTitle}>Trade</Text>
            <Text style={s.screenSub}>Gift cards & crypto</Text>
          </View>
          <TouchableOpacity style={s.historyBtn} activeOpacity={0.75}>
            <Feather name="clock" size={20} color={BLACK} />
          </TouchableOpacity>
        </View>

        {/* ── Quick actions ── */}
        <View style={s.quickRow}>
          <TouchableOpacity
            style={[s.quickBtn, { backgroundColor: LIME }]}
            activeOpacity={0.82}
            onPress={() => router.navigate("/buy-gift-card" as any)}
          >
            <Feather name="gift" size={20} color={BLACK} />
            <Text style={[s.quickLabel, { color: BLACK }]}>Buy Gift Card</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.quickBtn, { backgroundColor: "#F3F4F6" }]}
            activeOpacity={0.82}
            onPress={() => router.navigate("/sell-gift-card" as any)}
          >
            <Feather name="tag" size={20} color={BLACK} />
            <Text style={s.quickLabel}>Sell Gift Card</Text>
          </TouchableOpacity>
        </View>

        {/* ── Gift Cards section ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Gift Cards</Text>
          <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={s.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.giftRow}
        >
          {GIFT_CARDS.map((gc) => (
            <TouchableOpacity key={gc.id} style={s.giftCard} activeOpacity={0.8}>
              <View style={[s.giftIconWrap, { backgroundColor: gc.color }]}>
                <Text style={s.giftAbbr}>{gc.abbr}</Text>
              </View>
              <Text style={s.giftName}>{gc.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Crypto section ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Crypto</Text>
          <View style={s.quickCryptoRow}>
            <TouchableOpacity
              style={s.cryptoPill}
              activeOpacity={0.82}
              onPress={() => router.navigate("/buy-crypto" as any)}
            >
              <Feather name="trending-up" size={14} color={BLACK} />
              <Text style={s.cryptoPillLabel}>Buy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.cryptoPill, { backgroundColor: "#F3F4F6" }]}
              activeOpacity={0.82}
              onPress={() => router.navigate("/sell-crypto" as any)}
            >
              <Feather name="trending-down" size={14} color={BLACK} />
              <Text style={s.cryptoPillLabel}>Sell</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.cryptoList}>
          {CRYPTOS.map((coin, idx) => (
            <TouchableOpacity key={coin.id} style={s.cryptoRow} activeOpacity={0.72}>
              <View style={[s.cryptoIcon, { backgroundColor: coin.color }]}>
                <Text style={s.cryptoSymbol}>{coin.symbol[0]}</Text>
              </View>
              <View style={s.cryptoInfo}>
                <Text style={s.cryptoName}>{coin.name}</Text>
                <Text style={s.cryptoTicker}>{coin.symbol}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={s.cryptoPrice}>{coin.price}</Text>
                <Text style={[s.cryptoChange, { color: coin.up ? "#10B981" : "#EF4444" }]}>
                  {coin.change}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },

  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 24,
  },
  screenTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: BLACK, lineHeight: 34 },
  screenSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: GRAY5, marginTop: 2 },
  historyBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center",
  },

  quickRow: { flexDirection: "row", gap: 12, marginBottom: 28 },
  quickBtn: {
    flex: 1, height: 56, borderRadius: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  quickLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: BLACK },

  sectionHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: BLACK },
  seeAll: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#6366F1" },

  giftRow: { gap: 12, paddingBottom: 24 },
  giftCard: {
    width: 100, borderRadius: 20, padding: 16,
    backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: GRAY2,
    alignItems: "center", gap: 10,
  },
  giftIconWrap: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  giftAbbr: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  giftName: { fontSize: 13, fontFamily: "Inter_500Medium", color: BLACK, textAlign: "center" },

  quickCryptoRow: { flexDirection: "row", gap: 8 },
  cryptoPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: LIME, borderRadius: 20,
  },
  cryptoPillLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: BLACK },

  cryptoList: { gap: 4 },
  cryptoRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: "#FFFFFF", borderRadius: 20,
    borderWidth: 1, borderColor: GRAY2,
    marginBottom: 8,
  },
  cryptoIcon: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
  },
  cryptoSymbol: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  cryptoInfo: { flex: 1 },
  cryptoName: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: BLACK },
  cryptoTicker: { fontSize: 13, fontFamily: "Inter_400Regular", color: GRAY5, marginTop: 2 },
  cryptoPrice: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: BLACK },
  cryptoChange: { fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 2 },
});
