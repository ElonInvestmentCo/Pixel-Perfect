import { router } from "expo-router";
import React, { useCallback } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OC, OF, PrimaryButton } from "@/components/onboarding";

const { width: SW, height: SH } = Dimensions.get("window");

export default function UploadSelfieScreen() {
  const insets = useSafeAreaInsets();

  const handleContinue = useCallback(() => {
    router.push("/(auth)/create-pin");
  }, []);

  return (
    <View style={s.root}>
      <Image
        source={require("@/assets/images/screen-upload-selfie.png")}
        style={s.bg}
        resizeMode="cover"
      />
      <View style={[s.footer, { paddingBottom: insets.bottom + 24 }]}>
        <PrimaryButton label="Continue" onPress={handleContinue} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: OC.black },
  bg: { position: "absolute", top: 0, left: 0, width: SW, height: SH },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
});
