import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LIME   = "#C8FF00";
const BLACK  = "#1A1A1A";
const INDIGO = "#4F46E5";

const OPTIONS = [
  { id: "short-term", label: "Short-term Saving" },
  { id: "long-term",  label: "Long-term Saving" },
  { id: "everyday",  label: "Everyday Spending" },
  { id: "transfer",  label: "Transfer Security Found" },
] as const;

type OptionId = (typeof OPTIONS)[number]["id"];

export default function AccountReasonScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 55 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [selected, setSelected] = useState<OptionId | null>(null);

  const handleSelect = useCallback((id: OptionId) => {
    setSelected(id);
  }, []);

  const handleContinue = useCallback(() => {
    if (!selected) return;
    router.push("/identity-upload");
  }, [selected]);

  return (
    <View style={[s.root, { paddingBottom: botPad + 20 }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[s.scroll, { paddingTop: topPad + 14 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Close */}
        <TouchableOpacity
          style={s.closeBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Feather name="x" size={15} color="#888888" />
        </TouchableOpacity>

        {/* Header */}
        <Text style={s.title} accessibilityRole="header">
          Main reason for{"\n"}opening this account?
        </Text>
        <Text style={s.subtitle}>
          This is required to deposit account{"\n"}in Singapore
        </Text>

        {/* Options */}
        <View style={s.optionsWrap}>
          {OPTIONS.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[s.card, isSelected && s.cardSelected]}
                activeOpacity={0.78}
                onPress={() => handleSelect(opt.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={opt.label}
              >
                {/* Radio indicator */}
                <View style={[s.radio, isSelected && s.radioSelected]}>
                  {isSelected && (
                    <Feather name="check" size={13} color={INDIGO} />
                  )}
                </View>

                {/* Label */}
                <Text style={[s.cardLabel, isSelected && s.cardLabelSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Continue CTA — pinned to bottom */}
      <View style={s.ctaWrap}>
        <TouchableOpacity
          style={[s.cta, !selected && s.ctaDim]}
          activeOpacity={0.85}
          disabled={!selected}
          onPress={handleContinue}
          accessibilityRole="button"
          accessibilityLabel="Continue"
          accessibilityState={{ disabled: !selected }}
        >
          <Text style={[s.ctaText, !selected && s.ctaTextDim]}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },

  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: BLACK,
    letterSpacing: -0.5,
    lineHeight: 40,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#888888",
    lineHeight: 22,
    marginBottom: 40,
  },

  optionsWrap: {
    gap: 12,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 22,
    gap: 14,
  },
  cardSelected: {
    backgroundColor: INDIGO,
  },

  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#CCCCCC",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  radioSelected: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },

  cardLabel: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: "#1A1A1A",
    flex: 1,
  },
  cardLabelSelected: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
  },

  ctaWrap: {
    paddingHorizontal: 24,
  },
  cta: {
    backgroundColor: LIME,
    borderRadius: 28,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaDim: {
    backgroundColor: "#E8E8E8",
  },
  ctaText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: BLACK,
  },
  ctaTextDim: {
    color: "#AAAAAA",
  },
});
