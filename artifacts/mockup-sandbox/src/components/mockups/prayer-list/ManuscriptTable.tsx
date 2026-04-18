import { Bell, BellOff, Check } from "lucide-react";

const APP_BG = "#0A1F12";
const TEXT_DIM = "#7A9986";

// Parchment palette — same family as the Mushaf and Scholar's leaves
const PAPER_TOP = "#F2E8CC";
const PAPER_BOT = "#E8DCB8";
const PAPER_INK = "#1F1A12";
const PAPER_INK_DIM = "#6B5A3B";
const PAPER_RULE = "#B89856";
const PAPER_RULE_SOFT = "rgba(184, 152, 86, 0.35)";
const EMBER = "#9C3318"; // muted madder for the "active" highlight on paper
const EMBER_BG = "#E8B85C"; // gilded highlight band

type Status = "past" | "now" | "future";
type Row = { name: string; arabic: string; time: string; bell: boolean; status: Status };

const ROWS: Row[] = [
  { name: "Fajr",    arabic: "الفجر",    time: "5:24 AM",  bell: true,  status: "past" },
  { name: "Sunrise", arabic: "الشروق",   time: "6:51 AM",  bell: false, status: "past" },
  { name: "Dhuhr",   arabic: "الظهر",    time: "12:46 PM", bell: true,  status: "past" },
  { name: "Asr",     arabic: "العصر",    time: "4:08 PM",  bell: true,  status: "past" },
  { name: "Maghrib", arabic: "المغرب",   time: "5:42 PM",  bell: true,  status: "now" },
  { name: "Isha",    arabic: "العشاء",   time: "7:08 PM",  bell: false, status: "future" },
];

export function ManuscriptTable() {
  return (
    <div
      style={{
        backgroundColor: APP_BG,
        minHeight: "100vh",
        padding: "32px 16px 24px",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#E8F1EA",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Section header — stays in app voice */}
      <div
        style={{
          fontSize: 11,
          letterSpacing: 1.4,
          fontWeight: 700,
          color: TEXT_DIM,
          textTransform: "uppercase",
          padding: "0 6px 16px",
        }}
      >
        Today's Prayer Times · Variant B
      </div>

      {/* ── ILLUMINATED TABLE LEAF ──────────────────────────────── */}
      <div
        style={{
          background: `linear-gradient(180deg, ${PAPER_TOP} 0%, ${PAPER_BOT} 100%)`,
          borderRadius: 6,
          border: `1px solid ${PAPER_RULE}55`,
          boxShadow: `
            0 14px 30px rgba(0,0,0,0.45),
            inset 0 1px 0 rgba(255,255,255,0.2)
          `,
          padding: 8,
        }}
      >
        {/* Inner inset frame */}
        <div
          style={{
            border: `1px solid ${PAPER_RULE}`,
            borderRadius: 3,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Header band */}
          <div
            style={{
              padding: "10px 14px",
              borderBottom: `1px solid ${PAPER_RULE_SOFT}`,
              background: `${PAPER_RULE}1A`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1.4,
                color: PAPER_INK_DIM,
                textTransform: "uppercase",
              }}
            >
              Awqāt al-Ṣalāh · Salāt Times
            </span>
            <span
              style={{
                fontFamily: "'Amiri Quran', 'Amiri', serif",
                fontSize: 14,
                color: PAPER_INK,
              }}
              dir="rtl"
            >
              ٢٣ شوال
            </span>
          </div>

          {ROWS.map((r, i) => (
            <TableRow key={r.name} row={r} isLast={i === ROWS.length - 1} />
          ))}
        </div>
      </div>

      <Caption>
        Borrows the parchment-leaf aesthetic for the table. Active prayer gets a{" "}
        <strong style={{ color: EMBER_BG, fontWeight: 600 }}>gilded highlight band</strong>{" "}
        — like an illuminator marked it. Past prayers appear in faded sepia, future in full ink.
      </Caption>
    </div>
  );
}

function TableRow({ row, isLast }: { row: Row; isLast: boolean }) {
  const isNow = row.status === "now";
  const isPast = row.status === "past";

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        padding: "13px 14px",
        borderBottom: isLast ? "none" : `1px solid ${PAPER_RULE_SOFT}`,
        background: isNow
          ? `linear-gradient(90deg, ${EMBER_BG}33 0%, ${EMBER_BG}1A 100%)`
          : "transparent",
      }}
    >
      {/* Active illumination — left-edge gilded bar */}
      {isNow && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: `linear-gradient(180deg, ${EMBER_BG} 0%, ${EMBER} 100%)`,
            boxShadow: `0 0 8px ${EMBER_BG}`,
          }}
        />
      )}

      {/* Number column — like manuscript line numbers */}
      <div
        style={{
          width: 22,
          fontFamily: "'Amiri', serif",
          fontSize: 13,
          fontStyle: "italic",
          color: isPast ? `${PAPER_INK_DIM}99` : PAPER_INK_DIM,
          opacity: 0.7,
        }}
      >
        ·{ROWS.indexOf(row) + 1}·
      </div>

      {/* Prayer Arabic — leading visual */}
      <div style={{ flex: 1, paddingLeft: 4 }}>
        <div
          style={{
            fontFamily: "'Amiri Quran', 'Amiri', serif",
            fontSize: 22,
            color: isPast ? `${PAPER_INK}99` : PAPER_INK,
            lineHeight: 1.1,
            fontWeight: isNow ? 700 : 400,
          }}
          dir="rtl"
        >
          {row.arabic}
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: 1.4,
            color: isPast ? `${PAPER_INK_DIM}99` : PAPER_INK_DIM,
            textTransform: "uppercase",
            marginTop: 2,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {row.name}
          {isNow && (
            <span
              style={{
                marginLeft: 6,
                color: EMBER,
                letterSpacing: 1.6,
              }}
            >
              · ḥāḍir
            </span>
          )}
        </div>
      </div>

      {/* Time — manuscript-style numerals */}
      <div
        style={{
          fontFamily: "Georgia, serif",
          fontSize: 16,
          color: isPast ? `${PAPER_INK_DIM}AA` : PAPER_INK,
          fontVariantNumeric: "tabular-nums",
          marginRight: 12,
          fontWeight: isNow ? 700 : 500,
        }}
      >
        {row.time}
      </div>

      {/* Bell — quill-and-ink button on paper */}
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: row.bell ? `${PAPER_RULE}22` : "transparent",
          border: row.bell ? `1px solid ${PAPER_RULE}66` : `1px dashed ${PAPER_RULE}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isPast && row.bell ? (
          <Check size={13} color={PAPER_RULE} />
        ) : row.bell ? (
          <Bell size={13} color={PAPER_INK_DIM} />
        ) : (
          <BellOff size={12} color={`${PAPER_INK_DIM}99`} />
        )}
      </div>
    </div>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 14,
        padding: "10px 14px",
        borderRadius: 8,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        fontSize: 11,
        lineHeight: 1.55,
        color: TEXT_DIM,
        fontStyle: "italic",
      }}
    >
      {children}
    </div>
  );
}
