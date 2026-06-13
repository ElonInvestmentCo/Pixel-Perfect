import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState, useMemo } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path, Ellipse } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNotifications, type NotificationType } from "@/contexts/NotificationContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* ─── Design tokens ── */
const LIME   = "#d4ff00";
const BLACK  = "#000000";
const INDIGO = "#6366f1";
const GRAY5  = "#6B7280";
const GRAY2  = "#E5E7EB";
const DARK   = "#0D0D0D";

/* ─── SVG icons ── */
function FigmaIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M8 24C10.2091 24 12 22.2091 12 20V16H8C5.79086 16 4 17.7909 4 20C4 22.2091 5.79086 24 8 24Z" fill="#0ACF83"/>
      <Path d="M4 12C4 9.79086 5.79086 8 8 8H12V16H8C5.79086 16 4 14.2091 4 12Z" fill="#A259FF"/>
      <Path d="M4 4C4 1.79086 5.79086 0 8 0H12V8H8C5.79086 8 4 6.20914 4 4Z" fill="#F24E1E"/>
      <Path d="M12 0H16C18.2091 0 20 1.79086 20 4C20 6.20914 18.2091 8 16 8H12V0Z" fill="#FF7262"/>
      <Path d="M20 12C20 14.2091 18.2091 16 16 16C13.7909 16 12 14.2091 12 12C12 9.79086 13.7909 8 16 8C18.2091 8 20 9.79086 20 12Z" fill="#1ABCFE"/>
    </Svg>
  );
}

function MediumIcon() {
  return (
    <Svg width={32} height={18} viewBox="0 0 32 18" fill="black">
      <Path d="M3.6 0C1.61177 0 0 1.61177 0 3.6V14.4C0 16.3882 1.61177 18 3.6 18C5.58823 18 7.2 16.3882 7.2 14.4V3.6C7.2 1.61177 5.58823 0 3.6 0Z"/>
      <Path d="M13.6 0C11.6118 0 10 1.61177 10 3.6V14.4C10 16.3882 11.6118 18 13.6 18C15.5882 18 17.2 16.3882 17.2 14.4V3.6C17.2 1.61177 15.5882 0 13.6 0Z"/>
      <Ellipse cx="25.6" cy="9" rx="3.6" ry="9" fill="black"/>
    </Svg>
  );
}

/* ─── Transactions data ── */
const TRANSACTIONS = [
  {
    id: "1",
    iconBg: "#ede9fe",
    icon: <FigmaIcon />,
    name: "Figma",
    date: "Today, 12:30 PM",
    amount: "-$250.00",
    category: "Subscriptions",
  },
  {
    id: "2",
    iconBg: LIME,
    icon: null,
    name: "Receive from Alex",
    date: "Yesterday, 08:00 AM",
    amount: "+$580.00",
    category: "Money In",
  },
  {
    id: "3",
    iconBg: "#fef3c7",
    icon: <MediumIcon />,
    name: "Medium",
    date: "May 10, 06:00 PM",
    amount: "-$99.00",
    category: "Subscriptions",
  },
] as const;

/* ─── Hero action pill button ── */
function HeroActionButton({
  icon,
  label,
  onPress,
}: {
  icon: "arrow-up" | "arrow-down";
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={h.pill} activeOpacity={0.82} onPress={onPress}>
      <View style={h.pillCircle}>
        <Feather name={icon} size={14} color={BLACK} />
      </View>
      <Text style={h.pillLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ─── Hero more button ── */
function HeroMoreButton() {
  return (
    <TouchableOpacity style={h.moreBtn} activeOpacity={0.82}>
      <View style={h.moreBtnInner}>
        <Feather name="menu" size={15} color={BLACK} />
      </View>
    </TouchableOpacity>
  );
}

/* ─── Hero card ── */
function HeroCard({
  insets,
  onLayout,
  onBellPress,
  greeting,
}: {
  insets:       { top: number };
  onLayout:     (height: number) => void;
  onBellPress?: () => void;
  greeting:     string;
}) {
  const [balanceVisible, setBalanceVisible] = useState(true);

  return (
    <View
      style={[h.card, { paddingTop: insets.top + 14 }]}
      onLayout={(e) => onLayout(e.nativeEvent.layout.height)}
    >
      {/* World map watermark inside hero */}
      <Image
        source={require("../../assets/images/world-map.png")}
        style={h.mapWatermark}
        resizeMode="contain"
      />

      {/* Subtle gradient overlay for depth */}
      <LinearGradient
        colors={["rgba(180,255,0,0.07)", "transparent"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Profile row */}
      <View style={h.profileRow}>
        <LinearGradient
          colors={["#D1D5DB", "#9CA3AF"]}
          style={h.avatar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={h.hiText}>Hi, Jennifer 👋</Text>
          <Text style={h.morningText}>{greeting}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.75}
          style={h.bellWrap}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={onBellPress}
        >
          <View style={h.bellBg}>
            <Feather name="bell" size={20} color="#FFFFFF" />
          </View>
          <View style={h.bellDot} />
        </TouchableOpacity>
      </View>

      {/* Balance label */}
      <View style={h.labelRow}>
        <Text style={h.labelText}>Total Balance</Text>
        <TouchableOpacity
          onPress={() => setBalanceVisible((v) => !v)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.6}
        >
          <Feather
            name={balanceVisible ? "eye" : "eye-off"}
            size={16}
            color="rgba(255,255,255,0.45)"
          />
        </TouchableOpacity>
      </View>

      {/* Balance amount */}
      <Text style={h.amount}>
        {balanceVisible ? "$12,765.00" : "• • • • • • •"}
      </Text>

      {/* Action buttons */}
      <View style={h.actionRow}>
        <HeroActionButton icon="arrow-up" label="Topup" onPress={() => router.push("/(app)/airtime")} />
        <HeroActionButton icon="arrow-down" label="Withdraw" />
        <HeroMoreButton />
      </View>
    </View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12)  return "Good Morning!";
  if (hour >= 12 && hour < 17) return "Good Afternoon!";
  return "Good Evening!";
}

/* ─── Screen ── */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [heroHeight, setHeroHeight] = useState(insets.top + 268);
  const { triggerTestNotification } = useNotifications();
  const notifTypeRef = useRef<NotificationType>("transfer");
  const greeting = useMemo(() => getGreeting(), []);

  function handleBellPress() {
    triggerTestNotification(notifTypeRef.current);
    notifTypeRef.current = notifTypeRef.current === "transfer" ? "card" : "transfer";
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F4F6" }}>
      {/* World map background for content area */}
      <Image
        source={require("../../assets/images/world-map.png")}
        style={s.worldMap}
        resizeMode="contain"
      />

      {/* Full-width hero header — fixed above scroll */}
      <HeroCard insets={insets} onLayout={setHeroHeight} onBellPress={handleBellPress} greeting={greeting} />

      {/* Scrollable content — sits beneath the hero */}
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          {
            paddingTop: heroHeight + 28,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Transactions */}
        <View style={s.txHeader}>
          <Text style={s.txTitle}>Transactions</Text>
          <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={s.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={s.txList}>
          {TRANSACTIONS.map((tx) => (
            <TouchableOpacity key={tx.id} style={s.txCard} activeOpacity={0.7}>
              <View style={[s.txIconWrap, { backgroundColor: tx.iconBg }]}>
                {tx.icon ? (
                  tx.icon
                ) : (
                  <Feather name="arrow-down" size={24} color={BLACK} />
                )}
              </View>
              <View style={s.txInfo}>
                <Text style={s.txName}>{tx.name}</Text>
                <Text style={s.txDate}>{tx.date}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={s.txAmount}>{tx.amount}</Text>
                <Text style={s.txCat}>{tx.category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/* ─── Hero styles ── */
const h = StyleSheet.create({
  card: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: DARK,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingHorizontal: 24,
    paddingBottom: 30,
    overflow: "hidden",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 14,
  },
  mapWatermark: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.56,
    top: 30,
    left: 0,
    opacity: 0.09,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 26,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  hiText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    lineHeight: 24,
  },
  morningText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
    marginTop: 2,
  },
  bellWrap: {
    position: "relative",
  },
  bellBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  bellDot: {
    position: "absolute",
    top: 5,
    right: 4,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: DARK,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  labelText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.2,
  },
  amount: {
    fontSize: 44,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -1.5,
    marginBottom: 26,
    lineHeight: 54,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: LIME,
    borderRadius: 999,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 8,
    paddingRight: 18,
    shadowColor: LIME,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  pillCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  pillLabel: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: BLACK,
    lineHeight: 18,
  },
  moreBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: LIME,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    shadowColor: LIME,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  moreBtnInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});

/* ─── Screen styles ── */
const s = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },

  worldMap: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.6,
    top: "45%",
    left: 0,
    opacity: 0.07,
    zIndex: 0,
  },

  txHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  txTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: BLACK },
  seeAll: { fontSize: 15, fontFamily: "Inter_500Medium", color: INDIGO },
  txList: { gap: 12 },
  txCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: GRAY2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  txIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  txInfo: { flex: 1 },
  txName: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: BLACK,
    marginBottom: 2,
  },
  txDate: { fontSize: 14, fontFamily: "Inter_400Regular", color: GRAY5 },
  txAmount: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: BLACK },
  txCat: { fontSize: 14, fontFamily: "Inter_400Regular", color: GRAY5 },
});
