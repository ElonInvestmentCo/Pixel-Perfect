import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { OC, OF, OS } from "@/components/onboarding/tokens";

interface ConfirmModalProps {
  visible:       boolean;
  title:         string;
  message:       string;
  confirmLabel?: string;
  cancelLabel?:  string;
  destructive?:  boolean;
  loading?:      boolean;
  onConfirm:     () => void;
  onCancel:      () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel  = "Cancel",
  destructive  = false,
  loading      = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const scaleAnim   = useRef(new Animated.Value(0.92)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim,   { toValue: 1, useNativeDriver: true, tension: 130, friction: 8 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.92);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable style={s.overlay} onPress={loading ? undefined : onCancel}>
        <Animated.View
          style={[s.card, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}
        >
          <Pressable onPress={() => {}}>

            <View style={[s.iconWrap, destructive && s.iconWrapDestructive]}>
              <Feather
                name={destructive ? "log-out" : "help-circle"}
                size={26}
                color={destructive ? OC.error : OC.indigo}
              />
            </View>

            <Text style={s.title}>{title}</Text>
            <Text style={s.message}>{message}</Text>

            <View style={s.row}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={onCancel}
                disabled={loading}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={cancelLabel}
              >
                <Text style={s.cancelLabel}>{cancelLabel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  s.confirmBtn,
                  destructive && s.confirmDestructive,
                  loading    && s.btnDisabled,
                ]}
                onPress={onConfirm}
                disabled={loading}
                activeOpacity={0.82}
                accessibilityRole="button"
                accessibilityLabel={confirmLabel}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={destructive ? OC.error : OC.limeText} />
                ) : (
                  <Text style={[s.confirmLabel, destructive && s.confirmLabelDestructive]}>
                    {confirmLabel}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex:              1,
    backgroundColor:   "rgba(0,0,0,0.50)",
    alignItems:        "center",
    justifyContent:    "center",
    paddingHorizontal: 28,
  },
  card: {
    width:             "100%",
    backgroundColor:   OC.bg,
    borderRadius:      24,
    paddingHorizontal: 24,
    paddingTop:        28,
    paddingBottom:     24,
    alignItems:        "center",
    shadowColor:       "#000",
    shadowOffset:      { width: 0, height: 12 },
    shadowOpacity:     0.18,
    shadowRadius:      24,
    elevation:         16,
  },
  iconWrap: {
    width:           60,
    height:          60,
    borderRadius:    30,
    backgroundColor: "#EEF2FF",
    alignItems:      "center",
    justifyContent:  "center",
    alignSelf:       "center",
    marginBottom:    16,
  },
  iconWrapDestructive: {
    backgroundColor: "#FEF2F2",
  },
  title: {
    fontSize:     19,
    fontFamily:   OF.bold,
    color:        OC.black,
    textAlign:    "center",
    marginBottom: 8,
  },
  message: {
    fontSize:     14,
    fontFamily:   OF.regular,
    color:        OC.muted,
    textAlign:    "center",
    lineHeight:   21,
    marginBottom: 28,
  },
  row: {
    flexDirection: "row",
    gap:           12,
    width:         "100%",
  },
  cancelBtn: {
    flex:            1,
    height:          OS.ctaH,
    borderRadius:    OS.ctaR,
    alignItems:      "center",
    justifyContent:  "center",
    backgroundColor: OC.bg,
    borderWidth:     1,
    borderColor:     OC.borderLight,
  },
  cancelLabel: {
    fontSize:   15,
    fontFamily: OF.semibold,
    color:      OC.black,
  },
  confirmBtn: {
    flex:            1,
    height:          OS.ctaH,
    borderRadius:    OS.ctaR,
    alignItems:      "center",
    justifyContent:  "center",
    backgroundColor: OC.lime,
    shadowColor:     OC.lime,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.4,
    shadowRadius:    12,
    elevation:       5,
  },
  confirmDestructive: {
    backgroundColor: "#FEF2F2",
    borderWidth:     1,
    borderColor:     "#FECACA",
    shadowColor:     "transparent",
    elevation:       0,
  },
  btnDisabled: { opacity: 0.6 },
  confirmLabel: {
    fontSize:   15,
    fontFamily: OF.semibold,
    color:      OC.limeText,
  },
  confirmLabelDestructive: {
    color: OC.error,
  },
});
