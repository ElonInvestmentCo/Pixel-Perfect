import btcImage from "../imports/ChatGPT_Image_Jun_9__2026__11_45_48_AM.png";
import { motion } from "motion/react";

export default function App() {
  return (
    <div
      className="size-full flex items-center justify-center"
      style={{ background: "#f0f2f5", minHeight: "100vh" }}
    >
      {/* Phone frame — iPhone 16 Pro Max */}
      <div
        style={{
          width: 430,
          height: 932,
          background: "#ffffff",
          borderRadius: 54,
          boxShadow:
            "0 0 0 11px #1a1a1a, 0 0 0 13px #2e2e2e, 0 40px 100px rgba(0,0,0,0.4), 0 10px 30px rgba(0,0,0,0.2)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Dynamic Island */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: "50%",
            transform: "translateX(-50%)",
            width: 126,
            height: 37,
            background: "#1a1a1a",
            borderRadius: 20,
            zIndex: 10,
          }}
        />

        {/* Spacer for Dynamic Island */}
        <div style={{ height: 60 }} />

        {/* Illustration area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: 20,
          }}
        >
          <motion.img
            src={btcImage}
            alt="Bitcoin coins on platform"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ width: 280, height: 280, objectFit: "contain" }}
          />
        </div>

        {/* Bottom content */}
        <div style={{ background: "#ffffff", padding: "32px 32px 48px" }}>
          {/* Single dot */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
            <div style={{ width: 24, height: 8, borderRadius: 4, background: "#111111" }} />
            <div style={{ width: 8, height: 8, borderRadius: 4, background: "#d0d0d8" }} />
            <div style={{ width: 8, height: 8, borderRadius: 4, background: "#d0d0d8" }} />
            <div style={{ width: 8, height: 8, borderRadius: 4, background: "#d0d0d8" }} />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#111111",
              textAlign: "center",
              margin: "0 0 12px",
              lineHeight: 1.25,
              letterSpacing: "-0.5px",
            }}
          >
            Buying & Selling
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.06 }}
            style={{
              fontSize: 15,
              color: "#888",
              textAlign: "center",
              margin: "0 0 32px",
              lineHeight: 1.6,
            }}
          >
            Buy and sell cryptocurrencies with popular payment solutions
          </motion.p>

          <motion.button
            whileTap={{ scale: 0.97 }}
            style={{
              width: "100%",
              padding: "18px 0",
              borderRadius: 50,
              background: "#c6f135",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 700,
              color: "#111111",
              boxShadow: "0 4px 20px rgba(180,230,0,0.35)",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(180,230,0,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(180,230,0,0.35)";
            }}
          >
            Create a new wallet
          </motion.button>
        </div>
      </div>
    </div>
  );
}
