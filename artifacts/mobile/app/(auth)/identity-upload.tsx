import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import { router, useNavigation } from "expo-router";
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

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const OPTIONS: { id: string; label: string; icon: IconName }[] = [
  { id: "passport",   label: "Passport",       icon: "passport" },
  { id: "national",   label: "National ID",     icon: "card-account-details" },
  { id: "driver",     label: "Driver License",  icon: "card-account-details-outline" },
];

export default function IdentityUploadScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 55 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const navigation = useNavigation();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = useCallback((id: string) => {
    setSelected(id);
  }, []);

  const handleContinue = useCallback(() => {
    if (!selected) return;
    // getParent() climbs from the (auth) Stack to the root Stack, then resets
    // the root to only the (app) group — completely clearing the auth history.
    const rootNav = navigation.getParent() ?? navigation;
    rootNav.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "(app)" }],
      }),
    );
  }, [selected, navigation]);

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
          Upload a proof of{"\n"}your identity
        </Text>
        <Text style={s.subtitle}>
          Take a picture of yourself and your photo{"\n"}
          ID, so we can make sure you're really you
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
                {/* Icon container */}
                <View style={[s.iconBox, isSelected && s.iconBoxSelected]}>
                  <MaterialCommunityIcons
                    name={opt.icon}
                    size={24}
                    color={isSelected ? BLACK : "#555555"}
                  />
                </View>

                {/* Label */}
                <Text style={[s.cardLabel, isSelected && s.cardLabelSelected]}>
                  {opt.label}
                </Text>

                {/* Radio indicator — RIGHT side */}
                <View style={[s.radio, isSelected && s.radioSelected]}>
                  {isSelected && (
                    <Feather name="check" size={13} color={INDIGO} />
                  )}
                </View>
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
    paddingVertical: 18,
    gap: 14,
  },
  cardSelected: {
    backgroundColor: INDIGO,
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#E8E8E8",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconBoxSelected: {
    backgroundColor: LIME,
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
