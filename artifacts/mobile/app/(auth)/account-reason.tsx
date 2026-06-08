import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import {
  OC,
  OF,
  OnboardingHeader,
  OnboardingLayout,
  PrimaryButton,
} from "@/components/onboarding";

const INDIGO = "#4F46E5";

const OPTIONS = [
  { id: "short-term", label: "Short-term Saving" },
  { id: "long-term",  label: "Long-term Saving" },
  { id: "everyday",  label: "Everyday Spending" },
  { id: "transfer",  label: "Transfer Security Found" },
] as const;

type OptionId = (typeof OPTIONS)[number]["id"];

export default function AccountReasonScreen() {
  const [selected, setSelected] = useState<OptionId | null>(null);

  const handleSelect   = useCallback((id: OptionId) => setSelected(id), []);
  const handleContinue = useCallback(() => {
    if (!selected) return;
    router.push("/identity-upload");
  }, [selected]);

  return (
    <OnboardingLayout
      footer={
        <PrimaryButton
          label="Continue"
          onPress={handleContinue}
          disabled={!selected}
        />
      }
    >
      <OnboardingHeader
        onClose={() => router.back()}
        title={`Main reason for\nopening this account?`}
        titleLarge
        subtitle={`This is required to deposit account\nin Singapore`}
        progress={{ step: 3, total: 4 }}
      />

      {/* Selection cards */}
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
              {/* Radio circle */}
              <View style={[s.radio, isSelected && s.radioSelected]}>
                {isSelected && <Feather name="check" size={13} color={INDIGO} />}
              </View>

              <Text style={[s.cardLabel, isSelected && s.cardLabelSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}

const s = StyleSheet.create({
  optionsWrap: { gap: 12 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: OC.fieldBg,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 22,
    gap: 14,
  },
  cardSelected: { backgroundColor: INDIGO },

  radio: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: "#CCCCCC",
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  radioSelected: { backgroundColor: "#FFFFFF", borderColor: "#FFFFFF" },

  cardLabel: {
    fontSize: 16, fontFamily: OF.medium,
    color: OC.black, flex: 1,
  },
  cardLabelSelected: {
    color: "#FFFFFF", fontFamily: OF.bold,
  },
});
