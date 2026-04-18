import { Copy, Share2, BookOpen, ArrowRight } from "lucide-react";

const APP_BG = "#0A1F12";
const APP_TEXT_DIM = "#7A9986";
const GOLD = "#C9933A";
const GOLD_BRIGHT = "#E8B85C";

// Mushaf paper palette
const PAPER_TOP = "#F6EDD6";
const PAPER_BOT = "#EFE3C6";
const PAPER_INK = "#1F1A12";
const PAPER_INK_DIM = "#6B5A3B";
const PAPER_RULE = "#B89856";

const AYAH = {
  arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
  translation:
    "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence.",
  transliteration: "Allāhu lā ilāha illā Huw, Al-Ḥayyul-Qayyūm",
  surahName: "Al-Baqarah",
  surahArabic: "البقرة",
  surahNumber: 2,
  ayahNumber: 255,
  juz: 3,
};

export function MushafLeaf() {
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
      {/* Section label, sits above the paper card */}
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
          <BookOpen size={10} />
          Verse of the Day
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

      {/* ── Paper card — the leaf from the mushaf ─────────────────── */}
      <div
        style={{
          position: "relative",
          background: `linear-gradient(180deg, ${PAPER_TOP} 0%, ${PAPER_BOT} 100%)`,
          borderRadius: 6,
          padding: 8, // thin margin so the inset border sits inside the page edge
          boxShadow: `
            0 1px 0 rgba(255,255,255,0.04) inset,
            0 12px 30px rgba(0,0,0,0.45),
            0 2px 0 rgba(0,0,0,0.25)
          `,
          // subtle paper grain via a layered radial speckle
          backgroundImage: `
            linear-gradient(180deg, ${PAPER_TOP} 0%, ${PAPER_BOT} 100%),
            radial-gradient(circle at 20% 30%, rgba(120, 80, 20, 0.04) 0px, transparent 1px),
            radial-gradient(circle at 70% 60%, rgba(120, 80, 20, 0.04) 0px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 4px 4px, 5px 5px",
        }}
      >
        {/* Inset hairline border — the mushaf frame */}
        <div
          style={{
            border: `1px solid ${PAPER_RULE}`,
            borderRadius: 3,
            padding: "0 16px 18px",
            position: "relative",
          }}
        >
          {/* Surah header band — like a real mushaf chapter heading */}
          <div
            style={{
              margin: "10px -16px 18px",
              padding: "10px 16px",
              borderTop: `1px solid ${PAPER_RULE}66`,
              borderBottom: `1px solid ${PAPER_RULE}66`,
              background: `linear-gradient(180deg, ${PAPER_TOP} 0%, #EBDDB8 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: "'Amiri', serif",
            }}
          >
            <div style={{ fontSize: 10, color: PAPER_INK_DIM, letterSpacing: 1.4, fontWeight: 600, fontFamily: "Inter, sans-serif", textTransform: "uppercase" }}>
              Sūrah {AYAH.surahNumber}
            </div>
            <Ornament />
            <div style={{ fontSize: 22, color: PAPER_INK, lineHeight: 1 }} dir="rtl">
              سُورَةُ {AYAH.surahArabic}
            </div>
            <Ornament />
            <div style={{ fontSize: 10, color: PAPER_INK_DIM, letterSpacing: 1.4, fontWeight: 600, fontFamily: "Inter, sans-serif", textTransform: "uppercase" }}>
              Juz {AYAH.juz}
            </div>
          </div>

          {/* Bismillah — the small ornamental opening */}
          <div
            dir="rtl"
            style={{
              textAlign: "center",
              fontFamily: "'Amiri Quran', 'Amiri', serif",
              fontSize: 19,
              color: PAPER_INK,
              padding: "2px 0 16px",
              opacity: 0.85,
            }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>

          {/* The verse — Amiri, justified, with the ornate ﴿255﴾ stamp */}
          <div
            dir="rtl"
            lang="ar"
            style={{
              fontFamily: "'Amiri Quran', 'Amiri', serif",
              fontSize: 28,
              lineHeight: 2.05,
              color: PAPER_INK,
              textAlign: "justify",
              textAlignLast: "center",
              wordSpacing: "0.05em",
              letterSpacing: 0,
              padding: "4px 4px 8px",
            }}
          >
            {AYAH.arabic}
            {"\u00A0"}
            <span
              style={{
                color: PAPER_RULE,
                fontFamily: "'Amiri Quran', 'Amiri', serif",
                fontSize: 26,
                whiteSpace: "nowrap",
              }}
            >
              {/* U+FD3E ornate left parenthesis, U+FD3F ornate right parenthesis */}
              ﴿{toArabicNumeral(AYAH.ayahNumber)}﴾
            </span>
          </div>

          {/* Faint corner ornaments to evoke an illuminated frame */}
          <CornerOrn pos="tl" />
          <CornerOrn pos="tr" />
          <CornerOrn pos="bl" />
          <CornerOrn pos="br" />
        </div>
      </div>

      {/* ── Below the paper: translation + transliteration in app voice ─── */}
      <div style={{ padding: "18px 8px 0" }}>
        <div
          style={{
            fontSize: 12,
            color: GOLD_BRIGHT,
            fontStyle: "italic",
            fontFamily: "Georgia, serif",
            letterSpacing: 0.3,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          {AYAH.transliteration}
        </div>
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.55,
            color: "#C5D4C9",
            fontFamily: "Georgia, serif",
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          “{AYAH.translation}”
        </div>
        <div
          style={{
            fontSize: 10,
            color: APP_TEXT_DIM,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            fontWeight: 600,
            textAlign: "center",
            marginTop: 10,
          }}
        >
          {AYAH.surahName} · {AYAH.surahNumber}:{AYAH.ayahNumber}
        </div>

        <button
          style={{
            marginTop: 18,
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
          <BookOpen size={12} />
          Read full Sūrah
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

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

function Ornament() {
  return (
    <div
      style={{
        flex: 1,
        height: 1,
        margin: "0 10px",
        background: `linear-gradient(90deg, transparent, ${PAPER_RULE}, transparent)`,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: PAPER_RULE,
        }}
      />
    </div>
  );
}

function CornerOrn({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const styleMap: Record<string, React.CSSProperties> = {
    tl: { top: 4, left: 4, transform: "rotate(0deg)" },
    tr: { top: 4, right: 4, transform: "rotate(90deg)" },
    bl: { bottom: 4, left: 4, transform: "rotate(-90deg)" },
    br: { bottom: 4, right: 4, transform: "rotate(180deg)" },
  };
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      style={{ position: "absolute", color: PAPER_RULE, opacity: 0.55, ...styleMap[pos] }}
    >
      <path d="M1 1 L1 6 M1 1 L6 1 M1 1 Q4 1 4 4 Q4 4 1 4" stroke="currentColor" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

function toArabicNumeral(n: number): string {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n)
    .split("")
    .map((d) => map[+d] ?? d)
    .join("");
}
