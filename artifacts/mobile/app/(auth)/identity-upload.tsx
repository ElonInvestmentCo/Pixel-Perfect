import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import { router, useNavigation } from "expo-router";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import {
  OC,
  OF,
  OnboardingHeader,
  OnboardingLayout,
  PrimaryButton,
} from "@/components/onboarding";

const LIME   = "#C8FF00";
const INDIGO = "#4F46E5";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const OPTIONS: { id: string; label: string; icon: IconName }[] = [
  { id: "passport", label: "Passport",       icon: "passport" },
  { id: "national", label: "National ID",     icon: "card-account-details" },
  { id: "driver",   label: "Driver License",  icon: "card-account-details-outline" },
];

export default function IdentityUploadScreen() {
  const navigation = useNavigation();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = useCallback((id: string) => setSelected(id), []);

  const handleContinue = useCallback(() => {
    if (!selected) return;
    // Climb to root Stack and reset — clears the entire (auth) group history
    const rootNav = navigation.getParent() ?? navigation;
    rootNav.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: "(app)" }] }),
    );
  }, [selected, navigation]);

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
        title={`Upload a proof of\nyour identity`}
        titleLarge
        subtitle={`Take a picture of yourself and your photo\nID, so we can make sure you're really you`}
        progress={{ step: 4, total: 4 }}
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
              {/* Icon box */}
              <View style={[s.iconBox, isSelected && s.iconBoxSelected]}>
                <MaterialCommunityIcons
                  name={opt.icon}
                  size={24}
                  color={isSelected ? OC.black : "#555555"}
                />
              </View>

              <Text style={[s.cardLabel, isSelected && s.cardLabelSelected]}>
                {opt.label}
              </Text>

              {/* Radio — right side */}
              <View style={[s.radio, isSelected && s.radioSelected]}>
                {isSelected && <Feather name="check" size={13} color={INDIGO} />}
              </View>
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
    paddingVertical: 18,
    gap: 14,
  },
  cardSelected: { backgroundColor: INDIGO },

  iconBox: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: "#E8E8E8",
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  iconBoxSelected: { backgroundColor: LIME },

  cardLabel: {
    fontSize: 16, fontFamily: OF.medium,
    color: OC.black, flex: 1,
  },
  cardLabelSelected: {
    color: "#FFFFFF", fontFamily: OF.bold,
  },

  radio: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: "#CCCCCC",
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  radioSelected: { backgroundColor: "#FFFFFF", borderColor: "#FFFFFF" },
});
