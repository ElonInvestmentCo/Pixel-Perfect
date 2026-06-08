import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Modal,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LIME  = "#C8FF00";
const BLACK = "#1A1A1A";
const INDIGO = "#4F46E5";

// ─── Simple QR visual ─────────────────────────────────────────────────────────
function QRCodeView() {
  const CELL = 8;
  const SIZE = 22;

  const pattern: number[][] = [
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

  return (
    <View style={qr.outer}>
      {pattern.map((row, ri) => (
        <View key={ri} style={qr.row}>
          {row.map((cell, ci) => (
            <View
              key={ci}
              style={[
                qr.cell,
                { width: CELL, height: CELL },
                cell === 1 ? qr.black : qr.white,
              ]}
            />
          ))}
        </View>
      ))}
      {/* Lime center badge */}
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
    padding: 12,
    borderRadius: 12,
    position: "relative",
    alignItems: "center",
  },
  row:   { flexDirection: "row" },
  cell:  { },
  black: { backgroundColor: "#1A1A1A" },
  white: { backgroundColor: "#FFFFFF" },
  badge: {
    position: "absolute", top: "38%", left: "35%",
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: LIME, alignItems: "center", justifyContent: "center",
  },
  badgeText: { fontSize: 13, fontFamily: "Inter_700Bold", color: INDIGO },
});

// ─── My QR Code Modal ─────────────────────────────────────────────────────────
function MyQRModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  const handleShare = useCallback(async () => {
    try {
      await Share.share({ message: "Use my PayVora referral code: R47865BM" });
    } catch {}
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={m.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[m.sheet, { paddingBottom: insets.bottom + 24 }]}>
          {/* Header */}
          <View style={m.header}>
            <Text style={m.title}>My QR Code</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* QR code */}
          <View style={m.qrWrap}>
            <QRCodeView />
          </View>

          <Text style={m.hint}>Show and scan this QR code{"\n"}to start transactions</Text>

          {/* Share button */}
          <TouchableOpacity style={m.shareBtn} activeOpacity={0.85} onPress={handleShare}>
            <Text style={m.shareBtnText}>Share Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const m = StyleSheet.create({
  overlay: {
    flex: 1, justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 24,
  },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 28,
  },
  title: { fontSize: 20, fontFamily: "Inter_700Bold", color: BLACK },

  qrWrap: { alignItems: "center", marginBottom: 20 },

  hint: {
    fontSize: 13, fontFamily: "Inter_400Regular", color: "#888888",
    textAlign: "center", lineHeight: 20, marginBottom: 28,
  },
  shareBtn: {
    backgroundColor: LIME, borderRadius: 16, height: 56,
    alignItems: "center", justifyContent: "center",
  },
  shareBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: BLACK },
});

// ─── Scan Screen ──────────────────────────────────────────────────────────────
export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const [myCodeOpen, setMyCodeOpen] = useState(false);

  return (
    <View style={s.root}>
      {/* Status bar area */}
      <View style={{ height: insets.top }} />

      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity
          style={s.closeBtn}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Feather name="x" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Phone / QR frame illustration */}
      <View style={s.frameArea}>
        <View style={s.phoneMock}>
          {/* Simulate scanning another phone showing QR */}
          <View style={s.phoneMockScreen}>
            <View style={s.phoneMockHeader}>
              <Text style={s.phoneMockHeaderText}>My QR Code</Text>
              <Feather name="x" size={12} color="#999" />
            </View>
            <View style={s.miniQrArea}>
              <View style={s.miniQrGrid}>
                {[0,1,2,3,4].map(r => (
                  <View key={r} style={{ flexDirection: "row" }}>
                    {[0,1,2,3,4].map(c => (
                      <View
                        key={c}
                        style={{
                          width: 14, height: 14,
                          backgroundColor: (r===0||r===4||c===0||c===4) ? "#1A1A1A"
                            : (r===2&&c===2) ? "#1A1A1A" : "#FFFFFF",
                        }}
                      />
                    ))}
                  </View>
                ))}
              </View>
              <View style={s.miniQrBadge}>
                <Text style={s.miniQrBadgeText}>R.</Text>
              </View>
            </View>
            <Text style={s.miniShareBtn}>Share Code</Text>
          </View>
          {/* Phone home bar */}
          <View style={s.phoneBar} />
        </View>
      </View>

      {/* Bottom controls */}
      <View style={[s.controls, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={s.sideBtn} activeOpacity={0.7}>
          <Feather name="image" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={s.myCodeBtn}
          activeOpacity={0.85}
          onPress={() => setMyCodeOpen(true)}
        >
          <Feather name="grid" size={18} color={BLACK} />
          <Text style={s.myCodeText}>My Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.sideBtn} activeOpacity={0.7}>
          <Feather name="zap" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <MyQRModal visible={myCodeOpen} onClose={() => setMyCodeOpen(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#111827" },

  topBar: {
    paddingHorizontal: 20, paddingBottom: 12,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },

  frameArea: {
    flex: 1, alignItems: "center", justifyContent: "center",
  },

  phoneMock: {
    width: 200, height: 340, borderRadius: 24,
    backgroundColor: "#1F2937",
    borderWidth: 6, borderColor: "#374151",
    overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 30, shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  phoneMockScreen: {
    flex: 1, backgroundColor: "#FFFFFF", padding: 12,
    alignItems: "center",
  },
  phoneMockHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    width: "100%", marginBottom: 12,
  },
  phoneMockHeaderText: { fontSize: 11, fontFamily: "Inter_700Bold", color: BLACK },

  miniQrArea: { position: "relative", alignItems: "center", marginBottom: 8 },
  miniQrGrid: { borderWidth: 1, borderColor: "#E5E5E5" },
  miniQrBadge: {
    position: "absolute", top: "30%", left: "30%",
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: LIME, alignItems: "center", justifyContent: "center",
  },
  miniQrBadgeText: { fontSize: 7, fontFamily: "Inter_700Bold", color: INDIGO },

  miniShareBtn: {
    marginTop: 8, fontSize: 9, fontFamily: "Inter_700Bold", color: BLACK,
    backgroundColor: LIME, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6,
  },

  phoneBar: {
    height: 5, backgroundColor: "#374151",
    marginHorizontal: 60, marginBottom: 6,
    borderRadius: 3,
  },

  controls: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 40, paddingTop: 24,
  },
  sideBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  myCodeBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: LIME, borderRadius: 50,
    paddingVertical: 14, paddingHorizontal: 24,
  },
  myCodeText: { fontSize: 15, fontFamily: "Inter_700Bold", color: BLACK },
});
