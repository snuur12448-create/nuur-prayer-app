import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const GOLD = "#C9933A";
const GOLD_SOFT = "#E0B968";
const BG = "#0F0E0C";
const PARCHMENT = "#F2E8D5";
const DIM = "#A89C84";
const SURFACE = "#1A1612";

const TYPED = "Yusuf";

export function NameStep() {
  const [typed, setTyped] = useState("");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeouts: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) => {
      const t = setTimeout(() => { if (!cancelled) fn(); }, ms);
      timeouts.push(t);
    };
    const loop = () => {
      schedule(() => setFocused(true), 600);
      for (let i = 0; i <= TYPED.length; i++) {
        schedule(() => setTyped(TYPED.slice(0, i)), 1200 + i * 180);
      }
      schedule(() => setFocused(false), 1200 + TYPED.length * 180 + 1800);
      schedule(() => { setTyped(""); loop(); }, 1200 + TYPED.length * 180 + 3200);
    };
    loop();
    return () => { cancelled = true; timeouts.forEach(clearTimeout); };
  }, []);

  return (
    <div
      className="min-h-screen w-full flex flex-col overflow-hidden relative"
      style={{ backgroundColor: BG }}
    >
      <SoftGlow />

      <div className="flex items-center justify-between px-6 pt-14 pb-4 relative z-10">
        <button className="text-[12px] tracking-[0.2em] uppercase font-['Inter']" style={{ color: DIM }}>
          ← Back
        </button>
        <ProgressDots />
        <button className="text-[12px] tracking-[0.2em] uppercase font-['Inter']" style={{ color: GOLD }}>
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-['Amiri_Quran'] text-center mb-10"
          style={{ color: GOLD, fontSize: 28, opacity: 0.85 }}
        >
          ﷽
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-center"
        >
          <div
            className="font-['Amiri'] text-2xl mb-2"
            style={{ color: PARCHMENT + "AA" }}
          >
            مَا اسْمُكَ؟
          </div>
          <h1
            className="font-['Playfair_Display'] text-[28px] leading-tight"
            style={{ color: PARCHMENT }}
          >
            What may we call you?
          </h1>
          <p
            className="mt-3 font-['Inter'] text-[13px] leading-relaxed max-w-[260px] mx-auto"
            style={{ color: DIM }}
          >
            So Nuur can greet you each morning, in shaa Allah.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-12 w-full"
        >
          <div
            className="relative rounded-2xl px-5 py-4 border transition-all"
            style={{
              backgroundColor: SURFACE,
              borderColor: focused ? GOLD : GOLD + "33",
              boxShadow: focused ? `0 0 0 4px ${GOLD}1F, 0 0 30px ${GOLD}22` : "none",
            }}
          >
            <div
              className="font-['Inter'] text-[10px] tracking-[0.22em] uppercase mb-1"
              style={{ color: focused ? GOLD : DIM }}
            >
              Your name
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className="font-['Playfair_Display'] text-2xl"
                style={{ color: PARCHMENT }}
              >
                {typed || (focused ? "" : <span style={{ color: DIM, opacity: 0.7 }}>e.g. Yusuf</span>)}
              </span>
              {focused && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="inline-block w-[2px] h-6"
                  style={{ backgroundColor: GOLD }}
                />
              )}
            </div>
          </div>
          <div
            className="mt-3 font-['Inter'] text-[11px] tracking-wide flex items-center gap-1.5"
            style={{ color: DIM }}
          >
            <span style={{ color: GOLD }}>✦</span>
            Stays on your device. Never shared.
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="px-6 pb-10 relative z-10"
      >
        <button
          className="w-full rounded-full py-4 font-['Inter'] text-[13px] tracking-[0.18em] uppercase flex items-center justify-center gap-2 transition-opacity"
          style={{
            background: typed ? `linear-gradient(180deg, ${GOLD_SOFT}, ${GOLD})` : SURFACE,
            color: typed ? BG : DIM,
            fontWeight: 600,
            border: typed ? "none" : `1px solid ${GOLD}33`,
          }}
        >
          Continue <span>→</span>
        </button>
      </motion.div>
    </div>
  );
}

function ProgressDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            backgroundColor: i === 1 ? GOLD : GOLD + "33",
            width: i === 1 ? 18 : 6,
            height: 6,
            transition: "all 0.3s",
          }}
        />
      ))}
    </div>
  );
}

function SoftGlow() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse at 50% 30%, ${GOLD}0F 0%, transparent 60%)`,
      }}
    />
  );
}
