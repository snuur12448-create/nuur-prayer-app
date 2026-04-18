import "./_group.css";
import { ArrowLeft, Settings2, Sunrise, Sun, CloudSun, Sunset, Moon, Plus } from "lucide-react";

export function Ledger() {
  return (
    <div className="min-h-screen w-full nuur-bg nuur-sans flex flex-col" style={{ minHeight: "844px" }}>
      <div className="flex items-center justify-between px-6 pt-3 text-[11px] nuur-gold-soft">
        <span>1:08 PM</span>
        <span className="opacity-60">•••</span>
      </div>

      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <button className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.03] border border-white/[0.06]">
          <ArrowLeft className="w-4 h-4 nuur-gold-soft" />
        </button>
        <div className="text-[11px] tracking-[0.18em] nuur-gold-soft uppercase">My Ledger</div>
        <button className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.03] border border-white/[0.06]">
          <Settings2 className="w-4 h-4 nuur-gold-soft" />
        </button>
      </div>

      {/* Hero remaining */}
      <div className="px-6 mt-5 text-center">
        <div className="text-[11px] tracking-[0.2em] uppercase nuur-gold-soft">Remaining to make up</div>
        <div className="mt-2 flex items-baseline justify-center gap-2">
          <div className="text-[68px] leading-none nuur-gold tabular-nums">98</div>
          <div className="text-[14px] text-white/55">prayers</div>
        </div>
        <div className="mt-2 text-[12px] text-white/45">Started with 124 · made up 26 so far</div>
      </div>

      {/* Progress arc */}
      <div className="px-6 mt-5">
        <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full nuur-gold-bg rounded-full" style={{ width: "21%" }} />
        </div>
        <div className="flex justify-between text-[10px] text-white/40 mt-1.5">
          <span>21% completed</span>
          <span>≈ 4 weeks at 1 per day</span>
        </div>
      </div>

      {/* Per-prayer cards */}
      <div className="mx-6 mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
        <PrayerRow icon={<Sunrise className="w-4 h-4" />} label="Fajr" remaining={28} total={42} />
        <PrayerRow icon={<Sun className="w-4 h-4" />} label="Dhuhr" remaining={12} total={18} />
        <PrayerRow icon={<CloudSun className="w-4 h-4" />} label="ʿAṣr" remaining={20} total={24} />
        <PrayerRow icon={<Sunset className="w-4 h-4" />} label="Maghrib" remaining={4} total={9} done />
        <PrayerRow icon={<Moon className="w-4 h-4" />} label="ʿIshāʾ" remaining={34} total={31} extra />
      </div>

      {/* Today line */}
      <div className="mx-6 mt-4 flex items-center justify-between px-1">
        <div>
          <div className="text-[11px] nuur-gold-soft tracking-wider uppercase">Today</div>
          <div className="text-[13px] text-white/75 mt-0.5">2 made up · keep going</div>
        </div>
        <div className="flex gap-1.5">
          <Dot filled />
          <Dot filled />
          <Dot />
          <Dot />
          <Dot />
        </div>
      </div>

      <div className="mt-auto px-6 pb-8 pt-6">
        <button className="w-full h-14 rounded-2xl nuur-gold-bg text-[#0b0b10] font-semibold tracking-wide text-[15px] flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          I made one up
        </button>
        <p className="text-[10px] text-white/35 text-center mt-3 leading-relaxed">
          Allah is the most merciful — every step toward Him counts.
        </p>
      </div>
    </div>
  );
}

function PrayerRow({ icon, label, remaining, total, done = false, extra = false }: {
  icon: React.ReactNode; label: string; remaining: number; total: number; done?: boolean; extra?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-8 h-8 rounded-lg bg-[#c9933a]/10 border border-[#c9933a]/20 flex items-center justify-center nuur-gold">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="text-[13px] text-white/85">{label}</div>
          <div className={`text-[12px] tabular-nums ${done ? "text-emerald-300/80" : extra ? "text-white/55" : "nuur-gold"}`}>
            {remaining} {extra && <span className="text-white/35">(+)</span>}
          </div>
        </div>
        <div className="mt-1.5 h-1 w-full rounded-full bg-white/[0.05] overflow-hidden">
          <div className="h-full nuur-gold-bg rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function Dot({ filled = false }: { filled?: boolean }) {
  return <div className={`w-2 h-2 rounded-full ${filled ? "nuur-gold-bg" : "bg-white/15"}`} />;
}
