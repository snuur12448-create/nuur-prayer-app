import "./_group.css";
import { Check, Clock, Layers, ChevronRight } from "lucide-react";

export function AfterSalam() {
  return (
    <div className="min-h-screen w-full nuur-bg nuur-sans flex flex-col" style={{ minHeight: "844px" }}>
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-3 text-[11px] nuur-gold-soft">
        <span>6:46 PM</span>
        <span className="opacity-60">•••</span>
      </div>

      {/* Header tag */}
      <div className="flex items-center justify-center pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9933a]/10 border border-[#c9933a]/30">
          <Check className="w-3 h-3 nuur-gold" />
          <span className="text-[11px] tracking-wider nuur-gold uppercase">Maghrib · Completed</span>
        </div>
      </div>

      {/* Hero */}
      <div className="px-8 mt-10 text-center">
        <div className="nuur-arabic text-[56px] leading-none nuur-gold">الْحَمْدُ ِللَّه</div>
        <p className="mt-4 text-[15px] text-white/75 leading-relaxed">
          May Allah accept it from you.<br />
          <span className="text-white/40 text-[13px]">تقبل الله منك</span>
        </p>
      </div>

      {/* Stats card */}
      <div className="mx-6 mt-9 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="grid grid-cols-2 gap-3">
          <Stat icon={<Layers className="w-4 h-4" />} label="Rakaʿāt" value="3" />
          <Stat icon={<Clock className="w-4 h-4" />} label="Duration" value="4 min" />
        </div>
        <div className="h-px nuur-divider mt-4 mb-4 opacity-50" />
        <div className="text-[11px] text-white/45 text-center">
          On time · in jamāʿah · with Khushūʿ Mode
        </div>
      </div>

      {/* Suggested next */}
      <div className="mx-6 mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] nuur-gold-soft tracking-wider uppercase">Suggested</div>
            <div className="text-[14px] text-white/85 mt-1">Adhkār after salah</div>
            <div className="text-[11px] text-white/45 mt-0.5">Subḥān Allāh · 33 · ~2 min</div>
          </div>
          <button className="w-9 h-9 rounded-full bg-[#c9933a]/15 flex items-center justify-center">
            <ChevronRight className="w-4 h-4 nuur-gold" />
          </button>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-auto px-6 pb-8 pt-6 space-y-2">
        <button className="w-full h-14 rounded-2xl nuur-gold-bg text-[#0b0b10] font-semibold tracking-wide text-[15px]">
          Log to tracker
        </button>
        <button className="w-full h-12 rounded-2xl border border-white/10 text-[13px] text-white/65">
          Continue to home
        </button>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#c9933a]/[0.06] border border-[#c9933a]/15 px-3 py-3">
      <div className="flex items-center gap-2 nuur-gold-soft">
        {icon}
        <span className="text-[10px] tracking-[0.18em] uppercase">{label}</span>
      </div>
      <div className="mt-1.5 text-[22px] nuur-gold">{value}</div>
    </div>
  );
}
