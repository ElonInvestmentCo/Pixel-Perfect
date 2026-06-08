import { Dimensions } from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Screen breakpoints ───────────────────────────────────────────────────────
export const isTablet = SCREEN_W >= 600;

// ─── Colors ───────────────────────────────────────────────────────────────────
export const OC = {
  // Brand
  lime:        "#C8FF00",
  black:       "#1A1A1A",
  indigo:      "#4F46E5",
  // Semantic
  error:       "#DC2626",
  errorLight:  "#FEF2F2",
  errorBg:     "#FEF9F9",
  errorBorder: "#FECACA",
  success:     "#16A34A",
  // Backgrounds
  bg:          "#FFFFFF",
  fieldBg:     "#F5F5F5",
  closeBg:     "#F0F0F0",
  gray:        "#F2F2F2",
  // Text
  muted:       "#888888",
  faint:       "#AAAAAA",
  placeholder: "#C0C0C0",
  // Borders
  border:      "#E8E8E8",
} as const;

// ─── Font families (must match @expo-google-fonts/inter) ──────────────────────
export const OF = {
  regular:  "Inter_400Regular"  as const,
  medium:   "Inter_500Medium"   as const,
  semibold: "Inter_600SemiBold" as const,
  bold:     "Inter_700Bold"     as const,
};

// ─── Sizing & spacing ─────────────────────────────────────────────────────────
export const OS = {
  // Horizontal page padding — wider on tablets for readability
  pagePadH:  isTablet ? 40 : 24,
  // Maximum content width on tablets (centred column layout)
  maxW:      isTablet ? 480 : undefined as number | undefined,
  // Input / button heights
  fieldH:    56,
  ctaH:      58,
  // Radii
  ctaR:      28,   // pill CTA
  fieldR:    12,   // input field
  cardR:     16,   // selection cards
  // Icon button
  iconBtnSz: 36,
  iconBtnR:  18,
  // Vertical rhythm (added to safe-area inset)
  topGap:    14,   // space between safe-area top and first element
  botGap:    20,   // space between last element and safe-area bottom
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const OShadow = {
  /** Subtle lift used for white surface cards */
  card: {
    shadowColor:   "#000000",
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius:  10,
    elevation:     3,
  },
  /** Lime glow applied to the enabled CTA button */
  ctaGlow: {
    shadowColor:   "#A8D400",
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius:  18,
    elevation:     8,
  },
} as const;
