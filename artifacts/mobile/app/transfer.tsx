import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PURPLE_FROM = "#5B5FEF";
const PURPLE_TO   = "#6D72FF";
const LIME        = "#CDFF00";
const BLACK       = "#000000";
const GRAY        = "#8E8E93";
const BORDER      = "#E5E5EA";
const BG          = "#F5F5F7";
const WHITE       = "#FFFFFF";

interface Recipient {
  id: string;
  name: string;
  accountNumber: string;
  cardType: "VISA" | "MASTERCARD" | "CHASE" | "HSBC";
  avatar: string;
}

const RECENT_PAYED: Recipient[] = [
  {
    id: "1", name: "Rayford Chenail", accountNumber: "**** 3261", cardType: "VISA",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
  },
  {
    id: "2", name: "Krishna Barbe", accountNumber: "**** 4532", cardType: "CHASE",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  },
];

const ALL_CONTACTS: Recipient[] = [
  {
    id: "3", name: "Cyndy Lillibridge", accountNumber: "**** 0988", cardType: "MASTERCARD",
    avatar: "https://images.unsplash.com/photo-1607503873903-c5e95f80d7b9?w=400&h=400&fit=crop",
  },
  {
    id: "4", name: "Willard Purnell", accountNumber: "**** 1652", cardType: "HSBC",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
];

// ─── Card type logo ───────────────────────────────────────────────────────────
function CardLogo({ type }: { type: Recipient["cardType"] }) {
  switch (type) {
    case "VISA":
      return <Text style={cl.visa}>VISA</Text>;
    case "MASTERCARD":
      return (
        <View style={{ flexDirection: "row" }}>
          <View style={[cl.mcCircle, { backgroundColor: "#EB001B" }]} />
          <View style={[cl.mcCircle, { backgroundColor: "#FF5F00", marginLeft: -10 }]} />
        </View>
      );
    case "CHASE":
      return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text style={cl.chase}>CHASE</Text>
          <View style={cl.chaseDot} />
        </View>
      );
    case "HSBC":
      return <Text style={cl.hsbc}>HSBC</Text>;
    default:
      return null;
  }
}

const cl = StyleSheet.create({
  visa:  { color: "#1A1F71", fontSize: 16, fontFamily: "Inter_700Bold" },
  mcCircle: { width: 22, height: 22, borderRadius: 11 },
  chase: { color: "#117ACA", fontSize: 13, fontFamily: "Inter_700Bold" },
  chaseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#117ACA" },
  hsbc:  { color: "#DB0011", fontSize: 13, fontFamily: "Inter_700Bold" },
});

// ─── Choose Recipients modal ──────────────────────────────────────────────────
function ChooseRecipientsModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (r: Recipient) => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const filter = (list: Recipient[]) => {
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (r) => r.name.toLowerCase().includes(q) || r.accountNumber.includes(q)
    );
  };

  const recent  = filter(RECENT_PAYED);
  const all     = filter(ALL_CONTACTS);
  const noMatch = recent.length === 0 && all.length === 0 && query.trim().length > 0;

  const handleSelect = (r: Recipient) => {
    setQuery("");
    onSelect(r);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={mo.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        <View style={[mo.sheet, { paddingBottom: insets.bottom + 8 }]}>
          {/* Header */}
          <View style={mo.header}>
            <Text style={mo.title}>Choose Recipients</Text>
            <TouchableOpacity style={mo.closeBtn} onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={18} color={GRAY} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={mo.searchWrap}>
            <Feather name="search" size={18} color={GRAY} />
            <TextInput
              style={mo.searchInput}
              placeholder="Search contact"
              placeholderTextColor={GRAY}
              value={query}
              onChangeText={setQuery}
            />
          </View>

          {/* Lists */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            {recent.length > 0 && (
              <>
                <Text style={mo.sectionLabel}>Recent Payed</Text>
                {recent.map((r) => (
                  <TouchableOpacity key={r.id} style={mo.contactRow} onPress={() => handleSelect(r)} activeOpacity={0.75}>
                    <Image source={{ uri: r.avatar }} style={mo.avatar} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={mo.contactName}>{r.name}</Text>
                      <Text style={mo.contactSub}>{r.accountNumber}</Text>
                    </View>
                    <CardLogo type={r.cardType} />
                  </TouchableOpacity>
                ))}
              </>
            )}
            {all.length > 0 && (
              <>
                <Text style={[mo.sectionLabel, { marginTop: 20 }]}>All Contact</Text>
                {all.map((r) => (
                  <TouchableOpacity key={r.id} style={mo.contactRow} onPress={() => handleSelect(r)} activeOpacity={0.75}>
                    <Image source={{ uri: r.avatar }} style={mo.avatar} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={mo.contactName}>{r.name}</Text>
                      <Text style={mo.contactSub}>{r.accountNumber}</Text>
                    </View>
                    <CardLogo type={r.cardType} />
                  </TouchableOpacity>
                ))}
              </>
            )}
            {noMatch && (
              <View style={{ paddingTop: 40, alignItems: "center" }}>
                <Text style={{ color: GRAY, fontSize: 17, fontFamily: "Inter_500Medium" }}>No contacts found</Text>
                <Text style={{ color: "#C7C7CC", fontSize: 15, marginTop: 4, textAlign: "center" }}>
                  Try a different name or account number
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Confirm Transfer modal ───────────────────────────────────────────────────
function ConfirmTransferModal({
  visible,
  recipient,
  note,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  recipient: Recipient;
  note: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [editNote, setEditNote] = useState(note);
  useEffect(() => { setEditNote(note); }, [note]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={mo.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        <View style={[mo.sheet, { paddingBottom: insets.bottom + 8 }]}>
          {/* Header */}
          <View style={mo.header}>
            <Text style={mo.title}>Transfer Money</Text>
            <TouchableOpacity style={mo.closeBtn} onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={18} color={GRAY} />
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            {/* From */}
            <Text style={mo.confirmLabel}>From:</Text>
            <View style={mo.confirmRow}>
              <View style={mo.fromIconWrap}>
                <View style={{ flexDirection: "row" }}>
                  <View style={[cl.mcCircle, { backgroundColor: "#EB001B" }]} />
                  <View style={[cl.mcCircle, { backgroundColor: "#FF5F00", marginLeft: -8 }]} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={mo.confirmName}>Mastercards</Text>
                <Text style={mo.confirmSub}>**** 7865</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <View style={[cl.mcCircle, { backgroundColor: "#EB001B" }]} />
                <View style={[cl.mcCircle, { backgroundColor: "#FF5F00", marginLeft: -10 }]} />
              </View>
            </View>

            {/* Transfer to */}
            <Text style={[mo.confirmLabel, { marginTop: 16 }]}>Transfer to:</Text>
            <View style={mo.confirmRow}>
              <Image source={{ uri: recipient.avatar }} style={mo.confirmAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={mo.confirmName}>{recipient.name}</Text>
                <Text style={mo.confirmSub}>{recipient.accountNumber}</Text>
              </View>
              <Text style={cl.visa}>VISA</Text>
            </View>

            {/* Note */}
            <Text style={[mo.confirmLabel, { marginTop: 16 }]}>Note:</Text>
            <TextInput
              style={mo.noteInput}
              value={editNote}
              onChangeText={setEditNote}
              placeholder="Add a note..."
              placeholderTextColor="#C7C7CC"
              multiline
              textAlignVertical="top"
            />

            {/* Confirm */}
            <TouchableOpacity style={mo.confirmBtn} onPress={onConfirm} activeOpacity={0.85}>
              <Text style={mo.confirmBtnText}>Confirm Transfer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────
function SuccessScreen({ visible, onBack }: { visible: boolean; onBack: () => void }) {
  const insets   = useSafeAreaInsets();
  const pulseRef = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseRef, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseRef, { toValue: 1,    duration: 1000, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [visible]);

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onBack}>
      <LinearGradient colors={[PURPLE_FROM, PURPLE_TO]} style={{ flex: 1 }}>
        {/* Centre content */}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          {/* Concentric rings + checkmark */}
          <View style={{ alignItems: "center", justifyContent: "center", marginBottom: 56 }}>
            <Animated.View style={[ss.outerRing, { transform: [{ scale: pulseRef }] }]} />
            <View style={ss.midRing} />
            <View style={ss.innerRing} />
            <View style={ss.checkCircle}>
              <Feather name="check" size={44} color={BLACK} />
            </View>
          </View>

          <Text style={ss.doneText}>All Done!</Text>
          <Text style={ss.subText}>
            You have successfully transferred your money.
          </Text>
        </View>

        {/* Back button */}
        <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>
          <TouchableOpacity style={ss.backBtn} onPress={onBack} activeOpacity={0.85}>
            <Text style={ss.backBtnText}>Back to Homepage</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const ss = StyleSheet.create({
  outerRing: {
    position: "absolute", width: 200, height: 200,
    borderRadius: 100, backgroundColor: "rgba(255,255,255,0.05)",
  },
  midRing: {
    position: "absolute", width: 156, height: 156,
    borderRadius: 78, backgroundColor: "rgba(255,255,255,0.10)",
  },
  innerRing: {
    position: "absolute", width: 118, height: 118,
    borderRadius: 59, backgroundColor: "#8B8FFF",
  },
  checkCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: LIME, alignItems: "center", justifyContent: "center",
  },
  doneText: {
    color: WHITE, fontSize: 42, fontFamily: "Inter_700Bold",
    textAlign: "center", marginBottom: 16,
  },
  subText: {
    color: "rgba(255,255,255,0.80)", fontSize: 18,
    textAlign: "center", lineHeight: 28,
  },
  backBtn: {
    backgroundColor: LIME, borderRadius: 16, height: 56,
    alignItems: "center", justifyContent: "center",
  },
  backBtnText: {
    color: BLACK, fontSize: 18, fontFamily: "Inter_600SemiBold",
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function TransferMoneyScreen() {
  const insets    = useSafeAreaInsets();
  const cursorRef = useRef(new Animated.Value(1)).current;

  const [amount,       setAmount]       = useState("0.00");
  const [note,         setNote]         = useState("");
  const [recipient,    setRecipient]    = useState<Recipient>(RECENT_PAYED[0]);
  const [showPicker,   setShowPicker]   = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [showSuccess,  setShowSuccess]  = useState(false);

  // Blinking cursor
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorRef, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(cursorRef, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleKey = (key: string) => {
    setAmount((prev) => {
      if (key === "delete") return prev.length > 1 ? prev.slice(0, -1) : "0.00";
      if (key === ".") return prev.includes(".") ? prev : prev + ".";
      return prev === "0.00" ? key : prev + key;
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* ── Header (purple gradient) ─────────────────────────────────────── */}
      <LinearGradient
        colors={[PURPLE_FROM, PURPLE_TO]}
        style={[s.header, { paddingTop: insets.top + 16 }]}
      >
        <TouchableOpacity
          style={s.headerBtn}
          onPress={() => router.back()}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="chevron-left" size={24} color={WHITE} />
        </TouchableOpacity>

        <Text style={s.headerTitle}>Transfer Money</Text>

        <TouchableOpacity style={s.shieldBtn} activeOpacity={0.75}>
          <Feather name="shield" size={20} color={BLACK} />
        </TouchableOpacity>
      </LinearGradient>

      {/* ── Card body ───────────────────────────────────────────────────── */}
      <View style={s.card}>
        {/* Amount */}
        <Text style={s.enterLabel}>Enter amount</Text>
        <View style={s.amountRow}>
          <Text style={s.dollarSign}>$</Text>
          <Text style={s.amountText}>{amount}</Text>
          <Animated.View style={[s.cursor, { opacity: cursorRef }]} />
        </View>

        {/* Recipient card */}
        <TouchableOpacity style={s.recipientCard} onPress={() => setShowPicker(true)} activeOpacity={0.8}>
          <Image source={{ uri: recipient.avatar }} style={s.recipientAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={s.recipientName}>{recipient.name}</Text>
            <Text style={s.recipientAccount}>{recipient.accountNumber}</Text>
          </View>
          <Text style={cl.visa}>VISA</Text>
        </TouchableOpacity>

        {/* Note input */}
        <View style={s.noteRow}>
          <TextInput
            style={s.noteInput}
            placeholder="Add note..."
            placeholderTextColor="#C7C7CC"
            value={note}
            onChangeText={setNote}
          />
          <Feather name="calendar" size={18} color="#C7C7CC" />
        </View>

        {/* Numeric keypad */}
        <View style={s.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <TouchableOpacity key={n} style={s.key} activeOpacity={0.45} onPress={() => handleKey(n.toString())}>
              <Text style={s.keyText}>{n}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.key} activeOpacity={0.45} onPress={() => handleKey(".")}>
            <Text style={s.keyText}>.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.key} activeOpacity={0.45} onPress={() => handleKey("0")}>
            <Text style={s.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.key} activeOpacity={0.45} onPress={() => handleKey("delete")}>
            <Feather name="delete" size={26} color={BLACK} />
          </TouchableOpacity>
        </View>

        {/* Send Money button */}
        <TouchableOpacity style={s.sendBtn} onPress={() => setShowConfirm(true)} activeOpacity={0.85}>
          <Text style={s.sendBtnText}>Send Money</Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + 12 }} />
      </View>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      <ChooseRecipientsModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(r) => { setRecipient(r); setShowPicker(false); }}
      />

      <ConfirmTransferModal
        visible={showConfirm}
        recipient={recipient}
        note={note}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => { setShowConfirm(false); setShowSuccess(true); }}
      />

      <SuccessScreen
        visible={showSuccess}
        onBack={() => {
          setShowSuccess(false);
          setAmount("0.00");
          setNote("");
          router.replace("/(app)");
        }}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 24,
  },
  headerBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.20)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22, fontFamily: "Inter_600SemiBold", color: WHITE,
  },
  shieldBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: LIME, alignItems: "center", justifyContent: "center",
  },

  card: {
    flex: 1, backgroundColor: BG,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 20, paddingTop: 28,
  },

  enterLabel: {
    textAlign: "center", color: GRAY,
    fontSize: 15, fontFamily: "Inter_500Medium", marginBottom: 6,
  },
  amountRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", marginBottom: 28,
  },
  dollarSign: {
    color: GRAY, fontSize: 52,
    fontFamily: "Inter_600SemiBold", marginRight: 2,
  },
  amountText: {
    color: BLACK, fontSize: 52,
    fontFamily: "Inter_600SemiBold", letterSpacing: -1,
  },
  cursor: {
    width: 2, height: 52, backgroundColor: BLACK, marginLeft: 2,
  },

  recipientCard: {
    backgroundColor: WHITE, borderRadius: 16,
    padding: 16, flexDirection: "row",
    alignItems: "center", borderWidth: 1,
    borderColor: BORDER, marginBottom: 12,
  },
  recipientAvatar: {
    width: 56, height: 56, borderRadius: 28, marginRight: 12,
  },
  recipientName: {
    fontSize: 17, fontFamily: "Inter_600SemiBold", color: BLACK,
  },
  recipientAccount: {
    fontSize: 15, fontFamily: "Inter_400Regular", color: GRAY, marginTop: 2,
  },

  noteRow: {
    backgroundColor: WHITE, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: BORDER, marginBottom: 20,
  },
  noteInput: {
    flex: 1, fontSize: 17,
    fontFamily: "Inter_400Regular", color: BLACK,
    outlineStyle: "none" as any,
  },

  keypad: {
    flexDirection: "row", flexWrap: "wrap",
    marginBottom: 16,
  },
  key: {
    width: "33.33%", height: 64,
    alignItems: "center", justifyContent: "center",
  },
  keyText: {
    fontSize: 32, fontFamily: "Inter_300Light", color: BLACK,
  },

  sendBtn: {
    backgroundColor: LIME, borderRadius: 16, height: 56,
    alignItems: "center", justifyContent: "center",
    shadowColor: LIME, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  sendBtnText: {
    fontSize: 18, fontFamily: "Inter_600SemiBold", color: BLACK,
  },
});

// ─── Modal styles (shared) ────────────────────────────────────────────────────
const mo = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.40)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  title: {
    fontSize: 20, fontFamily: "Inter_600SemiBold", color: BLACK,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: BG, alignItems: "center", justifyContent: "center",
  },
  searchWrap: {
    marginHorizontal: 20, marginVertical: 14,
    backgroundColor: BG, borderRadius: 12,
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 12,
  },
  searchInput: {
    flex: 1, fontSize: 17, fontFamily: "Inter_400Regular",
    color: BLACK, marginLeft: 8,
    outlineStyle: "none" as any,
  },
  sectionLabel: {
    fontSize: 15, fontFamily: "Inter_600SemiBold",
    color: BLACK, marginTop: 8, marginBottom: 10,
  },
  contactRow: {
    backgroundColor: WHITE, borderRadius: 16,
    padding: 16, flexDirection: "row",
    alignItems: "center", borderWidth: 1,
    borderColor: BORDER, marginBottom: 8,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
  },
  contactName: {
    fontSize: 17, fontFamily: "Inter_600SemiBold", color: BLACK,
  },
  contactSub: {
    fontSize: 15, fontFamily: "Inter_400Regular", color: GRAY, marginTop: 2,
  },

  confirmLabel: {
    fontSize: 13, fontFamily: "Inter_500Medium",
    color: GRAY, marginBottom: 8,
  },
  confirmRow: {
    backgroundColor: WHITE, borderRadius: 16,
    padding: 16, flexDirection: "row",
    alignItems: "center", borderWidth: 1, borderColor: BORDER,
  },
  fromIconWrap: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: PURPLE_FROM,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  confirmName: {
    fontSize: 17, fontFamily: "Inter_600SemiBold", color: BLACK,
  },
  confirmSub: {
    fontSize: 15, fontFamily: "Inter_400Regular", color: GRAY, marginTop: 2,
  },
  confirmAvatar: {
    width: 40, height: 40, borderRadius: 20, marginRight: 12,
  },
  noteInput: {
    backgroundColor: BG, borderRadius: 16,
    padding: 16, minHeight: 96,
    borderWidth: 1, borderColor: BORDER,
    color: BLACK, fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlignVertical: "top",
    outlineStyle: "none" as any,
  },
  confirmBtn: {
    backgroundColor: LIME, borderRadius: 16, height: 56,
    alignItems: "center", justifyContent: "center", marginTop: 20,
    shadowColor: LIME, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  confirmBtnText: {
    fontSize: 18, fontFamily: "Inter_600SemiBold", color: BLACK,
  },
});
