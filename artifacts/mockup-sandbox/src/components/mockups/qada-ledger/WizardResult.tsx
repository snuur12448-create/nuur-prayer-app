import "./_group.css";
import { ArrowLeft, Sparkles, Sunrise, Sun, CloudSun, Sunset, Moon, Info, Edit3 } from "lucide-react";

export function WizardResult() {
  return (
    <div className="min-h-screen w-full nuur-bg nuur-sans flex flex-col" style={{ minHeight: "844px" }}>
      <div className="flex items-center justify-between px-6 pt-3 text-[11px] nuur-gold-soft">
        <span>9:15 AM</span>
        <span className="opacity-60">•••</span>
      </div>

      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <button className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.03] border border-white/[0.06]">
          <ArrowLeft className="w-4 h-4 nuur-gold-soft" />
        </button>
        <div className="text-[11px] tracking-[0.18em] nuur-gold-soft uppercase">Your estimate</div>
        <div className="w-9" />
      </div>

      {/* Progress filled */}
      <div className="px-6 mt-2 flex items-center gap-1.5">
        <div className="flex-1 h-[3px] rounded-full nuur-gold-bg" />
        <div className="flex-1 h-[3px] rounded-full nuur-gold-bg" />
        <div className="flex-1 h-[3px] rounded-full nuur-gold-bg" />
      </div>

      {/* Hero number */}
      <div className="px-7 mt-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9933a]/10 border border-[#c9933a]/30">
          <Sparkles className="w-3 h-3 nuur-gold" />
          <span className="text-[11px] tracking-wider nuur-gold uppercase">Gentle estimate</span>
        </div>
        <div className="mt-4 text-[12px] text-white/55">Approximately</div>
        <div className="mt-1 flex items-baseline justify-center gap-2">
          <div className="text-[64px] leading-none nuur-gold tabular-nums">~3,650</div>
        </div>
        <div className="mt-1 text-[13px] text-white/65">prayers across 10 years</div>
        <p className="text-[11px] text-white/45 mt-3 leading-relaxed">
          Based on 2 missed prayers per day on average.
          <br />
          You can refine each below before saving.
        </p>
      </div>

      {/* Per-prayer breakdown */}
      <div className="mx-6 mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
        <Row icon={<Sunrise className="w-4 h-4" />} label="Fajr" value={1095} note="most commonly missed" />
        <Divider />
        <Row icon={<Sun className="w-4 h-4" />} label="Dhuhr" value={730} />
        <Divider />
        <Row icon={<CloudSun className="w-4 h-4" />} label="ʿAṣr" value={912} />
        <Divider />
        <Row icon={<Sunset className="w-4 h-4" />} label="Maghrib" value={365} />
        <Divider />
        <Row icon={<Moon className="w-4 h-4" />} label="ʿIshāʾ" value={548} />
      </div>

      {/* Reassurance */}
      <div className="mx-6 mt-4 rounded-2xl border border-[#c9933a]/15 bg-[#c9933a]/[0.05] p-3 flex items-start gap-2.5">
        <Info className="w-4 h-4 nuur-gold-soft mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-white/70 leading-relaxed">
          This is only an estimate to give you a starting point. Many scholars say
          a sincere intention to make up missed prayers is itself counted with Allah.
        </p>
      </div>

      {/* Footer */}
      <div className="mt-auto px-6 pb-8 pt-6">
        <button className="w-full h-14 rounded-2xl nuur-gold-bg text-[#0b0b10] font-semibold tracking-wide text-[15px]">
          Use this estimate
        </button>
        <button className="w-full h-11 mt-2 text-[13px] text-white/65 flex items-center justify-center gap-2">
          <Edit3 className="w-3.5 h-3.5" />
          Adjust the numbers myself
        </button>
      </div>
    </div>
  );
}

function Divider() { return <div className="h-px nuur-divider opacity-40 my-2" />; }

function Row({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: number; note?: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="w-8 h-8 rounded-lg bg-[#c9933a]/10 border border-[#c9933a]/20 flex items-center justify-center nuur-gold">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-white/85">{label}</div>
        {note && <div className="text-[10px] text-white/40 mt-0.5">{note}</div>}
      </div>
      <div className="text-[15px] nuur-gold tabular-nums">{value.toLocaleString()}</div>
    </div>
  );
}
