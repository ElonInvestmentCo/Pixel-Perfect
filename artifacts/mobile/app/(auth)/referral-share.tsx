import { CommonActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useCallback } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OC, PrimaryButton } from "@/components/onboarding";

const { width: SW, height: SH } = Dimensions.get("window");

export default function ReferralShareScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleFinish = useCallback(() => {
    const rootNav = navigation.getParent() ?? navigation;
    rootNav.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: "(app)" }] }),
    );
  }, [navigation]);

  return (
    <View style={s.root}>
      <Image
        source={require("@/assets/images/screen-referral-share.png")}
        style={s.bg}
        resizeMode="cover"
      />
      <View style={[s.footer, { paddingBottom: insets.bottom + 24 }]}>
        <PrimaryButton label="Get Started" onPress={handleFinish} />
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
