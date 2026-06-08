import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ─── Design tokens ────────────────────────────────────────────── */
const LIME  = "#C8FF00";
const BLACK = "#1A1A1A";
const INDIGO = "#4F46E5";
const NAVY  = "#0D1421";

/* ─── QR code pattern ─────────────────────────────────────────── */
const PATTERN: number[][] = [
  [1,1,1,1,1,1,1,0,1,0,1,0,0,0,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,0,1,0,0,0,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,0],
  [1,0,1,1,0,1,1,1,0,0,1,0,1,1,1,0,1,1,0,1,1],
  [0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0],
  [1,0,1,0,1,1,0,1,0,0,1,0,1,0,1,0,1,0,0,1,0],
  [0,1,0,1,0,0,0,1,1,0,0,1,0,1,0,0,0,1,1,0,1],
  [1,0,0,0,1,0,1,0,0,1,1,0,1,0,1,1,0,0,0,1,0],
  [0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,1,1,0,0,1],
  [1,1,1,1,1,1,1,0,0,1,0,0,1,0,1,0,0,1,1,0,0],
  [1,0,0,0,0,0,1,0,1,0,1,0,0,1,0,1,0,0,0,1,0],
  [1,0,1,1,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,0,1],
  [1,0,1,1,1,0,1,0,1,0,0,1,0,0,0,1,0,0,1,0,0],
  [1,0,1,1,1,0,1,0,0,1,1,0,1,1,1,0,1,0,0,1,1],
  [1,0,0,0,0,0,1,0,1,0,0,1,0,0,0,1,0,1,0,0,0],
  [1,1,1,1,1,1,1,0,0,1,1,0,1,0,1,0,1,0,1,1,0],
];

function QRCodeView() {
  const CELL = 8;
  return (
    <View style={qr.outer}>
      {PATTERN.map((row, ri) => (
        <View key={ri} style={{ flexDirection: "row" }}>
          {row.map((cell, ci) => (
            <View
              key={ci}
              style={[
                { width: CELL, height: CELL },
                cell === 1 ? qr.dark : qr.light,
              ]}
            />
          ))}
        </View>
      ))}
      <View style={qr.badge}>
        <Text style={qr.badgeText}>R.</Text>
      </View>
    </View>
  );
}

const qr = StyleSheet.create({
  outer: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 6,
    position: "relative",
    alignItems: "center",
  },
  dark:  { backgroundColor: BLACK },
  light: { backgroundColor: "#FFFFFF" },
  badge: {
    position: "absolute", top: "35%", left: "35%",
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: LIME,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2.5, borderColor: "#FFFFFF",
  },
  badgeText: { fontSize: 11, fontFamily: "Inter_700Bold", color: INDIGO },
});

/* ─── Scanner viewfinder frame ─────────────────────────────────── */
function ScannerFrame() {
  return (
    <View style={sf.container}>
      <View style={[sf.corner, sf.tl]} />
      <View style={[sf.corner, sf.tr]} />
      <View style={[sf.corner, sf.bl]} />
      <View style={[sf.corner, sf.br]} />
      <Text style={sf.hint}>Align QR code within the frame</Text>
    </View>
  );
}

const FRAME = 240;
const sf = StyleSheet.create({
  container: {
    width: FRAME, height: FRAME, position: "relative",
    alignItems: "center", justifyContent: "center",
  },
  corner: {
    position: "absolute", width: 40, height: 40,
    borderColor: LIME, borderWidth: 3,
  },
  tl: { top: 0,    left: 0,   borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 10 },
  tr: { top: 0,    right: 0,  borderLeftWidth: 0,  borderBottomWidth: 0, borderTopRightRadius: 10 },
  bl: { bottom: 0, left: 0,   borderRightWidth: 0, borderTopWidth: 0,    borderBottomLeftRadius: 10 },
  br: { bottom: 0, right: 0,  borderLeftWidth: 0,  borderTopWidth: 0,    borderBottomRightRadius: 10 },
  hint: {
    position: "absolute", bottom: -36,
    fontSize: 13, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)", textAlign: "center",
  },
});

/* ─── My QR Code card ──────────────────────────────────────────── */
function MyQRCard({
  anim,
  onClose,
  onShare,
}: {
  anim: Animated.Value;
  onClose: () => void;
  onShare: () => void;
}) {
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] });

  return (
    <Animated.View
      pointerEvents={undefined}
      style={[
        card.wrap,
        {
          opacity: anim,
          transform: [{ scale }],
        },
      ]}
    >
      {/* Card header */}
      <View style={card.header}>
        <Text style={card.title}>My QR Code</Text>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.65}
        >
          <Feather name="x" size={22} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* QR code */}
      <View style={card.qrArea}>
        <QRCodeView />
        <Text style={card.uid}>PayVora · R47865BM</Text>
      </View>

      {/* Share button */}
      <TouchableOpacity style={card.shareBtn} activeOpacity={0.85} onPress={onShare}>
        <Feather name="share-2" size={18} color={BLACK} style={{ marginRight: 8 }} />
        <Text style={card.shareBtnText}>Share Code</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const card = StyleSheet.create({
  wrap: {
    marginHorizontal: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 28,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 20,
  },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 28,
  },
  title: { fontSize: 20, fontFamily: "Inter_700Bold", color: BLACK },
  qrArea: { alignItems: "center", marginBottom: 28 },
  uid: {
    marginTop: 14, fontSize: 13, fontFamily: "Inter_500Medium",
    color: "#9CA3AF", letterSpacing: 0.3,
  },
  shareBtn: {
    backgroundColor: LIME, borderRadius: 16, height: 56,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
  },
  shareBtnText: { fontSize: 17, fontFamily: "Inter_700Bold", color: BLACK },
});

/* ─── Main screen ──────────────────────────────────────────────── */
type ViewMode = "scan" | "mycode";

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<ViewMode>("scan");
  const [flashOn, setFlashOn] = useState(false);

  /* Animated value: 0 = scan, 1 = mycode */
  const cardAnim = useRef(new Animated.Value(0)).current;

  const switchTo = useCallback((next: ViewMode) => {
    if (next === "mycode") {
      setMode("mycode");
      Animated.spring(cardAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
    } else {
      Animated.timing(cardAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(() => setMode("scan"));
    }
  }, [cardAnim]);

  /* Close / X: if in mycode → go to scan; if in scan → navigate back */
  const handleClose = useCallback(() => {
    if (mode === "mycode") {
      switchTo("scan");
    } else {
      router.back();
    }
  }, [mode, switchTo]);

  /* Share native sheet */
  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: "Pay me on PayVora — my QR code: R47865BM",
        title: "My PayVora QR Code",
      });
    } catch {}
  }, []);

  /* Gallery picker */
  const handleGallery = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      /* In a real app you'd parse the selected image for QR data here */
    } catch {}
  }, []);

  /* Flash toggle */
  const handleFlash = useCallback(() => {
    setFlashOn((prev) => !prev);
  }, []);

  return (
    <View style={s.root}>
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <View style={[s.topBar, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity
          style={s.closeBtn}
          activeOpacity={0.7}
          onPress={handleClose}
        >
          <Feather name="x" size={17} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
      </View>

      {/* ── Centre area ──────────────────────────────────────────── */}
      <View style={s.centre}>
        {/* Scanner frame — always rendered; fades when mycode is shown */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { alignItems: "center", justifyContent: "center" },
            {
              opacity: cardAnim.interpolate({
                inputRange: [0, 0.5],
                outputRange: [1, 0],
                extrapolate: "clamp",
              }),
            },
          ]}
          pointerEvents={mode === "scan" ? "auto" : "none"}
        >
          <ScannerFrame />
        </Animated.View>

        {/* My QR Code card — shown in mycode mode */}
        {(mode === "mycode" || (cardAnim as any)._value > 0) && (
          <MyQRCard
            anim={cardAnim}
            onClose={() => switchTo("scan")}
            onShare={handleShare}
          />
        )}
      </View>

      {/* ── Bottom controls ──────────────────────────────────────── */}
      <View style={[s.controls, { paddingBottom: insets.bottom + 20 }]}>

        {/* Gallery */}
        <TouchableOpacity
          style={s.sideBtn}
          activeOpacity={0.7}
          onPress={handleGallery}
        >
          <Feather name="image" size={22} color="rgba(255,255,255,0.75)" />
        </TouchableOpacity>

        {/* Scan / My Code toggle pill */}
        <View style={s.togglePill}>
          <TouchableOpacity
            style={[s.toggleTab, mode === "scan" && s.toggleTabActive]}
            activeOpacity={0.75}
            onPress={() => switchTo("scan")}
          >
            <Feather
              name="maximize"
              size={15}
              color={mode === "scan" ? BLACK : "rgba(255,255,255,0.6)"}
            />
            <Text style={[s.toggleTabText, mode === "scan" && s.toggleTabTextActive]}>
              Scan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.toggleTab, mode === "mycode" && s.toggleTabActive]}
            activeOpacity={0.75}
            onPress={() => switchTo("mycode")}
          >
            <Feather
              name="grid"
              size={15}
              color={mode === "mycode" ? BLACK : "rgba(255,255,255,0.6)"}
            />
            <Text style={[s.toggleTabText, mode === "mycode" && s.toggleTabTextActive]}>
              My Code
            </Text>
          </TouchableOpacity>
        </View>

        {/* Flash */}
        <TouchableOpacity
          style={[s.sideBtn, flashOn && s.sideBtnActive]}
          activeOpacity={0.7}
          onPress={handleFlash}
        >
          <Feather
            name="zap"
            size={22}
            color={flashOn ? BLACK : "rgba(255,255,255,0.75)"}
          />
        </TouchableOpacity>

      </View>
    </View>
  );
}

/* ─── Styles ────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: NAVY },

  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center", justifyContent: "center",
  },

  centre: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: 16,
  },

  sideBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center", justifyContent: "center",
  },
  sideBtnActive: {
    backgroundColor: LIME,
  },

  togglePill: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 50,
    padding: 4,
    gap: 4,
  },
  toggleTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 50,
  },
  toggleTabActive: {
    backgroundColor: LIME,
  },
  toggleTabText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.6)",
  },
  toggleTabTextActive: {
    color: BLACK,
  },
});
