import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OF, PrimaryButton } from "@/components/onboarding";

const LIME   = "#C8FF00";
const BLACK  = "#1A1A1A";
const INDIGO = "#4F46E5";

const COUNTRIES = [
  { code: "SG", flag: "🇸🇬", name: "Singapore" },
  { code: "US", flag: "🇺🇸", name: "United States" },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "MY", flag: "🇲🇾", name: "Malaysia" },
  { code: "ID", flag: "🇮🇩", name: "Indonesia" },
  { code: "PH", flag: "🇵🇭", name: "Philippines" },
  { code: "IN", flag: "🇮🇳", name: "India" },
  { code: "JP", flag: "🇯🇵", name: "Japan" },
];

export default function CountryResidenceScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected]   = useState(COUNTRIES[0]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleContinue = useCallback(() => {
    router.push("/(auth)/account-reason");
  }, []);

  return (
    <View style={[s.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      {/* Close */}
      <TouchableOpacity style={s.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
        <Feather name="x" size={18} color={BLACK} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={s.title}>Your country of{"\n"}primary residence</Text>
      <Text style={s.subtitle}>
        The terms and services which apply to you{"\n"}will depend on your country of residence
      </Text>

      {/* Country picker row */}
      <Text style={s.fieldLabel}>Country</Text>
      <TouchableOpacity style={s.dropdown} activeOpacity={0.75} onPress={() => setPickerOpen(true)}>
        <Text style={s.flag}>{selected.flag}</Text>
        <Text style={s.countryName}>{selected.name}</Text>
        <Feather name="chevron-down" size={18} color="#888" />
      </TouchableOpacity>

      <View style={{ flex: 1 }} />

      {/* Terms */}
      <Text style={s.terms}>
        By registering, you accept our{" "}
        <Text style={s.link} onPress={() => {}}>Terms of Use</Text>
        {"\n"}and{" "}
        <Text style={s.link} onPress={() => {}}>Privacy Policy</Text>
      </Text>

      <PrimaryButton label="Continue" onPress={handleContinue} style={{ marginTop: 16 }} />

      {/* Country picker modal */}
      <Modal
        visible={pickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={pk.overlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setPickerOpen(false)}
          />
          <View style={[pk.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={pk.handle} />
            <Text style={pk.title}>Select Country</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {COUNTRIES.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={pk.row}
                  activeOpacity={0.7}
                  onPress={() => { setSelected(c); setPickerOpen(false); }}
                >
                  <Text style={pk.rowFlag}>{c.flag}</Text>
                  <Text style={pk.rowName}>{c.name}</Text>
                  {c.code === selected.code && (
                    <Feather name="check" size={16} color={INDIGO} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 24 },

  closeBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#F0F0F0",
    alignItems: "center", justifyContent: "center",
    marginBottom: 32,
  },

  title: {
    fontSize: 30, fontFamily: OF.bold, color: BLACK,
    lineHeight: 36, marginBottom: 12,
  },
  subtitle: {
    fontSize: 14, fontFamily: OF.regular, color: "#888888",
    lineHeight: 21, marginBottom: 32,
  },

  fieldLabel: {
    fontSize: 13, fontFamily: OF.regular, color: "#888888", marginBottom: 10,
  },
  dropdown: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F5F5F5", borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 16, gap: 10,
  },
  flag:        { fontSize: 22 },
  countryName: { flex: 1, fontSize: 16, fontFamily: OF.medium, color: BLACK },

  terms: {
    fontSize: 13, fontFamily: OF.regular, color: "#888888",
    textAlign: "center", lineHeight: 20,
  },
  link: { color: INDIGO, fontFamily: OF.medium },
});

const pk = StyleSheet.create({
  overlay: {
    flex: 1, justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: "70%", paddingTop: 12, paddingHorizontal: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: "#D8D8D8",
    alignSelf: "center", marginBottom: 16,
  },
  title: { fontSize: 17, fontFamily: OF.semibold, color: BLACK, marginBottom: 16 },
  row: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 14, gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#F0F0F0",
  },
  rowFlag: { fontSize: 22 },
  rowName: { flex: 1, fontSize: 15, fontFamily: OF.regular, color: BLACK },
});
