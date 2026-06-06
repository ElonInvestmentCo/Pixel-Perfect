import { useState, useEffect, useRef } from "react";

const LIME = "#C8FF00";
const BLACK = "#1A1A1A";

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

function StatusBar() {
  const time = useClockTime();
  return (
    <div style={{
      position: "absolute", top: 14, left: 0, right: 0, zIndex: 10,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "0 30px", pointerEvents: "none",
    }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: BLACK }}>{time}</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: BLACK }}>●●●</span>
        <span style={{ fontSize: 12, color: BLACK }}>WiFi</span>
        <span style={{ fontSize: 12, color: BLACK }}>82%</span>
      </div>
    </div>
  );
}

function HomeBar() {
  return (
    <div style={{
      position: "absolute", bottom: 8, left: "50%",
      transform: "translateX(-50%)",
      width: 120, height: 5, backgroundColor: BLACK,
      borderRadius: 3, opacity: 0.2,
    }} />
  );
}

function DynamicIsland() {
  return (
    <div style={{
      position: "absolute", top: 10, left: "50%",
      transform: "translateX(-50%)", zIndex: 20,
      width: 120, height: 34, backgroundColor: "#000", borderRadius: 20,
    }} />
  );
}

function Slide1() {
  return (
    <div style={{ padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
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

function GoldChip() {
  return (
    <div style={{
      width: 32, height: 24, borderRadius: 4, backgroundColor: "#D4A843",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden", flexShrink: 0,
    }}>
      <div style={{ position: "absolute", width: "100%", height: 2, backgroundColor: "#B8882A", opacity: 0.6 }} />
      <div style={{ position: "absolute", height: "100%", width: 2, backgroundColor: "#B8882A", opacity: 0.6 }} />
    </div>
  );
}

function Slide2() {
  const cardW = 220;
  const cardH = 135;
  return (
    <div style={{ padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
      <div style={{ width: "100%", position: "relative", height: cardH + 60 }}>
        <div style={{
          position: "absolute", width: cardW, height: cardH,
          borderRadius: 16, padding: 16, backgroundColor: "#5B50D6",
          top: 0, left: 10, transform: "rotate(-6deg)",
          overflow: "hidden",
        }}>
          <GoldChip />
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, letterSpacing: 1, margin: "10px 0 6px" }}>5643 7890</div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 11 }}>Jennifer Lopez</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, marginTop: 2 }}>Exp 03/28</div>
        </div>
        <div style={{
          position: "absolute", width: cardW, height: cardH,
          borderRadius: 16, padding: 16, backgroundColor: LIME,
          bottom: 0, right: 0, transform: "rotate(-1.5deg)",
          overflow: "hidden",
        }}>
          <GoldChip />
          <div style={{ color: BLACK, fontSize: 12, fontWeight: 600, letterSpacing: 0.5, margin: "10px 0 6px" }}>5643 7890 3281 7865</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ color: BLACK, fontSize: 11 }}>Jennifer Lopez</div>
              <div style={{ color: "#333", fontSize: 10, marginTop: 2 }}>Exp 03/28</div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: BLACK, fontStyle: "italic" }}>VISA</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slide3() {
  const bars = [40, 65, 50, 80, 55, 95, 70];
  return (
    <div style={{ padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
      <div style={{ width: "100%", backgroundColor: "#fff", borderRadius: 20, border: "1.5px solid #D8D8D8", padding: 20 }}>
        <div style={{ fontSize: 12, color: "#8A8A8A", marginBottom: 4 }}>Portfolio Growth</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: BLACK, marginBottom: 14 }}>+24.5%</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 72 }}>
          {bars.map((h, i) => (
            <div key={i} style={{
              flex: 1,
              height: h + "%",
              backgroundColor: i === bars.length - 1 ? LIME : "#E8E8E8",
              borderRadius: 5,
            }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          {["Jan","Feb","Mar","Apr","May","Jun","Jul"].map((m) => (
            <span key={m} style={{ fontSize: 9, color: "#AAAAAA" }}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const SLIDES = [
  { id: "balance", headline: "The Modern Way\nYour Money", sub: "Spend, save, and grow your money all together in one place." },
  { id: "cards",   headline: "Pay Your Way\nWorldwide",   sub: "Tap, swipe, or transfer — your money goes where you go." },
  { id: "growth",  headline: "Watch Your\nMoney Grow",    sub: "Track investments and savings goals with real-time insights." },
];

const SLIDE_RENDERS = [<Slide1 />, <Slide2 />, <Slide3 />];

function OnboardingScreen() {
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
    setTimeout(() => setAutoplay(true), 3000);
  }

  return (
    <div style={{ flex: 1, backgroundColor: "#EBEBEB", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "52px 22px 4px", display: "flex" }}>
        <button style={{
          backgroundColor: "#fff", border: "1.5px solid " + BLACK,
          borderRadius: 20, padding: "6px 18px", fontSize: 14, fontWeight: 500, cursor: "pointer",
        }}>Skip</button>
      </div>

      <div
        style={{ position: "relative", overflow: "hidden", height: 200, flexShrink: 0 }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div style={{
          display: "flex",
          transform: "translateX(" + (-idx * 100) + "%)",
          transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
          height: "100%",
        }}>
          {SLIDE_RENDERS.map((slide, i) => (
            <div key={i} style={{ width: "100%", flexShrink: 0, height: "100%", display: "flex" }}>
              {slide}
            </div>
          ))}
        </div>
      </div>

      <div style={{
        flex: 1, backgroundColor: "#fff",
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: "22px 28px 34px",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          {SLIDES.map((_, i) => (
            <div key={i} onClick={() => { setIdx(i); setAutoplay(false); }} style={{
              height: 8, borderRadius: 4,
              width: i === idx ? 24 : 8,
              backgroundColor: BLACK,
              opacity: i === idx ? 1 : 0.3,
              transition: "all 0.3s",
              cursor: "pointer",
            }} />
          ))}
        </div>

        <div style={{ textAlign: "center", marginBottom: 20, minHeight: 90, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: BLACK, lineHeight: 1.3, letterSpacing: -0.3, marginBottom: 10, whiteSpace: "pre-line" }}>
            {SLIDES[idx].headline}
          </div>
          <div style={{ fontSize: 13, color: "#8A8A8A", lineHeight: 1.6 }}>
            {SLIDES[idx].sub}
          </div>
        </div>

        <button style={{
          width: "100%", backgroundColor: LIME, border: "none",
          borderRadius: 28, height: 52, fontSize: 16, fontWeight: 700,
          color: BLACK, cursor: "pointer", marginBottom: 14,
        }}>Get Started</button>

        <div style={{ fontSize: 13, color: "#8A8A8A" }}>
          Already have an account?{" "}
          <span style={{ fontWeight: 600, color: BLACK, cursor: "pointer" }}>Sign In</span>
        </div>
      </div>
    </div>
  );
}

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
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          backgroundColor: "#1a1a2e",
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

      <div style={{
        width: phoneW, height: phoneH, borderRadius: borderR,
        backgroundColor: "#1A1A1A",
        boxShadow: "0 0 0 1px #333, 0 0 0 3px #111, 0 30px 80px rgba(0,0,0,0.8)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", left: -3, top: 120, width: 3, height: 30, backgroundColor: "#2a2a2a", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", left: -3, top: 165, width: 3, height: 55, backgroundColor: "#2a2a2a", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", left: -3, top: 232, width: 3, height: 55, backgroundColor: "#2a2a2a", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", right: -3, top: 160, width: 3, height: 80, backgroundColor: "#2a2a2a", borderRadius: "0 2px 2px 0" }} />

        <div style={{
          position: "absolute", top: 10, left: 10, right: 10, bottom: 10,
          borderRadius: borderR - 6, overflow: "hidden",
          backgroundColor: "#EBEBEB",
          display: "flex", flexDirection: "column",
        }}>
          <StatusBar />
          <DynamicIsland />
          <OnboardingScreen />
          <HomeBar />
        </div>
      </div>

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
