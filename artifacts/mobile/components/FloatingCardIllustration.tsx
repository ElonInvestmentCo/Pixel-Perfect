import React, { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Path,
  Rect,
} from "react-native-svg";

const W = 108;
const H = 68;

export function FloatingCardIllustration() {
  const floatY = useSharedValue(0);
  const scaleV = useSharedValue(1);
  const rotZ   = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0,   { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, false,
    );

    scaleV.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0,  { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, false,
    );

    rotZ.value = withRepeat(
      withSequence(
        withTiming(-2.5, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
        withTiming(2.5,  { duration: 3200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, false,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { scale: scaleV.value },
      { rotate: `${rotZ.value}deg` },
    ],
  }));

  return (
    <Animated.View style={animStyle}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* ── Card base ─── */}
        <Rect x="0" y="0" width={W} height={H} rx="11" fill="#1A1A1A" />

        {/* ── Top sheen ─── */}
        <Rect x="0" y="0" width={W} height="22" rx="11" fill="rgba(255,255,255,0.06)" />

        {/* ── EMV Chip ─── */}
        <Rect x="11" y="15" width="24" height="19" rx="3.5" fill="#C8FF00" />
        {/* chip horizontal line */}
        <Path d="M11 24.5 L35 24.5" stroke="#1A1A1A" strokeWidth="0.9" opacity="0.3" />
        {/* chip vertical lines */}
        <Path d="M18 15 L18 34" stroke="#1A1A1A" strokeWidth="0.9" opacity="0.3" />
        <Path d="M23 15 L23 34" stroke="#1A1A1A" strokeWidth="0.9" opacity="0.3" />
        <Path d="M28 15 L28 34" stroke="#1A1A1A" strokeWidth="0.9" opacity="0.3" />

        {/* ── Contactless arcs ─── */}
        <Path d="M90 14 A4 4 0 0 1 90 22"  stroke="white" strokeWidth="1.4" fill="none" opacity="0.65" strokeLinecap="round" />
        <Path d="M86 11 A9 9 0 0 1 86 25"  stroke="white" strokeWidth="1.4" fill="none" opacity="0.4"  strokeLinecap="round" />
        <Path d="M82 8  A14 14 0 0 1 82 28" stroke="white" strokeWidth="1.4" fill="none" opacity="0.2"  strokeLinecap="round" />

        {/* ── Card number dots — group 1 ─── */}
        <Circle cx="43"  cy="50" r="2" fill="white" opacity="0.45" />
        <Circle cx="49"  cy="50" r="2" fill="white" opacity="0.45" />
        <Circle cx="55"  cy="50" r="2" fill="white" opacity="0.45" />
        <Circle cx="61"  cy="50" r="2" fill="white" opacity="0.45" />
        {/* group 2 */}
        <Circle cx="70"  cy="50" r="2" fill="white" opacity="0.45" />
        <Circle cx="76"  cy="50" r="2" fill="white" opacity="0.45" />
        <Circle cx="82"  cy="50" r="2" fill="white" opacity="0.45" />
        <Circle cx="88"  cy="50" r="2" fill="white" opacity="0.45" />
        {/* last 4 visible digits */}
        <Circle cx="97"  cy="50" r="2" fill="white" opacity="0.9" />
        <Circle cx="103" cy="50" r="2" fill="white" opacity="0.9" />

        {/* ── Name underline ─── */}
        <Rect x="11" y="57" width="34" height="3.5" rx="1.75" fill="white" opacity="0.25" />

        {/* ── Lime accent bar (bottom-right) ─── */}
        <Rect x="76" y="56" width="20" height="5" rx="2.5" fill="#C8FF00" opacity="0.85" />
      </Svg>
    </Animated.View>
  );
}
