const LIME   = "#C8FF00";
const TUNNEL = "exp://iiorfvo-anonymous-8082.exp.direct";
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(TUNNEL)}`;

const STEPS = [
  { icon: "📲", text: "Download Expo Go from the App Store" },
  { icon: "📷", text: "Open the Camera app (iOS) or Expo Go" },
  { icon: "✅", text: "Scan the QR code — PayVora opens instantly" },
];

export function ExpoGoLauncher() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0F0F0F",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 0,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
      padding: "32px 28px",
      boxSizing: "border-box",
    }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: "linear-gradient(135deg, #1a1a3e 0%, #3730a3 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.12)", fontSize: 22,
        }}>⬡</div>
        <div>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>Expo Go</div>
          <div style={{ color: "#666", fontSize: 12, marginTop: 1 }}>PayVora · iOS Preview</div>
        </div>
        <div style={{
          marginLeft: 6,
          background: "linear-gradient(135deg, #14532d, #166534)",
          border: "1px solid #22c55e44",
          borderRadius: 20, padding: "4px 12px",
        }}>
          <span style={{ color: "#4ade80", fontSize: 11, fontWeight: 700 }}>● LIVE</span>
        </div>
      </div>

      {/* QR card */}
      <div style={{
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 24px 60px rgba(0,0,0,0.6)",
        width: "100%",
        maxWidth: 320,
        marginBottom: 28,
      }}>
        {/* QR code */}
        <img
          src={QR_URL}
          alt="Expo Go QR Code"
          width={220}
          height={220}
          style={{ borderRadius: 12, display: "block" }}
        />

        {/* Pulse ring */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            backgroundColor: "#22c55e",
            boxShadow: "0 0 0 3px rgba(34,197,94,0.25)",
          }}/>
          <span style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>
            Tunnel active · Metro bundled
          </span>
        </div>

        {/* URL pill */}
        <div style={{
          backgroundColor: "#F5F5F5",
          borderRadius: 10,
          padding: "8px 14px",
          width: "100%",
          boxSizing: "border-box",
        }}>
          <div style={{ fontSize: 10, color: "#999", marginBottom: 3, fontWeight: 500, letterSpacing: 0.5, textTransform: "uppercase" }}>
            Tunnel URL
          </div>
          <div style={{
            fontSize: 11, color: "#1A1A1A",
            fontFamily: "ui-monospace, 'SF Mono', monospace",
            fontWeight: 600, wordBreak: "break-all",
          }}>
            {TUNNEL}
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
        {STEPS.map((step, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 14,
            backgroundColor: "#1a1a1a",
            borderRadius: 14,
            padding: "12px 16px",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: "#2a2a2a",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
            }}>{step.icon}</div>
            <div>
              <div style={{ color: "#888", fontSize: 10, fontWeight: 600, letterSpacing: 0.5, marginBottom: 2 }}>STEP {i + 1}</div>
              <div style={{ color: "#e0e0e0", fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{step.text}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Lime CTA strip */}
      <div style={{
        width: "100%", maxWidth: 320,
        backgroundColor: LIME,
        borderRadius: 16,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <div style={{ fontSize: 24 }}>📱</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>Open in Expo Go</div>
          <div style={{ fontSize: 11, color: "#333", marginTop: 2 }}>
            Works on iPhone &amp; Android
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <div style={{ color: "#444", fontSize: 11 }}>
          Or scan with the <span style={{ color: "#888", fontWeight: 600 }}>iOS Camera app</span> directly
        </div>
      </div>

    </div>
  );
}
