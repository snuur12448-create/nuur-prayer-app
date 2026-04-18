import { Copy, Share2, User } from "lucide-react";

const APP_BG = "#0A1F12";
const APP_TEXT_DIM = "#7A9986";
const GOLD = "#C9933A";
const GOLD_BRIGHT = "#E8B85C";

// Scholar's notebook palette — older, warmer, more handled than the Mushaf cream
const PAPER_TOP = "#E8DCC0";
const PAPER_BOT = "#D8C9A4";
const PAPER_DEEP = "#C8B788";
const PAPER_INK = "#2C2418";
const PAPER_INK_DIM = "#6B5A3B";
const PAPER_RULE = "#8B6F3A";
const SEAL_RED = "#9C2A2A"; // a deep traditional madder-lake red, used for the grade seal
const SEAL_RED_DEEP = "#6B1818";

const HADITH = {
  topic: "On Intentions",
  arabic:
    "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
  translation:
    "Actions are judged by their intentions, and every person will get the reward according to what they intended.",
  narrator: "ʿUmar ibn al-Khaṭṭāb",
  honorific: "رضي الله عنه",
  source: "Ṣaḥīḥ al-Bukhārī 1 · Ṣaḥīḥ Muslim 1907",
  grade: "Ṣaḥīḥ",
  number: "Bukhārī № 1",
};

export function ScholarsLeaf() {
  return (
    <div
      style={{
        backgroundColor: APP_BG,
        minHeight: "100vh",
        padding: "44px 16px 24px",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#E8F1EA",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Section label, sits in the dark chrome above the leaf */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 6px 14px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 10,
            letterSpacing: 1.6,
            fontWeight: 700,
            color: GOLD,
            textTransform: "uppercase",
          }}
        >
          ☾ Hadith of the Day
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <IconBtn>
            <Copy size={13} color={APP_TEXT_DIM} />
          </IconBtn>
          <IconBtn>
            <Share2 size={13} color={APP_TEXT_DIM} />
          </IconBtn>
        </div>
      </div>

      {/* ── Scholar's leaf ─────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          // Slight tilt + a smaller "shadow card" peeking out — feels like
          // a single page lifted from a stack of notebook pages
          transform: "rotate(-0.4deg)",
        }}
      >
        {/* Stacked paper underneath — barely visible, just hints at depth */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: PAPER_DEEP,
            borderRadius: 4,
            transform: "translate(4px, 5px) rotate(0.6deg)",
            opacity: 0.55,
            boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
          }}
        />

        <div
          style={{
            position: "relative",
            background: `linear-gradient(180deg, ${PAPER_TOP} 0%, ${PAPER_BOT} 100%)`,
            borderRadius: 4,
            padding: "0 0 18px",
            boxShadow: `
              0 14px 30px rgba(0,0,0,0.5),
              0 2px 0 rgba(0,0,0,0.25),
              inset 0 1px 0 rgba(255,255,255,0.15)
            `,
            // single hairline rule, no inner double-frame — distinguishes from the mushaf
            border: `1px solid ${PAPER_RULE}55`,
            overflow: "visible",
          }}
        >
          {/* ── TOP RIBBON: topic + chain marker ─────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 18px 10px",
              borderBottom: `1px solid ${PAPER_RULE}55`,
              background: `linear-gradient(180deg, ${PAPER_TOP}00 0%, ${PAPER_RULE}10 100%)`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ChainSigil />
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                  color: PAPER_INK_DIM,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Bāb · {HADITH.topic}
              </div>
            </div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: 1.2,
                color: PAPER_INK_DIM,
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
              }}
            >
              ḥadīth № 1
            </div>
          </div>

          {/* Wax-seal grade marker — sits over the corner like a stamped certification */}
          <WaxSeal label={HADITH.grade} />

          {/* ── BODY ──────────────────────────────────────────────── */}
          <div style={{ padding: "20px 22px 4px" }}>
            {/* Pilcrow / paragraph mark introducing the narration */}
            <div
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: 18,
                color: PAPER_RULE,
                marginBottom: 8,
                opacity: 0.7,
              }}
            >
              ❖
            </div>

            {/* Arabic body — Amiri Quran, justified */}
            <div
              dir="rtl"
              lang="ar"
              style={{
                fontFamily: "'Amiri Quran', 'Amiri', serif",
                fontSize: 22,
                lineHeight: 2.0,
                color: PAPER_INK,
                textAlign: "justify",
                textAlignLast: "right",
                wordSpacing: "0.04em",
                paddingBottom: 4,
              }}
            >
              {HADITH.arabic}
            </div>

            {/* Hairline rule between Arabic and translation */}
            <div
              style={{
                margin: "16px 0 14px",
                borderTop: `1px dashed ${PAPER_RULE}55`,
              }}
            />

            {/* Translation in scholarly serif */}
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 14,
                lineHeight: 1.55,
                color: PAPER_INK,
                fontStyle: "italic",
                textAlign: "left",
                opacity: 0.92,
              }}
            >
              “{HADITH.translation}”
            </div>

            {/* ── ISNĀD line — narrator attribution styled like a chain note ── */}
            <div
              style={{
                marginTop: 18,
                paddingTop: 12,
                borderTop: `1px solid ${PAPER_RULE}40`,
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: PAPER_INK_DIM,
                  marginTop: 2,
                  fontFamily: "Inter, sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                Narrated by
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontFamily: "Georgia, serif",
                    color: PAPER_INK,
                    lineHeight: 1.3,
                  }}
                >
                  {HADITH.narrator}{" "}
                  <span dir="rtl" style={{ fontFamily: "'Amiri', serif", fontSize: 13, color: PAPER_INK_DIM }}>
                    {HADITH.honorific}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── BOTTOM EDGE: source as a library catalog stamp ─────── */}
          <div
            style={{
              margin: "8px 14px 0",
              padding: "8px 12px",
              border: `1px dashed ${PAPER_RULE}66`,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 9,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                fontWeight: 700,
                color: PAPER_INK_DIM,
                fontFamily: "Inter, sans-serif",
              }}
            >
              ﹡ Source
            </div>
            <div
              style={{
                fontSize: 11,
                color: PAPER_INK,
                fontFamily: "Georgia, serif",
                fontVariant: "small-caps",
                letterSpacing: 0.5,
                textAlign: "right",
              }}
            >
              {HADITH.source}
            </div>
          </div>
        </div>
      </div>

      {/* Footer action — keeps the parity with the Quran card pattern */}
      <button
        style={{
          marginTop: 22,
          width: "100%",
          padding: "12px 14px",
          borderRadius: 10,
          background: `${GOLD}14`,
          border: `1px solid ${GOLD}55`,
          color: GOLD_BRIGHT,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: 1,
          textTransform: "uppercase",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          cursor: "pointer",
        }}
      >
        <User size={12} />
        More from {HADITH.topic.replace("On ", "")}
      </button>
    </div>
  );
}

// ── decorative bits ───────────────────────────────────────────────

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        background: "#13301E",
        border: "1px solid #1F3F2A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
}

function ChainSigil() {
  // A small calligraphic emblem evoking an isnād (chain of narration) marker
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <circle cx="5" cy="9" r="2.2" stroke={PAPER_RULE} strokeWidth="1" fill="none" />
      <circle cx="13" cy="9" r="2.2" stroke={PAPER_RULE} strokeWidth="1" fill="none" />
      <line x1="6.8" y1="9" x2="11.2" y2="9" stroke={PAPER_RULE} strokeWidth="1" />
      <circle cx="5" cy="9" r="0.6" fill={PAPER_RULE} />
      <circle cx="13" cy="9" r="0.6" fill={PAPER_RULE} />
    </svg>
  );
}

function WaxSeal({ label }: { label: string }) {
  // Floating wax-seal stamp in the upper-right corner, slightly tilted
  return (
    <div
      style={{
        position: "absolute",
        top: -10,
        right: 14,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: `radial-gradient(circle at 30% 30%, ${SEAL_RED} 0%, ${SEAL_RED_DEEP} 70%)`,
        boxShadow: `
          0 3px 6px rgba(0,0,0,0.45),
          inset 0 -3px 6px rgba(0,0,0,0.35),
          inset 0 2px 3px rgba(255,255,255,0.18)
        `,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: "rotate(8deg)",
        border: `1px solid ${SEAL_RED_DEEP}`,
      }}
    >
      {/* Tiny inner ring */}
      <div
        style={{
          position: "absolute",
          inset: 4,
          border: "1px solid rgba(255, 220, 180, 0.35)",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          fontFamily: "'Amiri', serif",
          fontSize: 14,
          color: "#F4E4C5",
          textShadow: "0 1px 1px rgba(0,0,0,0.5)",
          fontWeight: 700,
          letterSpacing: 0.5,
          lineHeight: 1,
        }}
      >
        {label}
      </div>
    </div>
  );
}
