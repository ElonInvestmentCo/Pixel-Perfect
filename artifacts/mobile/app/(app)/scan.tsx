/**
 * Scan / QR Code screen — pixel-perfect reference: IMG_1351
 *
 * Layout (dark navy full screen):
 *  • Top-left: circular X close button
 *  • Centre: phone-frame card showing the QR modal (white screen inside dark bezel)
 *    – "My QR Code" header + ×
 *    – Generated QR pattern with lime "R." centre badge
 *    – Lime "Share Code" pill button
 *  • Bottom row: [image icon] [lime "My Code" pill] [lightning icon]
 *  • Standard tab bar visible at very bottom
 */

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

const LIME   = "#C8FF00";
const BLACK  = "#1A1A1A";
const INDIGO = "#4F46E5";
const NAVY   = "#0D1421";

// ─── QR code pattern ──────────────────────────────────────────────────────────
// A realistic 21×21 QR-like grid used as a static placeholder.
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
  const CELL = 7;
  return (
    <View style={qr.outer}>
      {PATTERN.map((row, ri) => (
        <View key={ri} style={qr.row}>
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
      {/* Lime badge overlay in the centre */}
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
    padding: 6,
    borderRadius: 4,
    position: "relative",
    alignItems: "center",
  },
  row:   { flexDirection: "row" },
  dark:  { backgroundColor: "#1A1A1A" },
  light: { backgroundColor: "#FFFFFF" },
  badge: {
    position: "absolute",
    top: "36%", left: "36%",
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: LIME,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#FFFFFF",
  },
  badgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: INDIGO },
});

// ─── QR Code Modal (bottom sheet) ─────────────────────────────────────────────
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
        <View style={[m.sheet, { paddingBottom: insets.bottom + 28 }]}>
          <View style={m.handle} />
          <View style={m.header}>
            <Text style={m.title}>My QR Code</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Feather name="x" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <View style={m.qrWrap}>
            <QRCodeView />
          </View>
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
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 28, paddingTop: 16,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center", marginBottom: 20,
  },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 28,
  },
  title: { fontSize: 20, fontFamily: "Inter_700Bold", color: BLACK },
  qrWrap: { alignItems: "center", marginBottom: 28 },
  shareBtn: {
    backgroundColor: LIME, borderRadius: 14, height: 54,
    alignItems: "center", justifyContent: "center",
  },
  shareBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: BLACK },
});

// ─── Phone-frame card with embedded QR modal preview ──────────────────────────
// Matches the reference: white card inside a dark-bordered phone bezel,
// showing "My QR Code" header, QR code, and "Share Code" lime button.
function PhoneFrameCard() {
  return (
    <View style={ph.frame}>
      {/* Inner white screen */}
      <View style={ph.screen}>
        {/* Modal header */}
        <View style={ph.modalHeader}>
          <Text style={ph.modalTitle}>My QR Code</Text>
          <Feather name="x" size={13} color="#9CA3AF" />
        </View>
        {/* QR code */}
        <View style={ph.qrArea}>
          <View style={ph.qrOuter}>
            {PATTERN.slice(0, 13).map((row, ri) => (
              <View key={ri} style={{ flexDirection: "row" }}>
                {row.map((cell, ci) => (
                  <View
                    key={ci}
                    style={{
                      width: 5.5, height: 5.5,
                      backgroundColor: cell === 1 ? "#1A1A1A" : "#FFFFFF",
                    }}
                  />
                ))}
              </View>
            ))}
            <View style={ph.qrBadge}>
              <Text style={ph.qrBadgeText}>R.</Text>
            </View>
          </View>
        </View>
        {/* Share Code pill */}
        <View style={ph.sharePill}>
          <Text style={ph.sharePillText}>Share Code</Text>
        </View>
      </View>
      {/* Phone home bar */}
      <View style={ph.homeBar} />
    </View>
  );
}

const ph = StyleSheet.create({
  frame: {
    width: 220,
    borderRadius: 22,
    backgroundColor: "#2A3040",
    borderWidth: 5,
    borderColor: "#2A3040",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  screen: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 18,
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 14,
  },
  modalTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: BLACK },
  qrArea: { alignItems: "center", marginBottom: 14 },
  qrOuter: {
    position: "relative",
    backgroundColor: "#FFFFFF",
    padding: 4,
    borderRadius: 3,
    alignItems: "center",
  },
  qrBadge: {
    position: "absolute", top: "28%", left: "34%",
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: LIME,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "#FFFFFF",
  },
  qrBadgeText: { fontSize: 7, fontFamily: "Inter_700Bold", color: INDIGO },
  sharePill: {
    backgroundColor: LIME,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 7,
  },
  sharePillText: { fontSize: 11, fontFamily: "Inter_700Bold", color: BLACK },
  homeBar: {
    height: 4,
    backgroundColor: "#3D4557",
    marginHorizontal: 70,
    marginVertical: 8,
    borderRadius: 2,
  },
});

// ─── Scan Screen ──────────────────────────────────────────────────────────────
export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const [myCodeOpen, setMyCodeOpen] = useState(false);

  return (
    <View style={s.root}>
      {/* Safe area top */}
      <View style={{ height: insets.top }} />

      {/* ── Close button ──────────────────────────────────────────────────── */}
      <View style={s.topBar}>
        <TouchableOpacity
          style={s.closeBtn}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Feather name="x" size={16} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
      </View>

      {/* ── Phone frame card centred ───────────────────────────────────────── */}
      <View style={s.frameArea}>
        <PhoneFrameCard />
      </View>

      {/* ── Bottom controls ───────────────────────────────────────────────── */}
      <View style={[s.controls, { paddingBottom: insets.bottom + 20 }]}>
        {/* Gallery */}
        <TouchableOpacity style={s.sideBtn} activeOpacity={0.7}>
          <Feather name="image" size={22} color="rgba(255,255,255,0.75)" />
        </TouchableOpacity>

        {/* My Code pill */}
        <TouchableOpacity
          style={s.myCodeBtn}
          activeOpacity={0.85}
          onPress={() => setMyCodeOpen(true)}
        >
          <Feather name="grid" size={18} color={BLACK} />
          <Text style={s.myCodeText}>My Code</Text>
        </TouchableOpacity>

        {/* Flash */}
        <TouchableOpacity style={s.sideBtn} activeOpacity={0.7}>
          <Feather name="zap" size={22} color="rgba(255,255,255,0.75)" />
        </TouchableOpacity>
      </View>

      <MyQRModal visible={myCodeOpen} onClose={() => setMyCodeOpen(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: NAVY,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  frameArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 44,
    paddingTop: 20,
  },
  sideBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  myCodeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: LIME,
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 28,
  },
  myCodeText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: BLACK,
  },
});
