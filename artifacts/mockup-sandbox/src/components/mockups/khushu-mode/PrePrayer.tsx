import "./_group.css";
import { Moon, BellOff, VolumeX, Sun, ArrowLeft, Info } from "lucide-react";

export function PrePrayer() {
  return (
    <div className="min-h-screen w-full nuur-bg nuur-sans flex flex-col" style={{ minHeight: "844px" }}>
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-3 text-[11px] nuur-gold-soft">
        <span>6:39 PM</span>
        <span className="opacity-60">•••</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <button className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.03] border border-white/[0.06]">
          <ArrowLeft className="w-4 h-4 nuur-gold-soft" />
        </button>
        <div className="text-[11px] tracking-[0.18em] nuur-gold-soft uppercase">Khushūʿ Mode</div>
        <button className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.03] border border-white/[0.06]">
          <Info className="w-4 h-4 nuur-gold-soft" />
        </button>
      </div>

      <div className="px-6 mt-6">
        {/* Prayer pill */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9933a]/10 border border-[#c9933a]/30">
            <span className="w-1.5 h-1.5 rounded-full nuur-gold-bg breathe" />
            <span className="text-[11px] tracking-wider nuur-gold uppercase">Maghrib · in 3 min</span>
          </div>
          <h1 className="nuur-arabic text-[44px] leading-none mt-5 nuur-gold">المغرب</h1>
          <p className="text-sm mt-2 text-white/60">Begin your prayer with stillness.</p>
        </div>

        {/* Toggles card */}
        <div className="mt-7 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
          <ToggleRow icon={<VolumeX className="w-4 h-4" />} title="Silence ringer" sub="Mute calls and alerts" on />
          <div className="h-px nuur-divider opacity-50" />
          <ToggleRow icon={<BellOff className="w-4 h-4" />} title="Do Not Disturb" sub="Hide all notifications" on />
          <div className="h-px nuur-divider opacity-50" />
          <ToggleRow icon={<Sun className="w-4 h-4" />} title="Dim screen" sub="Soften brightness" on />
          <div className="h-px nuur-divider opacity-50" />
          <ToggleRow icon={<Moon className="w-4 h-4" />} title="Auto-end at salām" sub="Detect motion of taslīm" />
        </div>

        {/* Hint */}
        <p className="text-[11px] text-white/40 text-center mt-5 leading-relaxed">
          The Prophet ﷺ would pause in stillness before takbīr.
          <br />
          Take a breath. Make your intention.
        </p>
      </div>

      {/* CTA pinned */}
      <div className="mt-auto px-6 pb-8 pt-6">
        <button className="w-full h-14 rounded-2xl nuur-gold-bg text-[#0b0b10] font-semibold tracking-wide text-[15px]">
          Begin Maghrib
        </button>
        <button className="w-full h-10 mt-2 text-[13px] text-white/50">Skip for now</button>
      </div>
    </div>
  );
}

function ToggleRow({ icon, title, sub, on = false }: { icon: React.ReactNode; title: string; sub: string; on?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-[#c9933a]/10 border border-[#c9933a]/20 flex items-center justify-center nuur-gold">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-white/85">{title}</div>
        <div className="text-[11px] text-white/45">{sub}</div>
      </div>
      <div
        className={`w-10 h-6 rounded-full p-[3px] transition-colors ${on ? "nuur-gold-bg" : "bg-white/10"}`}
        aria-checked={on}
      >
        <div className={`w-[18px] h-[18px] rounded-full bg-[#0b0b10] transition-transform ${on ? "translate-x-4" : ""}`} />
      </div>
    </div>
  );
}
