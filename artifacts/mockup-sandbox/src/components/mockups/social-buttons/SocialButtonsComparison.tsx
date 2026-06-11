export default function SocialButtonsComparison() {
  const btnStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "10px 18px",
    boxShadow:
      "0 1px 2px rgba(60,64,67,0.18), 0 2px 6px 2px rgba(60,64,67,0.12)",
    cursor: "pointer",
    userSelect: "none" as const,
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif",
    fontSize: "17px",
    fontWeight: 600,
    color: "#3c4043",
    letterSpacing: "0.01em",
    lineHeight: "1",
    paddingTop: "1px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f0f0f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "48px",
        padding: "48px 24px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* ── Section heading ── */}
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111", margin: 0 }}>
          ZIP Reference vs. React Native Implementation
        </h1>
        <p style={{ color: "#666", marginTop: "6px", fontSize: "14px" }}>
          Left: exact HTML/CSS from the ZIP files &nbsp;·&nbsp; Right: React Native equivalent
        </p>
      </div>

      {/* ── Comparison row ── */}
      <div style={{ display: "flex", gap: "48px", alignItems: "flex-start", flexWrap: "wrap", justifyContent: "center" }}>

        {/* ZIP REFERENCE panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "#888", textTransform: "uppercase" }}>
            ZIP Reference (HTML/CSS)
          </span>

          {/* Phone frame */}
          <div style={{
            width: "320px",
            background: "#ffffff",
            borderRadius: "28px",
            padding: "36px 24px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.14)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}>
            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ flex: 1, height: "1px", background: "#e5e5e5" }} />
              <span style={{ fontSize: "13px", color: "#999", whiteSpace: "nowrap" }}>Or sign in with</span>
              <div style={{ flex: 1, height: "1px", background: "#e5e5e5" }} />
            </div>

            {/* Buttons side-by-side */}
            <div style={{ display: "flex", gap: "12px" }}>
              {/* Apple button — exact ZIP */}
              <button style={{ ...btnStyle, flex: 1, justifyContent: "center" }}>
                <svg width="20" height="24" viewBox="0 0 170 200" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, display: "block" }}>
                  <path
                    d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929 0.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.43 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002 0.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-0.9 2.61-1.85 5.11-2.86 7.51zM119.11 7.24c0 8.102-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375-0.119-0.972-0.188-1.995-0.188-3.07 0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.311 11.45-8.597 4.62-2.254 8.99-3.498 13.1-3.71 0.12 1.083 0.17 2.166 0.17 3.241z"
                    fill="#3c4043"
                  />
                </svg>
                <span style={labelStyle}>Apple</span>
              </button>

              {/* Google button — exact ZIP */}
              <button style={{ ...btnStyle, flex: 1, justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, display: "block" }}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span style={labelStyle}>Google</span>
              </button>
            </div>

            {/* Spec callouts */}
            <div style={{
              marginTop: "8px",
              padding: "12px 14px",
              background: "#f8f9fa",
              borderRadius: "8px",
              fontSize: "11px",
              color: "#555",
              lineHeight: "1.7",
            }}>
              <strong style={{ color: "#333" }}>ZIP Spec</strong><br />
              bg: #ffffff · radius: 10px · pad: 10/18px<br />
              shadow: 0 1px 2px rgba(60,64,67,.18), 0 2px 6px 2px rgba(60,64,67,.12)<br />
              gap: 8px · font: 17px/600 · color: #3c4043<br />
              Apple SVG: 20×24 · viewBox 0 0 170 200<br />
              Google SVG: 22×22 · viewBox 0 0 24 24
            </div>
          </div>
        </div>

        {/* REACT NATIVE IMPLEMENTATION panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "#888", textTransform: "uppercase" }}>
            React Native Implementation (Web Render)
          </span>

          {/* Phone frame — same layout as the actual screens */}
          <div style={{
            width: "320px",
            background: "#ffffff",
            borderRadius: "28px",
            padding: "36px 24px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.14)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}>
            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ flex: 1, height: "1px", background: "#e5e5e5" }} />
              <span style={{ fontSize: "13px", color: "#999", whiteSpace: "nowrap" }}>Or sign in with</span>
              <div style={{ flex: 1, height: "1px", background: "#e5e5e5" }} />
            </div>

            {/* Buttons — matching RN StyleSheet values exactly */}
            <div style={{ display: "flex", gap: "12px" }}>
              {/* Apple — matches AppleSignInButton.tsx StyleSheet */}
              <button style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                backgroundColor: "#ffffff",
                border: "none",
                borderRadius: "10px",
                paddingTop: "10px",
                paddingBottom: "10px",
                paddingLeft: "18px",
                paddingRight: "18px",
                boxShadow: "0 1px 3px rgba(60,64,67,0.18)",
                cursor: "pointer",
                outline: "none",
              }}>
                <svg width="20" height="24" viewBox="0 0 170 200" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                  <path
                    d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929 0.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.43 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002 0.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-0.9 2.61-1.85 5.11-2.86 7.51zM119.11 7.24c0 8.102-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375-0.119-0.972-0.188-1.995-0.188-3.07 0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.311 11.45-8.597 4.62-2.254 8.99-3.498 13.1-3.71 0.12 1.083 0.17 2.166 0.17 3.241z"
                    fill="#3c4043"
                  />
                </svg>
                <span style={{ ...labelStyle, fontFamily: "Inter, sans-serif" }}>Apple</span>
              </button>

              {/* Google — matches GoogleSignInButton.tsx StyleSheet */}
              <button style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                backgroundColor: "#ffffff",
                border: "none",
                borderRadius: "10px",
                paddingTop: "10px",
                paddingBottom: "10px",
                paddingLeft: "18px",
                paddingRight: "18px",
                boxShadow: "0 1px 3px rgba(60,64,67,0.18)",
                cursor: "pointer",
                outline: "none",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span style={{ ...labelStyle, fontFamily: "Inter, sans-serif" }}>Google</span>
              </button>
            </div>

            {/* Spec callouts */}
            <div style={{
              marginTop: "8px",
              padding: "12px 14px",
              background: "#f0fdf4",
              borderRadius: "8px",
              fontSize: "11px",
              color: "#555",
              lineHeight: "1.7",
              border: "1px solid #bbf7d0",
            }}>
              <strong style={{ color: "#166534" }}>React Native (StyleSheet)</strong><br />
              bg: #ffffff · radius: 10 · paddingV: 10 / paddingH: 18<br />
              shadow: color #3c4043, offset 0/1, opacity 0.18, radius 3<br />
              gap: 8 · Inter_600SemiBold 17px · color: #3c4043<br />
              Apple SVG: 20×24 · viewBox 0 0 170 200<br />
              Google SVG: 22×22 · viewBox 0 0 24 24
            </div>
          </div>
        </div>
      </div>

      {/* ── Full Sign-In screen mockup ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "#888", textTransform: "uppercase" }}>
          Sign In + Sign Up — Side-by-Side Layout
        </span>
        <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", justifyContent: "center" }}>
          {["Sign In", "Sign Up"].map((screen) => (
            <div key={screen} style={{
              width: "300px",
              background: "#ffffff",
              borderRadius: "28px",
              padding: "32px 20px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
            }}>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>{screen}</div>
              <div style={{ fontSize: "13px", color: "#888", marginBottom: "20px" }}>
                {screen === "Sign In" ? "Welcome back to PayVora" : "Create your PayVora account"}
              </div>

              {/* Email field */}
              <div style={{ background: "#f5f5f5", borderRadius: "12px", padding: "14px 16px", marginBottom: "10px", fontSize: "15px", color: "#999" }}>
                Email address
              </div>
              {/* Password field */}
              <div style={{ background: "#f5f5f5", borderRadius: "12px", padding: "14px 16px", marginBottom: "20px", fontSize: "15px", color: "#999" }}>
                Password
              </div>

              {/* CTA */}
              <div style={{
                background: "#C8FF00",
                borderRadius: "14px",
                padding: "16px",
                textAlign: "center",
                fontWeight: 700,
                fontSize: "16px",
                color: "#111",
                marginBottom: "20px",
              }}>
                {screen === "Sign In" ? "Sign In" : "Create Account"}
              </div>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ flex: 1, height: "1px", background: "#e5e5e5" }} />
                <span style={{ fontSize: "12px", color: "#aaa", whiteSpace: "nowrap" }}>
                  {screen === "Sign In" ? "Or sign in with" : "Or sign up with"}
                </span>
                <div style={{ flex: 1, height: "1px", background: "#e5e5e5" }} />
              </div>

              {/* Social buttons — equal width, side-by-side */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button style={{ ...btnStyle, flex: 1, justifyContent: "center" }}>
                  <svg width="20" height="24" viewBox="0 0 170 200" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929 0.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.43 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002 0.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-0.9 2.61-1.85 5.11-2.86 7.51zM119.11 7.24c0 8.102-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375-0.119-0.972-0.188-1.995-0.188-3.07 0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.311 11.45-8.597 4.62-2.254 8.99-3.498 13.1-3.71 0.12 1.083 0.17 2.166 0.17 3.241z" fill="#3c4043" />
                  </svg>
                  <span style={labelStyle}>Apple</span>
                </button>
                <button style={{ ...btnStyle, flex: 1, justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span style={labelStyle}>Google</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
