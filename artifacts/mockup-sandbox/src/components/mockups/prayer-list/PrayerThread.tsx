import { Bell, BellOff, Check } from "lucide-react";

const APP_BG = "#0A1F12";
const SURFACE = "#0F2618";
const BORDER = "#1F3F2A";
const TEXT = "#E8F1EA";
const TEXT_DIM = "#7A9986";
const GOLD = "#C9933A";
const GOLD_BRIGHT = "#E8B85C";
const EMBER = "#E07A2A";

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

export function PrayerThread() {
  return (
    <div
      style={{
        backgroundColor: APP_BG,
        minHeight: "100vh",
        padding: "32px 16px 24px",
        fontFamily: "Inter, system-ui, sans-serif",
        color: TEXT,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Section header */}
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
        Today's Prayer Times · Variant A
      </div>

      {/* ── THE THREAD ──────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 14,
          padding: "10px 16px 14px 14px",
        }}
      >
        {/* Vertical thread runs the height of the list */}
        <div
          style={{
            position: "absolute",
            left: 32,
            top: 30,
            bottom: 30,
            width: 1,
            background: `linear-gradient(180deg, ${GOLD}80 0%, ${EMBER}90 ${rowCenter(4)} , ${GOLD}25 100%)`,
          }}
        />

        {ROWS.map((r, i) => (
          <ThreadRow key={r.name} row={r} isLast={i === ROWS.length - 1} />
        ))}
      </div>

      <Caption>
        A continuous gold thread runs through the day. Past prayers are
        <strong style={{ color: GOLD, fontWeight: 600 }}> filled beads</strong>,
        the active one is <strong style={{ color: EMBER, fontWeight: 600 }}>glowing ember</strong>,
        upcoming are <strong style={{ color: TEXT_DIM, fontWeight: 600 }}>hollow</strong>.
        Same ember language as the celestial arc above ties them together.
      </Caption>
    </div>
  );
}

function rowCenter(idx: number) {
  // Approx center of the active (Maghrib) row from the top of the thread
  return `${(idx + 0.5) * (100 / 6)}%`;
}

function ThreadRow({ row, isLast }: { row: Row; isLast: boolean }) {
  const isNow = row.status === "now";
  const isPast = row.status === "past";

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        padding: "14px 0 14px 38px",
        borderBottom: isLast ? "none" : `1px solid ${BORDER}80`,
      }}
    >
      {/* Bead — sits on the thread at left:32 */}
      <div
        style={{
          position: "absolute",
          left: 32 - 7,
          top: "50%",
          transform: "translateY(-50%)",
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: isNow
            ? `radial-gradient(circle at 30% 30%, ${GOLD_BRIGHT} 0%, ${EMBER} 80%)`
            : isPast
              ? GOLD
              : APP_BG,
          border: isNow
            ? `1px solid ${EMBER}`
            : isPast
              ? `1px solid ${GOLD}`
              : `1.5px solid ${TEXT_DIM}66`,
          boxShadow: isNow ? `0 0 14px ${EMBER}AA, 0 0 4px ${GOLD_BRIGHT}` : "none",
          zIndex: 2,
        }}
      />
      {isNow && (
        <div
          style={{
            position: "absolute",
            left: 32 - 14,
            top: "50%",
            transform: "translateY(-50%)",
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: `${EMBER}30`,
            zIndex: 1,
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
      )}

      {/* Prayer name + Arabic */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: isNow ? 700 : 600,
            color: isNow ? "#FFF6E0" : isPast ? TEXT_DIM : TEXT,
            letterSpacing: 0.2,
          }}
        >
          {row.name}
          {isNow && (
            <span
              style={{
                marginLeft: 8,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1.4,
                color: EMBER,
                padding: "2px 7px",
                borderRadius: 999,
                background: `${EMBER}22`,
                border: `1px solid ${EMBER}55`,
                verticalAlign: "middle",
              }}
            >
              NOW
            </span>
          )}
        </div>
        <div
          style={{
            fontFamily: "'Amiri', serif",
            fontSize: 14,
            color: isNow ? `${GOLD_BRIGHT}CC` : TEXT_DIM,
            marginTop: 1,
          }}
          dir="rtl"
        >
          {row.arabic}
        </div>
      </div>

      {/* Time */}
      <div
        style={{
          fontSize: 16,
          fontWeight: 500,
          fontVariantNumeric: "tabular-nums",
          color: isNow ? "#FFF6E0" : isPast ? TEXT_DIM : TEXT,
          marginRight: 14,
          letterSpacing: 0.3,
        }}
      >
        {row.time}
      </div>

      {/* Bell + past checkmark */}
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: row.bell
            ? isNow ? `${EMBER}25` : `${GOLD}1A`
            : "#13301E",
          border: row.bell
            ? `1px solid ${isNow ? EMBER : GOLD}55`
            : `1px solid ${BORDER}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isPast && row.bell ? (
          <Check size={13} color={GOLD} />
        ) : row.bell ? (
          <Bell size={13} color={isNow ? EMBER : GOLD} />
        ) : (
          <BellOff size={13} color={TEXT_DIM} />
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
