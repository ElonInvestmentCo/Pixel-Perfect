import { useState, useEffect, useRef } from "react";

const LIME  = "#C8FF00";
const BLACK = "#1A1A1A";

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
function StatusBar({ light = false }: { light?: boolean }) {
  const time = useClockTime();
  const fg = light ? "#fff" : BLACK;
  return (
    <div style={{
      position: "absolute", top: 14, left: 0, right: 0, zIndex: 10,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "0 30px", pointerEvents: "none",
    }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: fg }}>{time}</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {/* Signal */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill={fg}>
          <rect x="0"  y="8" width="3" height="4" rx="0.6" />
          <rect x="4.5" y="5" width="3" height="7" rx="0.6" />
          <rect x="9"  y="2" width="3" height="10" rx="0.6" />
          <rect x="13.5" y="0" width="3" height="12" rx="0.6" />
        </svg>
        {/* WiFi */}
        <svg width="17" height="13" viewBox="0 0 17 13" fill="none" stroke={fg} strokeWidth="1.6" strokeLinecap="round">
          <path d="M1 4C4.5 0.5 12.5 0.5 16 4" />
          <path d="M3.5 6.5C5.8 4.2 11.2 4.2 13.5 6.5" />
          <path d="M6 9C7.3 7.7 9.7 7.7 11 9" />
          <circle cx="8.5" cy="11.5" r="1.2" fill={fg} stroke="none" />
        </svg>
        {/* Battery */}
        <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
          <div style={{
            width: 25, height: 13, borderRadius: 3,
            border: "1.5px solid " + fg, padding: 2, display: "flex",
          }}>
            <div style={{ width: "82%", backgroundColor: fg, borderRadius: 1.5 }} />
          </div>
          <div style={{ width: 2, height: 6, backgroundColor: fg, borderRadius: 1 }} />
        </div>
      </div>
    </div>
  );
}

function HomeBar() {
  return (
    <div style={{
      position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
      width: 120, height: 5, backgroundColor: BLACK, borderRadius: 3, opacity: 0.2,
    }} />
  );
}

function DynamicIsland() {
  return (
    <div style={{
      position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
      zIndex: 20, width: 120, height: 34, backgroundColor: "#000", borderRadius: 20,
    }} />
  );
}

// ─── Slide 1 — Balance card ───────────────────────────────────────────────────
function Slide1() {
  return (
    <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
      <div style={{ width: "100%", backgroundColor: "#fff", borderRadius: 20, border: "1.5px solid #D8D8D8", padding: 20 }}>
        <div style={{ fontSize: 13, color: "#8A8A8A", marginBottom: 4 }}>Total Balance</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: BLACK, margin: "10px 0", letterSpacing: -0.5 }}>$0.00</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {["Transfer", "Receive"].map((label, i) => (
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
            width: 40, height: 40, borderRadius: "50%",
            backgroundColor: LIME, border: "1.5px solid " + BLACK,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer",
          }}>☰</div>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 2 — Credit cards ───────────────────────────────────────────────────
function GoldChip() {
  return (
    <div style={{
      width: 30, height: 22, borderRadius: 4, backgroundColor: "#D4A843",
      position: "relative", overflow: "hidden", flexShrink: 0,
    }}>
      <div style={{ position: "absolute", width: "100%", height: 2, top: "50%", transform: "translateY(-50%)", backgroundColor: "#B8882A", opacity: 0.6 }} />
      <div style={{ position: "absolute", height: "100%", width: 2, left: "50%", transform: "translateX(-50%)", backgroundColor: "#B8882A", opacity: 0.6 }} />
    </div>
  );
}

function Slide2() {
  const cW = 210, cH = 128;
  return (
    <div style={{ padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
      <div style={{ width: "100%", position: "relative", height: cH + 55 }}>
        {/* Purple card */}
        <div style={{
          position: "absolute", width: cW, height: cH,
          borderRadius: 16, padding: 15, backgroundColor: "#5B50D6",
          top: 0, left: 8, transform: "rotate(-6deg)", overflow: "hidden",
        }}>
          <GoldChip />
          <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, letterSpacing: 1, margin: "10px 0 5px" }}>5643 7890</div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 11 }}>Jennifer Lopez</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, marginTop: 2 }}>Exp 03/28</div>
        </div>
        {/* Lime card */}
        <div style={{
          position: "absolute", width: cW, height: cH,
          borderRadius: 16, padding: 15, backgroundColor: LIME,
          bottom: 0, right: 0, transform: "rotate(-1.5deg)", overflow: "hidden",
        }}>
          <GoldChip />
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

// ─── Slide 3 — Premium analytics card ─────────────────────────────────────────
const BARS = [
  { month: "Jan", pct: 38 },
  { month: "Feb", pct: 58 },
  { month: "Mar", pct: 45 },
  { month: "Apr", pct: 75 },
  { month: "May", pct: 52 },
  { month: "Jun", pct: 68 },
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

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: "#9A9A9A", fontWeight: 500, letterSpacing: 0.4, marginBottom: 2 }}>
              Portfolio Growth
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: BLACK, letterSpacing: -1, lineHeight: 1 }}>
                +24.5%
              </span>
              <span style={{ fontSize: 11, color: "#22a05a", fontWeight: 600 }}>↑ YTD</span>
            </div>
          </div>
          <div style={{
            backgroundColor: "#F3FFD6", border: "1.5px solid " + LIME,
            borderRadius: 20, padding: "4px 9px",
          }}>
            <span style={{ fontSize: 10, color: "#4a7c00", fontWeight: 700 }}>▲ All Time High</span>
          </div>
        </div>

        {/* Mini stat tiles */}
        <div style={{ display: "flex", gap: 8, marginBottom: 13 }}>
          {[
            { label: "Total Assets", val: "$48,290", sub: "+$2,840 this mo", pos: true },
            { label: "Annualised",   val: "31.2%",   sub: "vs 11.4% index",  pos: true },
          ].map((s) => (
            <div key={s.label} style={{
              flex: 1, backgroundColor: "#F7F7F7", borderRadius: 11, padding: "7px 10px",
            }}>
              <div style={{ fontSize: 9, color: "#AAAAAA", fontWeight: 500, marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: BLACK }}>{s.val}</div>
              <div style={{ fontSize: 9, color: "#22a05a", fontWeight: 500, marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 68, marginBottom: 7 }}>
          {BARS.map((b, i) => {
            const isLast = i === BARS.length - 1;
            const isPeak = i === 3;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end", position: "relative" }}>
                  {isLast && risen && (
                    <div style={{
                      position: "absolute", top: -18, left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: BLACK, color: "#fff",
                      fontSize: 8, fontWeight: 700,
                      padding: "2px 5px", borderRadius: 4, whiteSpace: "nowrap",
                      zIndex: 2,
                    }}>$29.7k</div>
                  )}
                  <div style={{
                    width: "100%",
                    height: risen ? b.pct + "%" : "3%",
                    backgroundColor: isLast ? LIME : isPeak ? "#D0EBFF" : "#EDEDED",
                    borderRadius: "4px 4px 3px 3px",
                    transition: "height 0.75s cubic-bezier(0.34,1.4,0.64,1)",
                    transitionDelay: (i * 55) + "ms",
                  }} />
                </div>
                <span style={{ fontSize: 8, color: "#BBBBBB", marginTop: 4 }}>{b.month}</span>
              </div>
            );
          })}
        </div>

        {/* Allocation legend */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, paddingTop: 10,
          borderTop: "1px solid #F2F2F2",
        }}>
          {[
            { label: "Stocks", color: LIME },
            { label: "Crypto", color: "#5B50D6" },
            { label: "ETF",    color: "#D0EBFF" },
          ].map((a) => (
            <div key={a.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: a.color, border: "1px solid rgba(0,0,0,0.08)" }} />
              <span style={{ fontSize: 9, color: "#999" }}>{a.label}</span>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 9, color: "#CCCCCC" }}>Jul 2024</span>
        </div>
      </div>
    </div>
  );
}

// ─── Slide metadata ───────────────────────────────────────────────────────────
const SLIDES = [
  { id: "balance", headline: "The Modern Way\nYour Money",  sub: "Spend, save, and grow your money all together in one place." },
  { id: "cards",   headline: "Pay Your Way\nWorldwide",     sub: "Tap, swipe, or transfer — your money goes where you go." },
  { id: "growth",  headline: "Watch Your\nMoney Grow",      sub: "Track investments and savings goals with real-time insights." },
];

// ─── Onboarding screen ────────────────────────────────────────────────────────
function OnboardingScreen({ onGetStarted, onSkip }: { onGetStarted: () => void; onSkip: () => void }) {
  const [idx, setIdx] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const touchX = useRef(0);

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % 3), 2800);
    return () => clearInterval(id);
  }, [autoplay]);

  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
    setAutoplay(false);
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx < -40) setIdx((i) => Math.min(i + 1, 2));
    else if (dx > 40) setIdx((i) => Math.max(i - 1, 0));
    setTimeout(() => setAutoplay(true), 4000);
  }

  const slides = [<Slide1 />, <Slide2 />, <Slide3 active={idx === 2} />];

  return (
    <div style={{ flex: 1, backgroundColor: "#EBEBEB", display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Skip */}
      <div style={{ padding: "52px 22px 4px", display: "flex" }}>
        <button onClick={onSkip} style={{
          backgroundColor: "#fff", border: "1.5px solid " + BLACK,
          borderRadius: 20, padding: "6px 18px", fontSize: 14, fontWeight: 500, cursor: "pointer",
        }}>Skip</button>
      </div>

      {/* Carousel */}
      <div
        style={{ position: "relative", overflow: "hidden", height: 210, flexShrink: 0 }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div style={{
          display: "flex",
          transform: "translateX(" + (-idx * 100) + "%)",
          transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
          height: "100%",
        }}>
          {slides.map((slide, i) => (
            <div key={i} style={{ width: "100%", flexShrink: 0, height: "100%", display: "flex" }}>
              {slide}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom sheet */}
      <div style={{
        flex: 1, backgroundColor: "#fff",
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: "20px 26px 28px",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        {/* Dots */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {SLIDES.map((_, i) => (
            <div key={i} onClick={() => { setIdx(i); setAutoplay(false); }} style={{
              height: 8, borderRadius: 4,
              width: i === idx ? 24 : 8,
              backgroundColor: BLACK,
              opacity: i === idx ? 1 : 0.25,
              transition: "all 0.3s",
              cursor: "pointer",
            }} />
          ))}
        </div>

        {/* Text */}
        <div style={{ textAlign: "center", marginBottom: 18, minHeight: 85, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 23, fontWeight: 700, color: BLACK, lineHeight: 1.3, letterSpacing: -0.3, marginBottom: 9, whiteSpace: "pre-line" }}>
            {SLIDES[idx].headline}
          </div>
          <div style={{ fontSize: 13, color: "#8A8A8A", lineHeight: 1.6 }}>
            {SLIDES[idx].sub}
          </div>
        </div>

        {/* CTA */}
        <button onClick={onGetStarted} style={{
          width: "100%", backgroundColor: LIME, border: "none",
          borderRadius: 28, height: 52, fontSize: 16, fontWeight: 700,
          color: BLACK, cursor: "pointer", marginBottom: 13,
        }}>Get Started</button>

        <div style={{ fontSize: 13, color: "#8A8A8A" }}>
          Already have an account?{" "}
          <span onClick={onSkip} style={{ fontWeight: 600, color: BLACK, cursor: "pointer" }}>Sign In</span>
        </div>
      </div>
    </div>
  );
}

// ─── Sign Up screen ───────────────────────────────────────────────────────────
function SignUpScreen({ onBack }: { onBack: () => void }) {
  const [showPw, setShowPw] = useState(false);
  return (
    <div style={{
      flex: 1, backgroundColor: "#fff",
      display: "flex", flexDirection: "column",
      overflowY: "auto",
      padding: "52px 24px 30px",
    }}>
      {/* Close */}
      <button onClick={onBack} style={{
        width: 36, height: 36, borderRadius: "50%",
        backgroundColor: "#F0F0F0", border: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", marginBottom: 26, fontSize: 15, color: "#999",
        flexShrink: 0,
      }}>✕</button>

      {/* Title */}
      <div style={{ fontSize: 27, fontWeight: 700, color: BLACK, letterSpacing: -0.3, marginBottom: 8 }}>
        Welcome to QPay
      </div>
      <div style={{ fontSize: 14, color: "#888", lineHeight: 1.6, marginBottom: 26 }}>
        Create a commitment-free profile to<br />explore financial products
      </div>

      {/* Name */}
      <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Full name</div>
      <input type="text" placeholder="John Doe" style={{
        width: "100%", height: 52, backgroundColor: "#F5F5F5",
        border: "none", borderRadius: 12, padding: "0 16px",
        fontSize: 15, color: BLACK, boxSizing: "border-box",
        outline: "none", marginBottom: 18,
      }} />

      {/* Email */}
      <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Your email</div>
      <input type="email" placeholder="johndoe@mail.com" style={{
        width: "100%", height: 52, backgroundColor: "#F5F5F5",
        border: "none", borderRadius: 12, padding: "0 16px",
        fontSize: 15, color: BLACK, boxSizing: "border-box",
        outline: "none", marginBottom: 18,
      }} />

      {/* Password */}
      <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Password</div>
      <div style={{
        display: "flex", alignItems: "center",
        backgroundColor: "#F5F5F5", borderRadius: 12, height: 52,
        paddingRight: 12, marginBottom: 0,
      }}>
        <input type={showPw ? "text" : "password"} style={{
          flex: 1, height: "100%", backgroundColor: "transparent",
          border: "none", padding: "0 16px", fontSize: 15, color: BLACK, outline: "none",
        }} />
        <button onClick={() => setShowPw(!showPw)} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#AAAAAA", fontSize: 17, padding: 4, lineHeight: 1,
        }}>{showPw ? "◉" : "◎"}</button>
      </div>

      {/* CTA */}
      <button style={{
        width: "100%", backgroundColor: LIME, border: "none",
        borderRadius: 28, height: 54, fontSize: 16, fontWeight: 700,
        color: BLACK, cursor: "pointer", marginTop: 24, marginBottom: 16,
      }}>Sign Up</button>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 1, backgroundColor: "#E8E8E8" }} />
        <span style={{ fontSize: 12, color: "#AAAAAA" }}>Or sign up with</span>
        <div style={{ flex: 1, height: 1, backgroundColor: "#E8E8E8" }} />
      </div>

      {/* Apple */}
      <button style={{
        width: "100%", height: 52, border: "1.5px solid #D0D0D0",
        borderRadius: 12, backgroundColor: "#fff", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        marginBottom: 10,
      }}>
        <svg width="18" height="20" viewBox="0 0 18 22" fill="currentColor">
          <path d="M12.6 0c.1 1.4-.4 2.8-1.2 3.8-.8 1-2 1.7-3.2 1.6C8 4 8.6 2.6 9.4 1.6 10.3.5 11.6-.1 12.6 0zM17 15.6c-.5 1.1-1 2.1-1.6 3-.9 1.4-1.9 2.8-3.4 2.8-1.4 0-1.9-.9-3.5-.9-1.7 0-2.2.9-3.5.9-1.5 0-2.5-1.3-3.5-2.7C.2 16.7-.6 13.1.8 10c.9-2 2.6-3.3 4.5-3.3 1.5 0 2.5.9 3.7.9 1.2 0 1.9-.9 3.6-.9 1.5 0 3 .8 4 2.2-3.5 1.9-2.9 6.8.4 6.7z"/>
        </svg>
        <span style={{ fontSize: 15, fontWeight: 600, color: BLACK }}>Apple</span>
      </button>

      {/* Google */}
      <button style={{
        width: "100%", height: 52, border: "1.5px solid #D0D0D0",
        borderRadius: 12, backgroundColor: "#fff", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      }}>
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.2 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9L37 9.7C33.6 6.6 29 4.8 24 4.8 13.4 4.8 4.8 13.4 4.8 24S13.4 43.2 24 43.2c10 0 19.2-7.3 19.2-19.2 0-1.3-.1-2.7-.4-4z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.2 19 12 24 12c3 0 5.7 1.1 7.8 2.9L37 9.7C33.6 6.6 29 4.8 24 4.8c-7.6 0-14.2 4.4-17.7 10z"/>
          <path fill="#4CAF50" d="M24 43.2c4.9 0 9.4-1.7 12.8-4.6l-5.9-5c-1.8 1.3-4 2-6.9 2-5.2 0-9.6-3.5-11.2-8.4L6.4 32c3.5 6.2 10.2 11.2 17.6 11.2z"/>
          <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.7 2-2 3.7-3.6 4.9l5.9 5C40.8 35 43.2 30 43.2 24c0-1.3-.1-2.7-.4-4z" />
        </svg>
        <span style={{ fontSize: 15, fontWeight: 600, color: BLACK }}>Google</span>
      </button>
    </div>
  );
}

// ─── Phone app shell — manages screen state ───────────────────────────────────
type Screen = "onboarding" | "signup";

function PhoneApp() {
  const [screen, setScreen] = useState<Screen>("onboarding");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      <StatusBar />
      <DynamicIsland />

      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        marginTop: 44,
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Screen slides */}
        <div style={{
          position: "absolute", inset: 0,
          transform: screen === "onboarding" ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.38s cubic-bezier(0.4,0,0.2,1)",
          display: "flex", flexDirection: "column",
        }}>
          <OnboardingScreen
            onGetStarted={() => setScreen("signup")}
            onSkip={() => setScreen("signup")}
          />
        </div>

        <div style={{
          position: "absolute", inset: 0,
          transform: screen === "signup" ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.38s cubic-bezier(0.4,0,0.2,1)",
          display: "flex", flexDirection: "column",
        }}>
          <SignUpScreen onBack={() => setScreen("onboarding")} />
        </div>
      </div>

      <HomeBar />
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export function IPhoneExpoPreview() {
  const phoneW = 340;
  const phoneH = 720;
  const borderR = 44;

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#0F0F0F",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 20,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
    }}>
      {/* Expo Go label */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, backgroundColor: "#1a1a2e",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid #333", fontSize: 18,
        }}>⬡</div>
        <div>
          <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Expo Go</div>
          <div style={{ color: "#888", fontSize: 11 }}>QPay · Development build</div>
        </div>
        <div style={{
          marginLeft: 8, backgroundColor: "#1a3a1a", border: "1px solid #2a6a2a",
          borderRadius: 20, padding: "3px 10px",
        }}>
          <span style={{ color: "#4caf50", fontSize: 11, fontWeight: 600 }}>● LIVE</span>
        </div>
      </div>

      {/* iPhone body */}
      <div style={{
        width: phoneW, height: phoneH, borderRadius: borderR,
        backgroundColor: "#1A1A1A",
        boxShadow: "0 0 0 1px #333, 0 0 0 3px #111, 0 30px 80px rgba(0,0,0,0.8)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Buttons */}
        <div style={{ position: "absolute", left: -3, top: 118, width: 3, height: 30, backgroundColor: "#2a2a2a", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", left: -3, top: 162, width: 3, height: 54, backgroundColor: "#2a2a2a", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", left: -3, top: 228, width: 3, height: 54, backgroundColor: "#2a2a2a", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", right: -3, top: 160, width: 3, height: 78, backgroundColor: "#2a2a2a", borderRadius: "0 2px 2px 0" }} />

        {/* Screen */}
        <div style={{
          position: "absolute", top: 10, left: 10, right: 10, bottom: 10,
          borderRadius: borderR - 6, overflow: "hidden",
          backgroundColor: "#EBEBEB",
          display: "flex", flexDirection: "column",
        }}>
          <PhoneApp />
        </div>
      </div>

      {/* Tunnel URL pill */}
      <div style={{
        backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a",
        borderRadius: 12, padding: "10px 20px", textAlign: "center",
      }}>
        <div style={{ color: "#666", fontSize: 11, marginBottom: 4 }}>Tunnel URL (scan in Expo Go)</div>
        <div style={{ color: LIME, fontSize: 11, fontFamily: "monospace", fontWeight: 600 }}>
          exp://iiorfvo-anonymous-8082.exp.direct
        </div>
      </div>
    </div>
  );
}
