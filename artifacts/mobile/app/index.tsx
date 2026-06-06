import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Top section ── */}
      <View style={[styles.topSection, { paddingTop: topPad + 12 }]}>
        {/* Skip button */}
        <TouchableOpacity style={styles.skipBtn} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Decorative circle + balance card */}
        <View style={styles.cardWrapper}>
          {/* Background decorative circle */}
          <View style={styles.decorCircle} />

          {/* Balance card */}
          <View style={styles.balanceCard}>
            {/* Label row */}
            <View style={styles.labelRow}>
              <Text style={styles.labelText}>Total Balance</Text>
              <Feather name="eye" size={16} color="#8A8A8A" style={{ marginLeft: 6 }} />
            </View>

            {/* Amount */}
            <Text style={styles.amountText}>$12,765.00</Text>

            {/* Action buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionPill} activeOpacity={0.8}>
                <View style={styles.actionIconCircle}>
                  <Feather name="arrow-up" size={14} color="#1A1A1A" />
                </View>
                <Text style={styles.actionText}>Transfer</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionPill, { marginLeft: 10 }]} activeOpacity={0.8}>
                <View style={styles.actionIconCircle}>
                  <Feather name="arrow-down" size={14} color="#1A1A1A" />
                </View>
                <Text style={styles.actionText}>Receive</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.menuCircle, { marginLeft: 10 }]} activeOpacity={0.8}>
                <Feather name="menu" size={16} color="#1A1A1A" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* ── Bottom white sheet ── */}
      <View style={[styles.bottomSheet, { paddingBottom: bottomPad + 24 }]}>
        <Text style={styles.headline}>
          {"The Modern Way\nYour Money"}
        </Text>
        <Text style={styles.subtitle}>
          Spend, save, and grow their money all{"\n"}together in on place.
        </Text>

        {/* Pagination dots */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotInactive]} />
          <View style={[styles.dot, styles.dotInactive]} />
        </View>

        {/* Get Started button */}
        <TouchableOpacity style={styles.getStartedBtn} activeOpacity={0.85}>
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>

        {/* Home indicator bar */}
        {Platform.OS !== "web" && (
          <View style={[styles.homeIndicator, { marginTop: bottomPad > 0 ? 8 : 20 }]} />
        )}
      </View>
    </View>
  );
}

const LIME = "#C8FF00";
const BLACK = "#1A1A1A";

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  /* ── Top section ── */
  topSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  skipBtn: {
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderColor: BLACK,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 7,
    backgroundColor: "#FFFFFF",
  },
  skipText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: BLACK,
  },

  /* Decorative circle */
  cardWrapper: {
    alignItems: "center",
    marginTop: 28,
    position: "relative",
  },
  decorCircle: {
    position: "absolute",
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.75,
    borderRadius: SCREEN_WIDTH * 0.375,
    backgroundColor: "#E0E0E0",
    top: -SCREEN_WIDTH * 0.12,
    alignSelf: "center",
  },

  /* Balance card */
  balanceCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#D8D8D8",
    padding: 20,
    zIndex: 2,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelText: {
    fontSize: 13,
    color: "#8A8A8A",
    fontFamily: "Inter_400Regular",
  },
  amountText: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: BLACK,
    marginTop: 6,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
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
    backgroundColor: "transparent",
  },
  actionText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: BLACK,
  },
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

  /* ── Bottom sheet ── */
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 40,
    alignItems: "center",
    minHeight: SCREEN_HEIGHT * 0.42,
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
    marginTop: 24,
    marginBottom: 28,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: "#4338CA",
    width: 10,
    height: 10,
  },
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
  homeIndicator: {
    width: 120,
    height: 4,
    backgroundColor: BLACK,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 20,
  },
});
