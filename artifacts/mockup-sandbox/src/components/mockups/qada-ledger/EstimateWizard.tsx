import "./_group.css";
import { ArrowLeft, ArrowRight, Calendar, Sparkles } from "lucide-react";

export function EstimateWizard() {
  return (
    <div className="min-h-screen w-full nuur-bg nuur-sans flex flex-col" style={{ minHeight: "844px" }}>
      <div className="flex items-center justify-between px-6 pt-3 text-[11px] nuur-gold-soft">
        <span>9:14 AM</span>
        <span className="opacity-60">•••</span>
      </div>

      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <button className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.03] border border-white/[0.06]">
          <ArrowLeft className="w-4 h-4 nuur-gold-soft" />
        </button>
        <div className="text-[11px] tracking-[0.18em] nuur-gold-soft uppercase">Help me estimate</div>
        <div className="w-9" />
      </div>

      {/* Progress */}
      <div className="px-6 mt-2 flex items-center gap-1.5">
        <div className="flex-1 h-[3px] rounded-full nuur-gold-bg" />
        <div className="flex-1 h-[3px] rounded-full nuur-gold-bg" />
        <div className="flex-1 h-[3px] rounded-full bg-white/10" />
      </div>

      {/* Intro */}
      <div className="px-7 mt-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9933a]/10 border border-[#c9933a]/30">
          <Sparkles className="w-3 h-3 nuur-gold" />
          <span className="text-[11px] tracking-wider nuur-gold uppercase">Step 2 of 3</span>
        </div>
        <h1 className="text-[22px] mt-4 text-white/90 leading-snug">
          When did you start praying<br />the five daily prayers regularly?
        </h1>
        <p className="text-[12px] text-white/50 mt-3 leading-relaxed">
          A rough year is enough. We don't need to be exact —
          your make-up intention is what matters.
        </p>
      </div>

      {/* Year input */}
      <div className="mx-6 mt-7 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#c9933a]/10 border border-[#c9933a]/20 flex items-center justify-center nuur-gold">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="text-[11px] nuur-gold-soft tracking-wider uppercase">Started consistently</div>
            <div className="text-[18px] text-white/90 mt-0.5">2019</div>
          </div>
        </div>

        {/* Year slider */}
        <div className="mt-5">
          <div className="relative h-1 rounded-full bg-white/[0.06]">
            <div className="absolute inset-y-0 left-0 rounded-full nuur-gold-bg" style={{ width: "62%" }} />
            <div className="absolute -top-2 w-5 h-5 rounded-full nuur-gold-bg border-2 border-[#0b0b10]" style={{ left: "calc(62% - 10px)" }} />
          </div>
          <div className="flex justify-between text-[10px] text-white/35 mt-3">
            <span>2009</span>
            <span>2026</span>
          </div>
        </div>

        {/* Quick chips */}
        <div className="flex gap-2 mt-4">
          <Chip label="Last year" />
          <Chip label="5 yrs" />
          <Chip label="10 yrs" selected />
          <Chip label="20 yrs" />
        </div>
      </div>

      {/* Skip / unsure */}
      <div className="mx-6 mt-4 rounded-2xl border border-white/[0.04] bg-white/[0.015] p-3 flex items-center justify-between">
        <div>
          <div className="text-[12px] text-white/75">I'm not sure</div>
          <div className="text-[10px] text-white/40 mt-0.5">Use a conservative default instead</div>
        </div>
        <div className="text-[12px] nuur-gold-soft">Skip →</div>
      </div>

      {/* Footer */}
      <div className="mt-auto px-6 pb-8 pt-6">
        <button className="w-full h-14 rounded-2xl nuur-gold-bg text-[#0b0b10] font-semibold tracking-wide text-[15px] flex items-center justify-center gap-2">
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-[10px] text-white/30 text-center mt-3">
          Your answers stay on this device.
        </p>
      </div>
    </div>
  );
}

function Chip({ label, selected = false }: { label: string; selected?: boolean }) {
  return (
    <button className={`px-3 py-1.5 rounded-full text-[11px] border ${selected ? "nuur-gold-bg text-[#0b0b10] border-transparent" : "border-white/10 text-white/60 bg-white/[0.02]"}`}>
      {label}
    </button>
  );
}
