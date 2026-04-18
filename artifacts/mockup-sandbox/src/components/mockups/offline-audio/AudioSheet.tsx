// Nuur — audio bottom sheet with per-surah download icons.
// Mocks the existing reciter sheet with a download affordance per row:
//   ⬇ idle  →  spinning ring + %  →  ✓ done (long-press to remove)

import { Check, ChevronDown, Download, Loader2, Pause, Play, SkipBack, SkipForward, X } from "lucide-react";

const GOLD = "#C9933A";
const BG = "#0b0b10";
const SURFACE = "#15151c";
const SURFACE_2 = "#1d1d27";
const MUTED = "#7a7a86";
const TEXT = "#ece9e0";

type Status = "idle" | "downloading" | "done" | "active";
type Reciter = {
  name: string;
  arabic: string;
  style: string;
  status: Status;
  progress?: number;     // 0–100 when downloading
  size?: string;         // shown when done
  selected?: boolean;
};

const RECITERS: Reciter[] = [
  { name: "Mishary Rashid Alafasy", arabic: "مشاري راشد العفاسي", style: "Murattal · Kuwait",
    status: "active", selected: true, size: "78 MB" },
  { name: "Abdul Basit ʿAbd as-Samad", arabic: "عبد الباسط عبد الصمد", style: "Mujawwad · Egypt",
    status: "downloading", progress: 64 },
  { name: "Mahmoud Khalil Al-Husary", arabic: "محمود خليل الحصري", style: "Murattal · Egypt",
    status: "done", size: "62 MB" },
  { name: "Saʿd al-Ghāmidī", arabic: "سعد الغامدي", style: "Murattal · Saudi",
    status: "idle" },
  { name: "ʿAbdur-Raḥmān as-Sudais", arabic: "عبد الرحمن السديس", style: "Ḥaramayn · Saudi",
    status: "idle" },
  { name: "Maher al-Muʿayqilī", arabic: "ماهر المعيقلي", style: "Ḥaramayn · Saudi",
    status: "idle" },
];

function StatusButton({ r }: { r: Reciter }) {
  if (r.status === "downloading") {
    return (
      <div className="relative w-9 h-9 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke={GOLD + "26"} strokeWidth="2.5" />
          <circle cx="18" cy="18" r="15" fill="none" stroke={GOLD} strokeWidth="2.5"
            strokeDasharray={`${(r.progress! / 100) * 94.2} 94.2`} strokeLinecap="round" />
        </svg>
        <span className="text-[9px] font-semibold tabular-nums" style={{ color: GOLD }}>
          {r.progress}%
        </span>
      </div>
    );
  }
  if (r.status === "done" || r.status === "active") {
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: GOLD + "1a", border: `1px solid ${GOLD}66` }}>
        <Check size={16} strokeWidth={2.5} style={{ color: GOLD }} />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center"
      style={{ background: SURFACE_2, border: `1px solid ${MUTED}33` }}>
      <Download size={15} style={{ color: MUTED }} />
    </div>
  );
}

export function AudioSheet() {
  return (
    <div className="min-h-screen w-full flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.55)", fontFamily: "Inter, system-ui, sans-serif", color: TEXT }}>
      <div className="w-full rounded-t-[28px] pb-6"
        style={{ background: BG, boxShadow: "0 -10px 40px rgba(0,0,0,0.6)" }}>

        {/* grabber */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-9 h-1 rounded-full" style={{ background: MUTED + "66" }} />
        </div>

        {/* header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3">
          <div>
            <p className="text-[10.5px] uppercase tracking-[0.18em]" style={{ color: MUTED }}>
              Now playing
            </p>
            <p className="text-[15px] font-semibold mt-0.5" style={{ color: TEXT }}>
              Sūrat al-Mulk
              <span className="ml-1.5 text-[12px] font-normal" style={{ color: MUTED }}>· 67</span>
            </p>
          </div>
          <button className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: SURFACE }}>
            <ChevronDown size={18} style={{ color: MUTED }} />
          </button>
        </div>

        {/* mini player */}
        <div className="mx-4 rounded-2xl px-4 py-3.5 mb-4"
          style={{ background: SURFACE, border: `1px solid ${GOLD}1f` }}>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] tabular-nums" style={{ color: MUTED }}>1:24</span>
            <span className="text-[11px]" style={{ color: MUTED }}>Verse 8 of 30</span>
            <span className="text-[11px] tabular-nums" style={{ color: MUTED }}>3:42</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: GOLD + "1a" }}>
            <div className="h-full rounded-full" style={{ width: "37%", background: GOLD }} />
          </div>
          <div className="flex items-center justify-center gap-7 mt-3">
            <SkipBack size={20} style={{ color: TEXT }} />
            <button className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: GOLD }}>
              <Pause size={20} className="text-black" fill="currentColor" />
            </button>
            <SkipForward size={20} style={{ color: TEXT }} />
          </div>
        </div>

        {/* reciters section header */}
        <div className="flex items-baseline justify-between px-5 mb-2">
          <p className="text-[12.5px] font-semibold" style={{ color: TEXT }}>Reciter</p>
          <p className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: GOLD }}>
            Tap ⬇ to save offline
          </p>
        </div>

        {/* reciter list */}
        <div className="px-3">
          {RECITERS.map((r, i) => (
            <button key={i}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left"
              style={{
                background: r.selected ? GOLD + "12" : "transparent",
                border: r.selected ? `1px solid ${GOLD}44` : "1px solid transparent",
              }}>
              {/* play indicator dot */}
              <div className="w-1.5 self-stretch rounded-full"
                style={{ background: r.status === "active" ? GOLD : "transparent" }} />

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="text-[13.5px] font-medium truncate" style={{ color: TEXT }}>
                    {r.name}
                  </p>
                  {r.status === "active" && (
                    <span className="text-[9.5px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ color: GOLD, background: GOLD + "1a" }}>Playing</span>
                  )}
                </div>
                <p className="text-[14px] mt-0.5" style={{ fontFamily: "'Amiri', serif", color: TEXT + "cc" }}>
                  {r.arabic}
                </p>
                <p className="text-[10.5px] mt-1 flex items-center gap-1.5" style={{ color: MUTED }}>
                  <span>{r.style}</span>
                  {r.size && (<><span>·</span><span style={{ color: r.status === "downloading" ? GOLD : MUTED }}>
                    {r.status === "downloading" ? `${r.size ?? "120 MB"} · saving…` : `${r.size} saved`}
                  </span></>)}
                  {r.status === "downloading" && !r.size && (
                    <><span>·</span><span style={{ color: GOLD }}>downloading…</span></>
                  )}
                </p>
              </div>

              <StatusButton r={r} />
            </button>
          ))}
        </div>

        {/* footer hint */}
        <div className="mx-5 mt-3 px-3.5 py-2.5 rounded-lg flex items-start gap-2"
          style={{ background: SURFACE, border: `1px dashed ${MUTED}44` }}>
          <Loader2 size={13} className="mt-0.5" style={{ color: MUTED }} />
          <p className="text-[10.5px] leading-snug" style={{ color: MUTED }}>
            Downloads continue in the background. Long-press a saved reciter to remove.
            Wi-Fi only by default — change in Settings.
          </p>
        </div>
      </div>
    </div>
  );
}
