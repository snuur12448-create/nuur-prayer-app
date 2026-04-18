import "./_group.css";
import { Sunrise, Sun, CloudSun, Sunset, Moon, Check } from "lucide-react";

export function MarkMakeUp() {
  return (
    <div className="relative min-h-screen w-full nuur-sans" style={{ minHeight: "844px", background: "rgba(11,11,16,0.85)" }}>
      {/* Faded ledger behind, suggestion of context */}
      <div className="absolute inset-0 nuur-bg opacity-50" />

      {/* Sheet */}
      <div className="absolute left-0 right-0 bottom-0 rounded-t-[28px] nuur-bg border-t border-[#c9933a]/20 px-6 pt-5 pb-8">
        <div className="mx-auto w-10 h-1 rounded-full bg-white/15 mb-5" />

        <div className="text-center">
          <div className="text-[11px] tracking-[0.2em] uppercase nuur-gold-soft">Mark a make-up</div>
          <h2 className="text-[20px] mt-1 text-white/90">Which prayer did you complete?</h2>
        </div>

        {/* Prayer chips */}
        <div className="grid grid-cols-5 gap-2 mt-6">
          <PrayerChip icon={<Sunrise className="w-4 h-4" />} label="Fajr" />
          <PrayerChip icon={<Sun className="w-4 h-4" />} label="Dhuhr" />
          <PrayerChip icon={<CloudSun className="w-4 h-4" />} label="ʿAṣr" selected />
          <PrayerChip icon={<Sunset className="w-4 h-4" />} label="Maghrib" />
          <PrayerChip icon={<Moon className="w-4 h-4" />} label="ʿIshāʾ" />
        </div>

        {/* Optional date assignment */}
        <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[12px] nuur-gold-soft tracking-wider uppercase">Assign to</div>
              <div className="text-[14px] text-white/85 mt-0.5">Oldest first (recommended)</div>
            </div>
            <div className="text-[12px] nuur-gold">Change</div>
          </div>
          <div className="h-px nuur-divider my-3 opacity-40" />
          <div className="flex items-center justify-between">
            <div className="text-[12px] text-white/55">A specific date instead</div>
            <button className="text-[12px] nuur-gold-soft">Pick…</button>
          </div>
        </div>

        {/* Multi count */}
        <div className="mt-5 flex items-center justify-between">
          <div>
            <div className="text-[12px] nuur-gold-soft tracking-wider uppercase">How many</div>
            <div className="text-[11px] text-white/45 mt-0.5">Stack a few at once if you'd like</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.07] text-white/60 text-lg leading-none">−</button>
            <div className="w-10 text-center text-[18px] nuur-gold tabular-nums">1</div>
            <button className="w-8 h-8 rounded-full bg-[#c9933a]/15 border border-[#c9933a]/30 nuur-gold text-lg leading-none">+</button>
          </div>
        </div>

        {/* Result preview */}
        <div className="mt-5 rounded-xl bg-[#c9933a]/[0.08] border border-[#c9933a]/25 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full nuur-gold-bg flex items-center justify-center">
            <Check className="w-4 h-4 text-[#0b0b10]" strokeWidth={3} />
          </div>
          <div className="flex-1">
            <div className="text-[13px] text-white/90">ʿAṣr remaining: <span className="nuur-gold tabular-nums">20 → 19</span></div>
            <div className="text-[11px] text-white/50 mt-0.5">99 left in your ledger</div>
          </div>
        </div>

        <button className="w-full h-13 mt-5 rounded-2xl nuur-gold-bg text-[#0b0b10] font-semibold tracking-wide text-[15px]" style={{ height: 52 }}>
          Confirm
        </button>
        <button className="w-full h-10 mt-1 text-[13px] text-white/45">Cancel</button>
      </div>
    </div>
  );
}

function PrayerChip({ icon, label, selected = false }: { icon: React.ReactNode; label: string; selected?: boolean }) {
  return (
    <button
      className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-colors ${
        selected ? "bg-[#c9933a]/20 border-[#c9933a]" : "bg-white/[0.02] border-white/[0.06]"
      }`}
    >
      <div className={selected ? "nuur-gold" : "text-white/55"}>{icon}</div>
      <div className={`text-[10px] ${selected ? "nuur-gold" : "text-white/55"}`}>{label}</div>
    </button>
  );
}
