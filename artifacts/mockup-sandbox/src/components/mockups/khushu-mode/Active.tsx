import "./_group.css";
import { BellOff, VolumeX, Sun } from "lucide-react";

export function Active() {
  return (
    <div
      className="relative min-h-screen w-full nuur-sans overflow-hidden"
      style={{
        minHeight: "844px",
        background: "radial-gradient(80% 60% at 50% 50%, #131019 0%, #06060a 70%, #000 100%)",
        color: "#d9c89a",
      }}
    >
      {/* Top status — barely visible chrome */}
      <div className="flex items-center justify-between px-6 pt-3 text-[10px] text-[#5a4a26]">
        <span>6:42 PM</span>
        <span className="opacity-70">•••</span>
      </div>

      <div className="flex items-center justify-center gap-3 mt-3 opacity-70">
        <Pill icon={<VolumeX className="w-3 h-3" />} label="Silent" />
        <Pill icon={<BellOff className="w-3 h-3" />} label="DND" />
        <Pill icon={<Sun className="w-3 h-3" />} label="Dim" />
      </div>

      {/* Centerpiece */}
      <div className="flex flex-col items-center justify-center" style={{ height: "640px" }}>
        {/* Pulsing core */}
        <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
          <div
            className="absolute inset-0 rounded-full pulse-ring"
            style={{ background: "radial-gradient(circle, rgba(201,147,58,0.18) 0%, transparent 70%)" }}
          />
          <div
            className="absolute rounded-full pulse-core"
            style={{
              width: 110,
              height: 110,
              background: "radial-gradient(circle at 35% 30%, #e3b765 0%, #c9933a 50%, #7a5a23 100%)",
            }}
          />
          <div className="relative text-center">
            <div className="nuur-arabic text-[34px] leading-none nuur-gold">٢</div>
            <div className="text-[10px] tracking-[0.3em] mt-1 text-[#9c7a3b]">RAKʿAH</div>
          </div>
        </div>

        {/* Dhikr cycle (subtle) */}
        <div className="mt-12 text-center">
          <div className="nuur-arabic text-[22px] nuur-gold-soft breathe">سُبْحَانَ رَبِّيَ الْعَظِيم</div>
          <div className="text-[10px] tracking-[0.25em] mt-2 text-[#5a4a26] uppercase">in rukūʿ</div>
        </div>

        {/* Rakʿah dots */}
        <div className="flex items-center gap-3 mt-10">
          <Dot done />
          <Dot active />
          <Dot />
          <Dot />
        </div>
      </div>

      {/* Bottom hint — almost invisible */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <div className="text-[10px] tracking-[0.25em] uppercase text-[#3d321b]">Tap anywhere when finished</div>
      </div>
    </div>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-[#c9933a]/15 bg-[#c9933a]/5 text-[10px] text-[#9c7a3b]">
      {icon}
      <span className="tracking-wider">{label}</span>
    </div>
  );
}

function Dot({ active = false, done = false }: { active?: boolean; done?: boolean }) {
  if (active) return <div className="w-2.5 h-2.5 rounded-full nuur-gold-bg pulse-core" />;
  if (done) return <div className="w-2 h-2 rounded-full bg-[#c9933a]/70" />;
  return <div className="w-2 h-2 rounded-full bg-[#3d321b]" />;
}
