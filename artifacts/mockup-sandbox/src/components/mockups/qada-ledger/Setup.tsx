import "./_group.css";
import { ArrowLeft, HelpCircle, Sunrise, Sun, CloudSun, Sunset, Moon } from "lucide-react";

export function Setup() {
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
        <div className="text-[11px] tracking-[0.18em] nuur-gold-soft uppercase">Make-Up Prayers</div>
        <button className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.03] border border-white/[0.06]">
          <HelpCircle className="w-4 h-4 nuur-gold-soft" />
        </button>
      </div>

      {/* Intro */}
      <div className="px-7 mt-6 text-center">
        <h1 className="nuur-arabic text-[36px] leading-tight nuur-gold">قَضَاء</h1>
        <h2 className="text-[20px] mt-1 text-white/90">A quiet ledger</h2>
        <p className="mt-3 text-[13px] text-white/60 leading-relaxed">
          A private place to keep track of prayers you'd like to make up
          — and a gentle way to chip away at them.
          <br /><br />
          Only you can see this. There are no streaks, no badges, and nothing to lose.
        </p>
      </div>

      {/* Counts */}
      <div className="mx-6 mt-7 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="text-[11px] tracking-[0.2em] uppercase nuur-gold-soft mb-3">How many do you carry?</div>
        <Row icon={<Sunrise className="w-4 h-4" />} label="Fajr" value={42} />
        <Divider />
        <Row icon={<Sun className="w-4 h-4" />} label="Dhuhr" value={18} />
        <Divider />
        <Row icon={<CloudSun className="w-4 h-4" />} label="ʿAṣr" value={24} />
        <Divider />
        <Row icon={<Sunset className="w-4 h-4" />} label="Maghrib" value={9} />
        <Divider />
        <Row icon={<Moon className="w-4 h-4" />} label="ʿIshāʾ" value={31} />
      </div>

      <p className="text-[11px] text-white/40 text-center mt-4 px-8 leading-relaxed">
        Estimate gently. You can change these any time.
      </p>

      <div className="mt-auto px-6 pb-8 pt-6">
        <button className="w-full h-14 rounded-2xl nuur-gold-bg text-[#0b0b10] font-semibold tracking-wide text-[15px]">
          Save my ledger
        </button>
        <button className="w-full h-10 mt-1 text-[13px] text-white/45">I'd rather not track this</button>
      </div>
    </div>
  );
}

function Divider() { return <div className="h-px nuur-divider opacity-40 my-2.5" />; }

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#c9933a]/10 border border-[#c9933a]/20 flex items-center justify-center nuur-gold">
        {icon}
      </div>
      <div className="flex-1 text-[14px] text-white/85">{label}</div>
      <div className="flex items-center gap-2">
        <button className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/[0.07] text-white/60 text-base leading-none">−</button>
        <div className="w-10 text-center text-[15px] nuur-gold tabular-nums">{value}</div>
        <button className="w-7 h-7 rounded-full bg-[#c9933a]/15 border border-[#c9933a]/30 nuur-gold text-base leading-none">+</button>
      </div>
    </div>
  );
}
