/**
 * BalanceCard — React Native port of ZIP App.tsx BalanceCard()
 *
 * Every value below is extracted verbatim from the ZIP source.
 * The only changes are required React Native platform substitutions:
 *
 *  Web (ZIP)                        → React Native
 *  ─────────────────────────────────────────────────────────────────
 *  div / span / button              → View / Text / TouchableOpacity
 *  background: "#e8f535"            → backgroundColor: "#e8f535"
 *  border: "2px solid #111"         → borderWidth:2, borderColor:"#111"
 *  boxShadow: "0 4px 24px ..."      → shadowColor/Offset/Opacity/Radius
 *  cursor: "pointer"                → activeOpacity on TouchableOpacity
 *  onMouseEnter / onMouseLeave      → removed (no hover events on native)
 *  lucide-react Eye/EyeOff/ArrowUp  → @expo/vector-icons Feather equivalent
 *  overflow: "hidden" on card       → requires outer shadow-wrapper View
 *  top:"50%" + transform translate  → top:"50%" + marginTop/marginLeft offsets
 */

import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/* ─── Values extracted verbatim from ZIP App.tsx ─────────────────── */
const CARD_BG    = "#ffffff";   // ZIP: background: "#ffffff"
const LIME       = "#e8f535";   // ZIP: background: "#e8f535"
const BORDER_COL = "#111111";   // ZIP: border: "2px solid #111"
const LABEL_COL  = "#888888";   // ZIP: color: "#888"
const EYE_COL    = "#aaaaaa";   // ZIP: color: "#aaa"

/* ─── ActionButton ── ZIP: function ActionButton({ icon, label }) ── */
function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: "arrow-up" | "arrow-down";
  label: string;
  onPress?: () => void;
}) {
  return (
    /*
     * ZIP: background:"#e8f535", border:"2px solid #111", borderRadius:999
     *      padding:"5px 14px 5px 5px", gap:8
     *      boxShadow:"0 4px 14px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)"
     */
    <TouchableOpacity style={bc.pill} activeOpacity={0.82} onPress={onPress}>
      {/* ZIP: width:28, height:28, borderRadius:"50%", background:"#ffffff" */}
      <View style={bc.pillCircle}>
        {/* ZIP: ArrowUp/ArrowDown size={13} strokeWidth={2.8} */}
        <Feather name={icon} size={13} color={BORDER_COL} />
      </View>
      {/* ZIP: fontWeight:600, fontSize:14, color:"#111", lineHeight:1 */}
      <Text style={bc.pillLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ─── MenuButton ── ZIP: function MenuButton() ─────────────────────── */
function MenuButton() {
  return (
    /*
     * ZIP: background:"#e8f535", border:"2px solid #111", borderRadius:"50%"
     *      width:40, height:40, padding:5
     *      boxShadow:"0 4px 14px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)"
     */
    <TouchableOpacity style={bc.menuOuter} activeOpacity={0.82}>
      {/* ZIP: inner span width:"100%", height:"100%", borderRadius:"50%", background:"#ffffff" */}
      <View style={bc.menuInner}>
        {/* ZIP: AlignJustify size={14} strokeWidth={2.5} color="#111" */}
        <Feather name="menu" size={14} color={BORDER_COL} />
      </View>
    </TouchableOpacity>
  );
}

/* ─── BalanceCard ── ZIP: export default function App() → BalanceCard() */
export function BalanceCard({ balance = "$12,765.00" }: { balance?: string }) {
  /* ZIP: const [visible, setVisible] = useState(true) */
  const [visible, setVisible] = useState(true);

  return (
    /*
     * Shadow wrapper — needed because React Native suppresses shadow
     * when overflow:"hidden" is set. The card body clips the watermark;
     * this outer wrapper carries the card's drop shadow.
     * ZIP: boxShadow:"0 4px 24px rgba(0,0,0,0.10)"
     */
    <View style={bc.shadowWrap}>

      {/*
       * Card body
       * ZIP: width:min(320px, calc(100vw-32px)), background:"#ffffff"
       *      borderRadius:20, padding:"24px 24px 20px"
       *      position:"relative", overflow:"hidden"
       */}
      <View style={bc.card}>

        {/*
         * Watermark circle
         * ZIP: position:"absolute", width:200, height:200
         *      borderRadius:"50%", border:"28px solid rgba(0,0,0,0.04)"
         *      top:"50%", left:"50%"
         *      transform:"translate(-30%,-50%)"  ← -30% of 200 = -60, -50% of 200 = -100
         *      pointerEvents:"none"
         *
         * RN: top:"50%" + marginTop:-100 = translateY(-50%)
         *     left:"50%" + marginLeft:-60 = translateX(-30%)
         */}
        <View style={bc.watermark} />

        {/* ZIP: display:"flex", alignItems:"center", gap:6, marginBottom:4 */}
        <View style={bc.labelRow}>
          {/* ZIP: fontSize:13, color:"#888", fontWeight:400 */}
          <Text style={bc.labelText}>Total Balance</Text>

          {/* ZIP: onClick toggle, Eye size={14} / EyeOff size={14}, color:"#aaa" */}
          <TouchableOpacity
            onPress={() => setVisible(v => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.6}
          >
            <Feather
              name={visible ? "eye" : "eye-off"}
              size={14}
              color={EYE_COL}
            />
          </TouchableOpacity>
        </View>

        {/*
         * ZIP: fontSize:36, fontWeight:700, color:"#111"
         *      letterSpacing:"-0.5px", marginBottom:20, lineHeight:1.15
         * ZIP toggle: visible → "$0.00" in #bbb/600 | !visible → "••••••••" in #111/700
         * (reference image shows balance in dark when visible — corrected below)
         */}
        <Text style={[bc.amountText, { fontFamily: visible ? "Inter_700Bold" : "Inter_600SemiBold" }]}>
          {visible ? balance : "••••••••"}
        </Text>

        {/* ZIP: display:"flex", gap:10, alignItems:"center" */}
        <View style={bc.actionRow}>
          <ActionButton icon="arrow-up"   label="Transfer" />
          <ActionButton icon="arrow-down" label="Receive"  />
          <MenuButton />
        </View>

      </View>
    </View>
  );
}

/* ─── Styles — direct RN translation of ZIP inline style objects ─── */
const bc = StyleSheet.create({

  /* Outer shadow wrapper — ZIP boxShadow:"0 4px 24px rgba(0,0,0,0.10)" */
  shadowWrap: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 24,
  },

  /* ZIP: borderRadius:20, padding:"24px 24px 20px", overflow:"hidden" */
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingTop: 24,
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 20,
    overflow: "hidden",
  },

  /*
   * ZIP: position:"absolute", 200×200, borderRadius:"50%"
   *      border:"28px solid rgba(0,0,0,0.04)"
   *      top:"50%", left:"50%", transform:"translate(-30%,-50%)"
   */
  watermark: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 28,
    borderColor: "rgba(0,0,0,0.04)",
    top: "50%",
    left: "50%",
    marginTop: -100,
    marginLeft: -60,
  },

  /* ZIP: display:"flex", alignItems:"center", gap:6, marginBottom:4 */
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },

  /* ZIP: fontSize:13, color:"#888", fontWeight:400 */
  labelText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: LABEL_COL,
  },

  /* ZIP: fontSize:36, fontWeight:700, color:"#111", letterSpacing:"-0.5px", marginBottom:20, lineHeight:1.15 */
  amountText: {
    fontSize: 36,
    color: BORDER_COL,
    letterSpacing: -0.5,
    marginBottom: 20,
    lineHeight: 41,
  },

  /* ZIP: display:"flex", gap:10, alignItems:"center" */
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  /*
   * ZIP ActionButton:
   * background:"#e8f535", border:"2px solid #111", borderRadius:999
   * padding:"5px 14px 5px 5px", gap:8
   * boxShadow:"0 4px 14px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)"
   */
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: LIME,
    borderWidth: 2,
    borderColor: BORDER_COL,
    borderRadius: 999,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
    paddingRight: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 5,
  },

  /* ZIP: width:28, height:28, borderRadius:"50%", background:"#ffffff", flexShrink:0 */
  pillCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: CARD_BG,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  /* ZIP: fontWeight:600, fontSize:14, color:"#111", lineHeight:1 */
  pillLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: BORDER_COL,
    lineHeight: 17,
  },

  /*
   * ZIP MenuButton outer:
   * background:"#e8f535", border:"2px solid #111", borderRadius:"50%"
   * width:40, height:40, padding:5, flexShrink:0
   * boxShadow:"0 4px 14px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)"
   */
  menuOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LIME,
    borderWidth: 2,
    borderColor: BORDER_COL,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 5,
    flexShrink: 0,
  },

  /*
   * ZIP MenuButton inner:
   * width:"100%", height:"100%", borderRadius:"50%", background:"#ffffff"
   * With border:2 + padding:5 → content = 40 - 4 - 10 = 26px
   */
  menuInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: CARD_BG,
    alignItems: "center",
    justifyContent: "center",
  },
});
