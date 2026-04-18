import { useState } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";

// Nuur emerald theme tokens (matched against the live app)
const BG = "#0A1F12";
const SURFACE = "#0F2818";
const SURFACE_ELEV = "#13301E";
const BORDER = "#1F3F2A";
const TEXT = "#E8F1EA";
const TEXT_DIM = "#7A9986";
const GOLD = "#C9933A";
const GOLD_BRIGHT = "#E8B85C";
const GOLD_DIM = "#C9933A55";

const PRESETS = [
  { id: "subhanallah",    arabic: "سُبْحَانَ اللَّهِ",     translit: "SubhanAllah",      target: 33 },
  { id: "alhamdulillah",  arabic: "الْحَمْدُ لِلَّهِ",      translit: "Alhamdulillah",    target: 33 },
  { id: "allahuakbar",    arabic: "اللَّهُ أَكْبَرُ",       translit: "Allahu Akbar",     target: 34 },
  { id: "lailaha",        arabic: "لَا إِلَهَ إِلَّا اللَّهُ", translit: "La ilaha illallah", target: 100 },
  { id: "astaghfirullah", arabic: "أَسْتَغْفِرُ اللَّهَ",    translit: "Astaghfirullah",   target: 100 },
];

export function CountAsHero() {
  // Default to a count mid-cycle so the preview shows the design at work.
  const [count, setCount] = useState(17);
  const [presetIdx, setPresetIdx] = useState(0);
  const preset = PRESETS[presetIdx];
  const cycle = Math.floor(count / preset.target);
  const inCycle = count % preset.target;
  const pct = (inCycle / preset.target) * 100;

  return (
    <div
      style={{
        backgroundColor: BG,
        color: TEXT,
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Subtle radial gold glow behind the count, very faint */}
      <div
        style={{
          position: "absolute",
          top: "32%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 460,
          height: 460,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${GOLD}22 0%, ${GOLD}08 40%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* ── Top bar — minimal: just a dhikr selector chip ─────────── */}
      <div style={{ paddingTop: 56, paddingLeft: 20, paddingRight: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: TEXT_DIM, fontWeight: 600 }}>
            Tasbeeh
          </div>
          <button
            style={{
              fontSize: 12,
              color: TEXT_DIM,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            History
          </button>
        </div>
      </div>

      {/* ── Current dhikr — small, sits above the count ───────────── */}
      <div style={{ paddingTop: 32, paddingLeft: 20, paddingRight: 20, textAlign: "center", position: "relative" }}>
        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 999,
            fontSize: 11,
            color: TEXT_DIM,
            letterSpacing: 1,
            textTransform: "uppercase",
            fontWeight: 600,
            cursor: "pointer",
          }}
          onClick={() => setPresetIdx((i) => (i + 1) % PRESETS.length)}
        >
          Dhikr
          <ChevronDown size={11} />
        </button>
        <div
          dir="rtl"
          style={{
            marginTop: 14,
            fontSize: 28,
            lineHeight: 1.4,
            color: TEXT,
            fontFamily: "'Amiri', 'Amiri Quran', serif",
            fontWeight: 400,
            letterSpacing: 0,
          }}
        >
          {preset.arabic}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 13,
            color: TEXT_DIM,
            fontStyle: "italic",
            fontFamily: "Georgia, serif",
            letterSpacing: 0.5,
          }}
        >
          {preset.translit}
        </div>
      </div>

      {/* ── THE COUNT — hero number, ultra thin, gold ────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          marginTop: -24,
        }}
      >
        <div
          style={{
            fontSize: 168,
            fontWeight: 100,
            lineHeight: 1,
            color: GOLD_BRIGHT,
            fontVariantNumeric: "tabular-nums",
            textShadow: `0 0 30px ${GOLD}66, 0 0 60px ${GOLD}33`,
            fontFamily: "'Inter', system-ui, sans-serif",
            letterSpacing: -4,
          }}
        >
          {inCycle}
        </div>

        {/* Target progress ring — thin, restrained, sits under the count */}
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 2,
              color: TEXT_DIM,
              textTransform: "uppercase",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {inCycle} / {preset.target}
            {cycle > 0 && (
              <span style={{ color: GOLD, marginLeft: 10 }}>
                · {cycle} {cycle === 1 ? "round" : "rounds"}
              </span>
            )}
          </div>
          <div
            style={{
              width: 140,
              height: 2,
              background: BORDER,
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${GOLD}, ${GOLD_BRIGHT})`,
                transition: "width 200ms ease-out",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Small tap button — restrained, not the hero ───────────── */}
      <div
        style={{
          padding: "0 20px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <button
          onClick={() => setCount((c) => c + 1)}
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: SURFACE_ELEV,
            border: `1.5px solid ${GOLD_DIM}`,
            color: GOLD_BRIGHT,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: "uppercase",
            cursor: "pointer",
            boxShadow: `0 0 24px ${GOLD}22, inset 0 1px 0 ${GOLD}33`,
            transition: "transform 80ms ease-out",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.94)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Tap
        </button>

        {/* Reset — secondary, nearly invisible until needed */}
        <button
          onClick={() => setCount(0)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            background: "transparent",
            border: "none",
            color: TEXT_DIM,
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <RotateCcw size={11} />
          Reset
        </button>

        {/* Hint — explains the entire-screen tap interaction we'd add */}
        <div
          style={{
            fontSize: 10,
            color: TEXT_DIM + "AA",
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginTop: 4,
          }}
        >
          Tap anywhere on the count
        </div>
      </div>
    </div>
  );
}
