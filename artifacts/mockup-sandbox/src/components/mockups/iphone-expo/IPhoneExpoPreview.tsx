import { useState, useEffect, useRef } from "react";

const LIME   = "#C8FF00";
const BLACK  = "#1A1A1A";
const INDIGO = "#4F46E5";

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen =
  | "onboarding"
  | "signup"
  | "phone-verify"
  | "signin"
  | "reset-password"
  | "verify-code";

// ─── Clock ────────────────────────────────────────────────────────────────────
function useClockTime() {
  function fmt() {
    const n = new Date();
    return n.getHours() + ":" + String(n.getMinutes()).padStart(2, "0");
  }
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 10000);
    return () => clearInterval(id);
  }, []);
  return t;
}

// ─── Phone chrome ─────────────────────────────────────────────────────────────
function StatusBar() {
  const time = useClockTime();
  return (
    <div style={{
      position: "absolute", top: 14, left: 0, right: 0, zIndex: 10,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "0 28px", pointerEvents: "none",
    }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: BLACK }}>{time}</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <svg width="17" height="12" viewBox="0 0 17 12" fill={BLACK}>
          <rect x="0" y="8" width="3" height="4" rx="0.8"/>
          <rect x="4.5" y="5" width="3" height="7" rx="0.8"/>
          <rect x="9" y="2" width="3" height="10" rx="0.8"/>
          <rect x="13.5" y="0" width="3" height="12" rx="0.8"/>
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke={BLACK} strokeWidth="1.6" strokeLinecap="round">
          <path d="M0.5 4.2C4.1 0.6 11.9 0.6 15.5 4.2"/>
          <path d="M2.9 6.6C5.5 4 10.5 4 13.1 6.6"/>
          <path d="M5.3 9C6.9 7.4 9.1 7.4 10.7 9"/>
          <circle cx="8" cy="11.2" r="1.2" fill={BLACK} stroke="none"/>
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <div style={{ width: 24, height: 12, borderRadius: 3, border: "1.5px solid " + BLACK, padding: 2 }}>
            <div style={{ width: "82%", height: "100%", backgroundColor: BLACK, borderRadius: 1 }}/>
          </div>
          <div style={{ width: 2, height: 6, backgroundColor: BLACK, borderRadius: 1 }}/>
        </div>
      </div>
    </div>
  );
}

function HomeBar() {
  return (
    <div style={{
      flexShrink: 0, height: 30,
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: "#fff",
    }}>
      <div style={{ width: 130, height: 5, borderRadius: 3, backgroundColor: "#000", opacity: 0.18 }}/>
    </div>
  );
}

function DynamicIsland() {
  return (
    <div style={{
      position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
      zIndex: 20, width: 118, height: 34, backgroundColor: "#000", borderRadius: 20,
    }}/>
  );
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────
function CloseBtn({ onPress }: { onPress: () => void }) {
  return (
    <button onClick={onPress} style={{
      width: 36, height: 36, borderRadius: "50%",
      backgroundColor: "#EBEBEB", border: "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", flexShrink: 0, padding: 0,
    }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#777" strokeWidth="2" strokeLinecap="round">
        <line x1="1" y1="1" x2="11" y2="11"/>
        <line x1="11" y1="1" x2="1" y2="11"/>
      </svg>
    </button>
  );
}

function LimeBtn({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", backgroundColor: LIME, border: "none",
      borderRadius: 28, height: 56, fontSize: 17, fontWeight: 700,
      color: BLACK, cursor: "pointer", flexShrink: 0,
    }}>{label}</button>
  );
}

// ─── Numeric keypad (full 1–9, *, 0, ⌫) ──────────────────────────────────────
function NumPad({
  value,
  onChange,
  bottomLabel,
  bottomLabelColor = "#0D9488",
}: {
  value: string;
  onChange: (v: string) => void;
  bottomLabel?: string;
  bottomLabelColor?: string;
}) {
  const keys = ["1","2","3","4","5","6","7","8","9","*","0","⌫"];
  return (
    <div style={{ padding: "0 4px 8px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {keys.map((k) => (
          <button key={k} onClick={() => {
            if (k === "⌫") onChange(value.slice(0, -1));
            else onChange(value + k);
          }} style={{
            height: 62, backgroundColor: "#F2F2F2", border: "none",
            borderRadius: 12, fontSize: k === "⌫" ? 20 : 26,
            fontWeight: k === "⌫" ? 400 : 400,
            color: BLACK, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            {k === "⌫" ? (
              <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                <path d="M8 1L1 8L8 15" stroke={BLACK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 8H21" stroke={BLACK} strokeWidth="2" strokeLinecap="round"/>
                <line x1="13" y1="5" x2="19" y2="11" stroke={BLACK} strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="19" y1="5" x2="13" y2="11" stroke={BLACK} strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            ) : k}
          </button>
        ))}
      </div>
      {bottomLabel && (
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <span style={{ fontSize: 14, color: bottomLabelColor, fontWeight: 500, cursor: "pointer" }}>
            {bottomLabel}
          </span>
        </div>
      )}
    </div>
  );
}

// Partial numpad starting from 4 (for verify-code screen)
function NumPadPartial({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const keys = ["4","5","6","7","8","9","*","0","⌫"];
  return (
    <div style={{ padding: "0 4px 8px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {keys.map((k) => (
          <button key={k} onClick={() => {
            if (k === "⌫") onChange(value.slice(0, -1));
            else onChange(value + k);
          }} style={{
            height: 62, backgroundColor: "#F2F2F2", border: "none",
            borderRadius: 12, fontSize: k === "⌫" ? 20 : 26,
            color: BLACK, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            {k === "⌫" ? (
              <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                <path d="M8 1L1 8L8 15" stroke={BLACK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 8H21" stroke={BLACK} strokeWidth="2" strokeLinecap="round"/>
                <line x1="13" y1="5" x2="19" y2="11" stroke={BLACK} strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="19" y1="5" x2="13" y2="11" stroke={BLACK} strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            ) : k}
          </button>
        ))}
      </div>
    </div>
  );
}

// iOS QWERTY keyboard (visual, non-functional)
function IOSKeyboard() {
  const rows = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L"],
    ["⬆","Z","X","C","V","B","N","M","⌫"],
    ["123","space","return"],
  ];
  return (
    <div style={{
      backgroundColor: "#D1D5DB", padding: "8px 4px 10px",
      display: "flex", flexDirection: "column", gap: 8, flexShrink: 0,
    }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 5, justifyContent: "center" }}>
          {row.map((k) => {
            const isSpecial = k === "⬆" || k === "⌫" || k === "123" || k === "return";
            const isSpace = k === "space";
            return (
              <div key={k} style={{
                height: 40,
                width: isSpace ? 138 : isSpecial ? (ri === 2 ? 36 : 44) : undefined,
                flex: !isSpace && !isSpecial ? 1 : undefined,
                maxWidth: !isSpace && !isSpecial ? 30 : undefined,
                backgroundColor: isSpecial || isSpace ? "#ADB5BD" : "#fff",
                borderRadius: 5,
                boxShadow: "0 1px 0 rgba(0,0,0,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: k === "⬆" || k === "⌫" ? 14 : isSpecial ? 12 : 16,
                fontWeight: isSpecial ? 400 : 400,
                color: BLACK, cursor: "pointer", flexShrink: 0,
              }}>
                {k === "⬆" ? "⇧" : k === "⌫" ? "⌫" : k}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Onboarding slides ────────────────────────────────────────────────────────
function Slide1() {
  return (
    <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
      <div style={{ width: "100%", backgroundColor: "#fff", borderRadius: 20, border: "1.5px solid #D8D8D8", padding: 20 }}>
        <div style={{ fontSize: 13, color: "#8A8A8A", marginBottom: 4 }}>Total Balance</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: BLACK, margin: "10px 0", letterSpacing: -0.5 }}>$0.00</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {["Transfer","Receive"].map((label, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 5,
              backgroundColor: LIME, border: "1.5px solid " + BLACK,
              borderRadius: 24, padding: "7px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%", border: "1.5px solid " + BLACK,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11,
              }}>{i === 0 ? "↑" : "↓"}</div>
              {label}
            </div>
          ))}
          <div style={{
            width: 40, height: 40, borderRadius: "50%", backgroundColor: LIME,
            border: "1.5px solid " + BLACK, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 16, cursor: "pointer",
          }}>☰</div>
        </div>
      </div>
    </div>
  );
}

function GoldChip() {
  return (
    <div style={{
      width: 30, height: 22, borderRadius: 4, backgroundColor: "#D4A843",
      position: "relative", overflow: "hidden", flexShrink: 0,
    }}>
      <div style={{ position: "absolute", width: "100%", height: 2, top: "50%", transform: "translateY(-50%)", backgroundColor: "#B8882A", opacity: 0.6 }}/>
      <div style={{ position: "absolute", height: "100%", width: 2, left: "50%", transform: "translateX(-50%)", backgroundColor: "#B8882A", opacity: 0.6 }}/>
    </div>
  );
}

function Slide2() {
  const cW = 210, cH = 128;
  return (
    <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
      <div style={{ width: "100%", position: "relative", height: cH + 55 }}>
        <div style={{
          position: "absolute", width: cW, height: cH, borderRadius: 16, padding: 15,
          backgroundColor: "#5B50D6", top: 0, left: 8, transform: "rotate(-6deg)", overflow: "hidden",
        }}>
          <GoldChip/>
          <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, letterSpacing: 1, margin: "10px 0 5px" }}>5643 7890</div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 11 }}>Jennifer Lopez</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, marginTop: 2 }}>Exp 03/28</div>
        </div>
        <div style={{
          position: "absolute", width: cW, height: cH, borderRadius: 16, padding: 15,
          backgroundColor: LIME, bottom: 0, right: 0, transform: "rotate(-1.5deg)", overflow: "hidden",
        }}>
          <GoldChip/>
          <div style={{ color: BLACK, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, margin: "10px 0 5px" }}>5643 7890 3281 7865</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ color: BLACK, fontSize: 11 }}>Jennifer Lopez</div>
              <div style={{ color: "#333", fontSize: 10, marginTop: 2 }}>Exp 03/28</div>
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: BLACK, fontStyle: "italic" }}>VISA</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const BARS = [
  { month: "Jan", pct: 38 }, { month: "Feb", pct: 58 }, { month: "Mar", pct: 45 },
  { month: "Apr", pct: 75 }, { month: "May", pct: 52 }, { month: "Jun", pct: 68 },
  { month: "Jul", pct: 95 },
];

function Slide3({ active }: { active: boolean }) {
  const [risen, setRisen] = useState(false);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setRisen(true), 120);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div style={{ padding: "0 18px", display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
      <div style={{
        width: "100%", backgroundColor: "#fff", borderRadius: 22,
        padding: "16px 16px 13px",
        boxShadow: "0 6px 28px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: "#9A9A9A", fontWeight: 500, letterSpacing: 0.4, marginBottom: 2 }}>Portfolio Growth</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: BLACK, letterSpacing: -1, lineHeight: 1 }}>+24.5%</span>
              <span style={{ fontSize: 11, color: "#22a05a", fontWeight: 600 }}>↑ YTD</span>
            </div>
          </div>
          <div style={{ backgroundColor: "#F3FFD6", border: "1.5px solid " + LIME, borderRadius: 20, padding: "4px 9px" }}>
            <span style={{ fontSize: 10, color: "#4a7c00", fontWeight: 700 }}>▲ All Time High</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 13 }}>
          {[
            { label: "Total Assets", val: "$48,290", sub: "+$2,840 this mo" },
            { label: "Annualised",   val: "31.2%",   sub: "vs 11.4% index" },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, backgroundColor: "#F7F7F7", borderRadius: 11, padding: "7px 10px" }}>
              <div style={{ fontSize: 9, color: "#AAAAAA", fontWeight: 500, marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: BLACK }}>{s.val}</div>
              <div style={{ fontSize: 9, color: "#22a05a", fontWeight: 500, marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 68, marginBottom: 7 }}>
          {BARS.map((b, i) => {
            const isLast = i === BARS.length - 1;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end", position: "relative" }}>
                  {isLast && risen && (
                    <div style={{
                      position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)",
                      backgroundColor: BLACK, color: "#fff", fontSize: 8, fontWeight: 700,
                      padding: "2px 5px", borderRadius: 4, whiteSpace: "nowrap", zIndex: 2,
                    }}>$29.7k</div>
                  )}
                  <div style={{
                    width: "100%",
                    height: risen ? b.pct + "%" : "3%",
                    backgroundColor: isLast ? LIME : i === 3 ? "#D0EBFF" : "#EDEDED",
                    borderRadius: "4px 4px 3px 3px",
                    transition: "height 0.75s cubic-bezier(0.34,1.4,0.64,1)",
                    transitionDelay: (i * 55) + "ms",
                  }}/>
                </div>
                <span style={{ fontSize: 8, color: "#BBBBBB", marginTop: 4 }}>{b.month}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 10, borderTop: "1px solid #F2F2F2" }}>
          {[{ label: "Stocks", color: LIME },{ label: "Crypto", color: "#5B50D6" },{ label: "ETF", color: "#D0EBFF" }].map((a) => (
            <div key={a.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: a.color, border: "1px solid rgba(0,0,0,0.08)" }}/>
              <span style={{ fontSize: 9, color: "#999" }}>{a.label}</span>
            </div>
          ))}
          <div style={{ flex: 1 }}/>
          <span style={{ fontSize: 9, color: "#CCCCCC" }}>Jul 2024</span>
        </div>
      </div>
    </div>
  );
}

const SLIDES = [
  { headline: "The Modern Way\nYour Money",  sub: "Spend, save, and grow your money all together in one place." },
  { headline: "Pay Your Way\nWorldwide",     sub: "Tap, swipe, or transfer — your money goes where you go." },
  { headline: "Watch Your\nMoney Grow",      sub: "Track investments and savings goals with real-time insights." },
];

// ─── SCREEN: Onboarding ───────────────────────────────────────────────────────
function ScreenOnboarding({ push }: { push: (s: Screen) => void }) {
  const [idx, setIdx] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const touchX = useRef(0);

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % 3), 2800);
    return () => clearInterval(id);
  }, [autoplay]);

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; setAutoplay(false); };
  const onTouchEnd   = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx < -40) setIdx((i) => Math.min(i + 1, 2));
    else if (dx > 40) setIdx((i) => Math.max(i - 1, 0));
    setTimeout(() => setAutoplay(true), 4000);
  };

  const slides = [<Slide1/>, <Slide2/>, <Slide3 active={idx === 2}/>];

  return (
    <div style={{ flex: 1, backgroundColor: "#EBEBEB", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "52px 22px 4px", display: "flex" }}>
        <button onClick={() => push("signin")} style={{
          backgroundColor: "#fff", border: "1.5px solid " + BLACK,
          borderRadius: 20, padding: "6px 18px", fontSize: 14, fontWeight: 500, cursor: "pointer",
        }}>Skip</button>
      </div>
      <div style={{ position: "relative", overflow: "hidden", height: 210, flexShrink: 0 }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div style={{ display: "flex", transform: "translateX(" + (-idx * 100) + "%)", transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)", height: "100%" }}>
          {slides.map((slide, i) => (
            <div key={i} style={{ width: "100%", flexShrink: 0, height: "100%", display: "flex" }}>{slide}</div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, backgroundColor: "#fff", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: "20px 26px 28px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {SLIDES.map((_, i) => (
            <div key={i} onClick={() => { setIdx(i); setAutoplay(false); }} style={{
              height: 8, borderRadius: 4, width: i === idx ? 24 : 8,
              backgroundColor: BLACK, opacity: i === idx ? 1 : 0.25, transition: "all 0.3s", cursor: "pointer",
            }}/>
          ))}
        </div>
        <div style={{ textAlign: "center", marginBottom: 18, minHeight: 85, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 23, fontWeight: 700, color: BLACK, lineHeight: 1.3, letterSpacing: -0.3, marginBottom: 9, whiteSpace: "pre-line" }}>{SLIDES[idx].headline}</div>
          <div style={{ fontSize: 13, color: "#8A8A8A", lineHeight: 1.6 }}>{SLIDES[idx].sub}</div>
        </div>
        <button onClick={() => push("signup")} style={{
          width: "100%", backgroundColor: LIME, border: "none",
          borderRadius: 28, height: 52, fontSize: 16, fontWeight: 700, color: BLACK, cursor: "pointer", marginBottom: 13,
        }}>Get Started</button>
        <div style={{ fontSize: 13, color: "#8A8A8A" }}>
          Already have an account?{" "}
          <span onClick={() => push("signin")} style={{ fontWeight: 600, color: BLACK, cursor: "pointer" }}>Sign In</span>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: Sign Up ──────────────────────────────────────────────────────────
function ScreenSignUp({ push, pop }: { push: (s: Screen) => void; pop: () => void }) {
  const [showPw, setShowPw] = useState(false);
  return (
    <div style={{ flex: 1, backgroundColor: "#fff", display: "flex", flexDirection: "column", overflowY: "auto", padding: "52px 24px 30px" }}>
      <CloseBtn onPress={pop}/>
      <div style={{ marginTop: 26, fontSize: 27, fontWeight: 700, color: BLACK, letterSpacing: -0.3, marginBottom: 8 }}>Welcome to QPay</div>
      <div style={{ fontSize: 14, color: "#888", lineHeight: 1.6, marginBottom: 26 }}>Create a commitment-free profile to<br/>explore financial products</div>

      <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Full name</div>
      <input type="text" placeholder="John Doe" style={{ width: "100%", height: 52, backgroundColor: "#F5F5F5", border: "none", borderRadius: 12, padding: "0 16px", fontSize: 15, color: BLACK, boxSizing: "border-box", outline: "none", marginBottom: 18 }}/>

      <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Your email</div>
      <input type="email" placeholder="johndoe@mail.com" style={{ width: "100%", height: 52, backgroundColor: "#F5F5F5", border: "none", borderRadius: 12, padding: "0 16px", fontSize: 15, color: BLACK, boxSizing: "border-box", outline: "none", marginBottom: 18 }}/>

      <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Password</div>
      <div style={{ display: "flex", alignItems: "center", backgroundColor: "#F5F5F5", borderRadius: 12, height: 52, paddingRight: 12 }}>
        <input type={showPw ? "text" : "password"} style={{ flex: 1, height: "100%", backgroundColor: "transparent", border: "none", padding: "0 16px", fontSize: 15, color: BLACK, outline: "none" }}/>
        <button onClick={() => setShowPw(!showPw)} style={{ background: "none", border: "none", cursor: "pointer", color: "#AAAAAA", fontSize: 17, padding: 4, lineHeight: 1 }}>{showPw ? "◉" : "◎"}</button>
      </div>

      <button onClick={() => push("phone-verify")} style={{ width: "100%", backgroundColor: LIME, border: "none", borderRadius: 28, height: 54, fontSize: 16, fontWeight: 700, color: BLACK, cursor: "pointer", marginTop: 24, marginBottom: 16 }}>Sign Up</button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 1, backgroundColor: "#E8E8E8" }}/>
        <span style={{ fontSize: 12, color: "#AAAAAA" }}>Or sign up with</span>
        <div style={{ flex: 1, height: 1, backgroundColor: "#E8E8E8" }}/>
      </div>
      <button style={{ width: "100%", height: 52, border: "1.5px solid #D0D0D0", borderRadius: 12, backgroundColor: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
        <svg width="18" height="20" viewBox="0 0 18 22" fill={BLACK}><path d="M12.6 0c.1 1.4-.4 2.8-1.2 3.8-.8 1-2 1.7-3.2 1.6C8 4 8.6 2.6 9.4 1.6 10.3.5 11.6-.1 12.6 0zM17 15.6c-.5 1.1-1 2.1-1.6 3-.9 1.4-1.9 2.8-3.4 2.8-1.4 0-1.9-.9-3.5-.9-1.7 0-2.2.9-3.5.9-1.5 0-2.5-1.3-3.5-2.7C.2 16.7-.6 13.1.8 10c.9-2 2.6-3.3 4.5-3.3 1.5 0 2.5.9 3.7.9 1.2 0 1.9-.9 3.6-.9 1.5 0 3 .8 4 2.2-3.5 1.9-2.9 6.8.4 6.7z"/></svg>
        <span style={{ fontSize: 15, fontWeight: 600, color: BLACK }}>Apple</span>
      </button>
      <button style={{ width: "100%", height: 52, border: "1.5px solid #D0D0D0", borderRadius: 12, backgroundColor: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.2 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9L37 9.7C33.6 6.6 29 4.8 24 4.8 13.4 4.8 4.8 13.4 4.8 24S13.4 43.2 24 43.2c10 0 19.2-7.3 19.2-19.2 0-1.3-.1-2.7-.4-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.2 19 12 24 12c3 0 5.7 1.1 7.8 2.9L37 9.7C33.6 6.6 29 4.8 24 4.8c-7.6 0-14.2 4.4-17.7 10z"/><path fill="#4CAF50" d="M24 43.2c4.9 0 9.4-1.7 12.8-4.6l-5.9-5c-1.8 1.3-4 2-6.9 2-5.2 0-9.6-3.5-11.2-8.4L6.4 32c3.5 6.2 10.2 11.2 17.6 11.2z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.7 2-2 3.7-3.6 4.9l5.9 5C40.8 35 43.2 30 43.2 24c0-1.3-.1-2.7-.4-4z"/></svg>
        <span style={{ fontSize: 15, fontWeight: 600, color: BLACK }}>Google</span>
      </button>
    </div>
  );
}

// ─── SCREEN: Phone Verify ─────────────────────────────────────────────────────
function ScreenPhoneVerify({ pop }: { pop: () => void }) {
  const [phone, setPhone] = useState("8976");
  return (
    <div style={{ flex: 1, backgroundColor: "#fff", display: "flex", flexDirection: "column" }}>
      {/* Top content */}
      <div style={{ padding: "52px 22px 0", display: "flex", flexDirection: "column", flex: 1 }}>
        <CloseBtn onPress={pop}/>
        <div style={{ marginTop: 28, fontSize: 28, fontWeight: 800, color: BLACK, lineHeight: 1.25, marginBottom: 10 }}>
          Verify your phone<br/>number with a code
        </div>
        <div style={{ fontSize: 15, color: "#888", marginBottom: 28 }}>We will send you confirmation code</div>

        <div style={{ fontSize: 14, color: "#888", marginBottom: 10 }}>Phone number</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          {/* Country code */}
          <div style={{
            width: 62, height: 50, backgroundColor: "#F2F2F2",
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 500, color: BLACK, flexShrink: 0,
          }}>+65</div>
          {/* Phone input */}
          <div style={{
            flex: 1, height: 50, border: "1.5px solid " + BLACK,
            borderRadius: 10, display: "flex", alignItems: "center", padding: "0 14px",
          }}>
            <span style={{ fontSize: 16, color: BLACK }}>{phone}</span>
            <span style={{ width: 2, height: 20, backgroundColor: BLACK, marginLeft: 1, animation: "none" }}/>
          </div>
        </div>

        <LimeBtn label="Send Code"/>
        <div style={{ flex: 1 }}/>
      </div>

      {/* Numpad */}
      <div style={{ padding: "0 20px" }}>
        <NumPad
          value={phone}
          onChange={setPhone}
          bottomLabel="Resend code via email"
          bottomLabelColor="#0D9488"
        />
      </div>
    </div>
  );
}

// ─── SCREEN: Sign In ──────────────────────────────────────────────────────────
function ScreenSignIn({ push, pop }: { push: (s: Screen) => void; pop: () => void }) {
  const [showPw, setShowPw] = useState(false);
  return (
    <div style={{ flex: 1, backgroundColor: "#fff", display: "flex", flexDirection: "column", overflowY: "auto", padding: "52px 24px 30px" }}>
      {/* Emoji avatar */}
      <div style={{
        width: 52, height: 52, borderRadius: 16, backgroundColor: "#FFF3DC",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, marginBottom: 26, flexShrink: 0,
      }}>🎒</div>

      <div style={{ fontSize: 28, fontWeight: 700, color: BLACK, letterSpacing: -0.3, marginBottom: 6 }}>Welcome back</div>
      <div style={{ fontSize: 15, color: "#888", lineHeight: 1.6, marginBottom: 28 }}>Sign in to your account</div>

      <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Your email</div>
      <input type="email" placeholder="johndoe@mail.com" style={{ width: "100%", height: 52, backgroundColor: "#F5F5F5", border: "none", borderRadius: 12, padding: "0 16px", fontSize: 15, color: BLACK, boxSizing: "border-box", outline: "none", marginBottom: 18 }}/>

      <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Password</div>
      <div style={{ display: "flex", alignItems: "center", backgroundColor: "#F5F5F5", borderRadius: 12, height: 52, paddingRight: 12, marginBottom: 0 }}>
        <input type={showPw ? "text" : "password"} style={{ flex: 1, height: "100%", backgroundColor: "transparent", border: "none", padding: "0 16px", fontSize: 15, color: BLACK, outline: "none" }}/>
        <button onClick={() => setShowPw(!showPw)} style={{ background: "none", border: "none", cursor: "pointer", color: "#AAAAAA", fontSize: 17, padding: 4, lineHeight: 1 }}>{showPw ? "◉" : "◎"}</button>
      </div>

      <button style={{ width: "100%", backgroundColor: LIME, border: "none", borderRadius: 28, height: 54, fontSize: 16, fontWeight: 700, color: BLACK, cursor: "pointer", marginTop: 24, marginBottom: 12 }}>Sign In</button>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <span onClick={() => push("reset-password")} style={{ fontSize: 15, fontWeight: 600, color: INDIGO, cursor: "pointer" }}>Forgot Password?</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 1, backgroundColor: "#E8E8E8" }}/>
        <span style={{ fontSize: 12, color: "#AAAAAA" }}>Or sign in with</span>
        <div style={{ flex: 1, height: 1, backgroundColor: "#E8E8E8" }}/>
      </div>
      <button style={{ width: "100%", height: 52, border: "1.5px solid #D0D0D0", borderRadius: 12, backgroundColor: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
        <svg width="18" height="20" viewBox="0 0 18 22" fill={BLACK}><path d="M12.6 0c.1 1.4-.4 2.8-1.2 3.8-.8 1-2 1.7-3.2 1.6C8 4 8.6 2.6 9.4 1.6 10.3.5 11.6-.1 12.6 0zM17 15.6c-.5 1.1-1 2.1-1.6 3-.9 1.4-1.9 2.8-3.4 2.8-1.4 0-1.9-.9-3.5-.9-1.7 0-2.2.9-3.5.9-1.5 0-2.5-1.3-3.5-2.7C.2 16.7-.6 13.1.8 10c.9-2 2.6-3.3 4.5-3.3 1.5 0 2.5.9 3.7.9 1.2 0 1.9-.9 3.6-.9 1.5 0 3 .8 4 2.2-3.5 1.9-2.9 6.8.4 6.7z"/></svg>
        <span style={{ fontSize: 15, fontWeight: 600, color: BLACK }}>Apple</span>
      </button>
      <button style={{ width: "100%", height: 52, border: "1.5px solid #D0D0D0", borderRadius: 12, backgroundColor: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.2 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9L37 9.7C33.6 6.6 29 4.8 24 4.8 13.4 4.8 4.8 13.4 4.8 24S13.4 43.2 24 43.2c10 0 19.2-7.3 19.2-19.2 0-1.3-.1-2.7-.4-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.2 19 12 24 12c3 0 5.7 1.1 7.8 2.9L37 9.7C33.6 6.6 29 4.8 24 4.8c-7.6 0-14.2 4.4-17.7 10z"/><path fill="#4CAF50" d="M24 43.2c4.9 0 9.4-1.7 12.8-4.6l-5.9-5c-1.8 1.3-4 2-6.9 2-5.2 0-9.6-3.5-11.2-8.4L6.4 32c3.5 6.2 10.2 11.2 17.6 11.2z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.7 2-2 3.7-3.6 4.9l5.9 5C40.8 35 43.2 30 43.2 24c0-1.3-.1-2.7-.4-4z"/></svg>
        <span style={{ fontSize: 15, fontWeight: 600, color: BLACK }}>Google</span>
      </button>
    </div>
  );
}

// ─── SCREEN: Reset Password ───────────────────────────────────────────────────
function ScreenResetPassword({ push, pop }: { push: (s: Screen) => void; pop: () => void }) {
  const [email, setEmail] = useState("jennifer");
  return (
    <div style={{ flex: 1, backgroundColor: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "52px 24px 0", display: "flex", flexDirection: "column" }}>
        {/* Money bag emoji */}
        <div style={{
          width: 52, height: 52, borderRadius: 16, backgroundColor: "#FFF3DC",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, marginBottom: 26, flexShrink: 0,
        }}>💰</div>

        <div style={{ fontSize: 30, fontWeight: 800, color: BLACK, letterSpacing: -0.5, marginBottom: 10 }}>Reset Password</div>
        <div style={{ fontSize: 15, color: "#555", lineHeight: 1.55, marginBottom: 28 }}>
          Enter the email address associated<br/>with your account
        </div>

        <div style={{ fontSize: 14, color: "#888", marginBottom: 10 }}>Your email</div>
        {/* Bordered input (not filled) */}
        <div style={{
          height: 52, border: "1.5px solid " + BLACK,
          borderRadius: 12, display: "flex", alignItems: "center", padding: "0 16px", marginBottom: 22,
        }}>
          <span style={{ fontSize: 15, color: BLACK }}>{email}</span>
          <span style={{ width: 2, height: 20, backgroundColor: BLACK, marginLeft: 1 }}/>
        </div>

        <LimeBtn label="Continue" onClick={() => push("verify-code")}/>
      </div>

      <div style={{ flex: 1 }}/>

      {/* iOS QWERTY keyboard */}
      <IOSKeyboard/>
    </div>
  );
}

// ─── SCREEN: Verify Code ──────────────────────────────────────────────────────
function ScreenVerifyCode({ pop }: { pop: () => void }) {
  const [code, setCode] = useState("55");
  const digits = code.split("").concat(["","","",""]).slice(0, 4);

  return (
    <div style={{ flex: 1, backgroundColor: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "52px 22px 0", display: "flex", flexDirection: "column", flex: 1 }}>
        <CloseBtn onPress={pop}/>

        <div style={{ marginTop: 28, fontSize: 28, fontWeight: 800, color: BLACK, lineHeight: 1.25, marginBottom: 10 }}>
          Verify your Code
        </div>
        <div style={{ fontSize: 15, color: BLACK, lineHeight: 1.55, marginBottom: 28 }}>
          Enter the security code we sent to<br/>
          <span style={{ color: BLACK }}>*********341</span>
        </div>

        {/* OTP boxes */}
        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          {[0,1,2,3].map((i) => {
            const filled = i < code.length;
            const focused = i === code.length && i < 4;
            return (
              <div key={i} style={{
                flex: 1, height: 64,
                backgroundColor: filled || (!focused && !filled) ? "#F2F2F2" : "#fff",
                border: focused ? "2px solid " + BLACK : "none",
                borderRadius: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, fontWeight: 600, color: BLACK,
              }}>
                {filled ? digits[i] : focused ? (
                  <span style={{ width: 2, height: 28, backgroundColor: BLACK, display: "inline-block" }}/>
                ) : ""}
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 15, color: INDIGO, fontWeight: 500, cursor: "pointer" }}>Didn't receive a code?</span>
        </div>

        <div style={{ flex: 1 }}/>

        <LimeBtn label="Done"/>
        <div style={{ height: 16 }}/>
      </div>

      {/* Partial numpad (4–9, *, 0, ⌫) */}
      <div style={{ padding: "0 20px" }}>
        <NumPadPartial value={code} onChange={(v) => setCode(v.slice(0,4))}/>
      </div>
    </div>
  );
}

// ─── Phone app — stack-based navigation ──────────────────────────────────────
function PhoneApp() {
  const [stack, setStack] = useState<Screen[]>(["onboarding"]);
  const current = stack[stack.length - 1];

  const push = (s: Screen) => setStack((prev) => [...prev, s]);
  const pop  = () => setStack((prev) => prev.length > 1 ? prev.slice(0, -1) : prev);

  // Each screen's x-offset = (stack.lastIndexOf(screen) - (stack.length-1)) * 100%
  // If screen not in stack → 100% (offscreen right, ready to slide in)
  function getX(s: Screen) {
    const idx = stack.lastIndexOf(s);
    if (idx === -1) return 100;
    return (idx - (stack.length - 1)) * 100;
  }

  const screens: Screen[] = ["onboarding","signup","phone-verify","signin","reset-password","verify-code"];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      <StatusBar/>
      <DynamicIsland/>

      <div style={{ flex: 1, position: "relative", overflow: "hidden", marginTop: 44 }}>
        {screens.map((s) => (
          <div key={s} style={{
            position: "absolute", inset: 0,
            transform: "translateX(" + getX(s) + "%)",
            transition: "transform 0.38s cubic-bezier(0.4,0,0.2,1)",
            display: "flex", flexDirection: "column",
            backgroundColor: "#fff",
            willChange: "transform",
          }}>
            {s === "onboarding"      && <ScreenOnboarding push={push}/>}
            {s === "signup"          && <ScreenSignUp push={push} pop={pop}/>}
            {s === "phone-verify"    && <ScreenPhoneVerify pop={pop}/>}
            {s === "signin"          && <ScreenSignIn push={push} pop={pop}/>}
            {s === "reset-password"  && <ScreenResetPassword push={push} pop={pop}/>}
            {s === "verify-code"     && <ScreenVerifyCode pop={pop}/>}
          </div>
        ))}
      </div>

      {/* Home bar only on white-bg screens */}
      <HomeBar/>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export function IPhoneExpoPreview() {
  const phoneW = 340, phoneH = 720, borderR = 44;

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#0F0F0F",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 20,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
    }}>
      {/* Expo Go label */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #333", fontSize: 18 }}>⬡</div>
        <div>
          <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Expo Go</div>
          <div style={{ color: "#888", fontSize: 11 }}>QPay · Development build</div>
        </div>
        <div style={{ marginLeft: 8, backgroundColor: "#1a3a1a", border: "1px solid #2a6a2a", borderRadius: 20, padding: "3px 10px" }}>
          <span style={{ color: "#4caf50", fontSize: 11, fontWeight: 600 }}>● LIVE</span>
        </div>
      </div>

      {/* iPhone body */}
      <div style={{
        width: phoneW, height: phoneH, borderRadius: borderR, backgroundColor: "#1A1A1A",
        boxShadow: "0 0 0 1px #333, 0 0 0 3px #111, 0 30px 80px rgba(0,0,0,0.8)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", left: -3, top: 118, width: 3, height: 30, backgroundColor: "#2a2a2a", borderRadius: "2px 0 0 2px" }}/>
        <div style={{ position: "absolute", left: -3, top: 162, width: 3, height: 54, backgroundColor: "#2a2a2a", borderRadius: "2px 0 0 2px" }}/>
        <div style={{ position: "absolute", left: -3, top: 228, width: 3, height: 54, backgroundColor: "#2a2a2a", borderRadius: "2px 0 0 2px" }}/>
        <div style={{ position: "absolute", right: -3, top: 160, width: 3, height: 78, backgroundColor: "#2a2a2a", borderRadius: "0 2px 2px 0" }}/>

        <div style={{
          position: "absolute", top: 10, left: 10, right: 10, bottom: 10,
          borderRadius: borderR - 6, overflow: "hidden",
          backgroundColor: "#EBEBEB", display: "flex", flexDirection: "column",
        }}>
          <PhoneApp/>
        </div>
      </div>

      {/* Tunnel URL */}
      <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: "10px 20px", textAlign: "center" }}>
        <div style={{ color: "#666", fontSize: 11, marginBottom: 4 }}>Tunnel URL (scan in Expo Go)</div>
        <div style={{ color: LIME, fontSize: 11, fontFamily: "monospace", fontWeight: 600 }}>exp://iiorfvo-anonymous-8082.exp.direct</div>
      </div>
    </div>
  );
}
