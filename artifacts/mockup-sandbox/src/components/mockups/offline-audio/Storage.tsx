// Nuur — Settings → Offline content panel.
// Unified storage management: text cache (from quranCache.ts) + audio downloads.
// User can see what's saved, how big it is, and free up space.

import { ArrowLeft, BookOpen, ChevronRight, Download, FileAudio, HardDrive, Trash2, Wifi } from "lucide-react";

const GOLD = "#C9933A";
const BG = "#0b0b10";
const SURFACE = "#15151c";
const SURFACE_2 = "#1d1d27";
const MUTED = "#7a7a86";
const TEXT = "#ece9e0";
const RED = "#d4675a";

type ReciterRow = { name: string; arabic: string; surahs: number; mb: number };
const RECITERS: ReciterRow[] = [
  { name: "Mishary Alafasy",          arabic: "مشاري العفاسي",   surahs: 12, mb: 78 },
  { name: "Mahmoud Al-Husary",        arabic: "محمود الحصري",     surahs: 8,  mb: 62 },
];

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-full" style={{ width: `${pct}%`, background: color }} />
  );
}

export function Storage() {
  // Mock totals — text cache is small, audio dominates.
  const textMb = 14;
  const audioMb = RECITERS.reduce((s, r) => s + r.mb, 0);
  const totalMb = textMb + audioMb;

  return (
    <div className="min-h-screen w-full" style={{
      background: BG, fontFamily: "Inter, system-ui, sans-serif", color: TEXT,
    }}>
      {/* status bar spacer */}
      <div style={{ height: 44 }} />

      {/* nav */}
      <div className="flex items-center justify-between px-4 pb-3">
        <button className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: SURFACE }}>
          <ArrowLeft size={18} style={{ color: TEXT }} />
        </button>
        <p className="text-[14px] font-semibold tracking-wide" style={{ color: TEXT }}>
          Offline Content
        </p>
        <div className="w-9" />
      </div>

      {/* hero — total usage */}
      <div className="mx-4 rounded-2xl p-4 mb-4"
        style={{ background: SURFACE, border: `1px solid ${GOLD}22` }}>
        <div className="flex items-center gap-2.5 mb-3">
          <HardDrive size={15} style={{ color: GOLD }} />
          <p className="text-[10.5px] uppercase tracking-[0.18em]" style={{ color: MUTED }}>
            Stored on this device
          </p>
        </div>
        <p className="text-[28px] font-semibold tabular-nums" style={{ color: TEXT }}>
          {totalMb} <span className="text-[15px] font-normal" style={{ color: MUTED }}>MB</span>
        </p>
        {/* stacked bar */}
        <div className="mt-3 h-2 rounded-full overflow-hidden flex" style={{ background: SURFACE_2 }}>
          <Bar pct={(audioMb / totalMb) * 100} color={GOLD} />
          <Bar pct={(textMb / totalMb) * 100} color={GOLD + "55"} />
        </div>
        <div className="flex items-center gap-4 mt-2.5">
          <span className="flex items-center gap-1.5 text-[10.5px]" style={{ color: MUTED }}>
            <span className="w-2 h-2 rounded-full" style={{ background: GOLD }} />
            Audio · {audioMb} MB
          </span>
          <span className="flex items-center gap-1.5 text-[10.5px]" style={{ color: MUTED }}>
            <span className="w-2 h-2 rounded-full" style={{ background: GOLD + "55" }} />
            Text · {textMb} MB
          </span>
        </div>
      </div>

      {/* AUDIO section */}
      <div className="px-5 mb-1.5 flex items-baseline justify-between">
        <p className="text-[10.5px] uppercase tracking-[0.18em]" style={{ color: MUTED }}>
          Reciters · Audio
        </p>
        <button className="text-[11px] font-medium" style={{ color: GOLD }}>
          + Add reciter
        </button>
      </div>
      <div className="mx-3 mb-4">
        {RECITERS.map((r, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl mb-1"
            style={{ background: SURFACE }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: GOLD + "1a" }}>
              <FileAudio size={16} style={{ color: GOLD }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-medium truncate" style={{ color: TEXT }}>{r.name}</p>
              <p className="text-[10.5px] mt-0.5" style={{ color: MUTED }}>
                {r.surahs} surahs · {r.mb} MB
              </p>
            </div>
            <button className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: SURFACE_2 }}>
              <Trash2 size={14} style={{ color: RED }} />
            </button>
          </div>
        ))}
      </div>

      {/* TEXT section */}
      <div className="px-5 mb-1.5">
        <p className="text-[10.5px] uppercase tracking-[0.18em]" style={{ color: MUTED }}>
          Quran Text · Cached automatically
        </p>
      </div>
      <div className="mx-3 mb-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl"
          style={{ background: SURFACE }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: GOLD + "1a" }}>
            <BookOpen size={16} style={{ color: GOLD }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-medium" style={{ color: TEXT }}>
              42 surahs cached
            </p>
            <p className="text-[10.5px] mt-0.5" style={{ color: MUTED }}>
              Arabic · translation · word-by-word · {textMb} MB
            </p>
          </div>
          <ChevronRight size={16} style={{ color: MUTED }} />
        </div>
      </div>

      {/* PREFERENCES */}
      <div className="px-5 mb-1.5">
        <p className="text-[10.5px] uppercase tracking-[0.18em]" style={{ color: MUTED }}>
          Preferences
        </p>
      </div>
      <div className="mx-3 mb-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-1"
          style={{ background: SURFACE }}>
          <Wifi size={16} style={{ color: GOLD }} />
          <div className="flex-1">
            <p className="text-[13px] font-medium" style={{ color: TEXT }}>Wi-Fi only downloads</p>
            <p className="text-[10.5px] mt-0.5" style={{ color: MUTED }}>
              Pause audio downloads on cellular
            </p>
          </div>
          <div className="w-10 h-6 rounded-full relative" style={{ background: GOLD }}>
            <div className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white" />
          </div>
        </div>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl"
          style={{ background: SURFACE }}>
          <Download size={16} style={{ color: GOLD }} />
          <div className="flex-1">
            <p className="text-[13px] font-medium" style={{ color: TEXT }}>Audio quality</p>
            <p className="text-[10.5px] mt-0.5" style={{ color: MUTED }}>
              128 kbps · ~7 MB per surah
            </p>
          </div>
          <ChevronRight size={16} style={{ color: MUTED }} />
        </div>
      </div>

      {/* danger */}
      <div className="px-4 mb-10">
        <button className="w-full py-3 rounded-xl text-[13px] font-medium"
          style={{ background: RED + "18", color: RED, border: `1px solid ${RED}44` }}>
          Free up all space ({totalMb} MB)
        </button>
      </div>
    </div>
  );
}
