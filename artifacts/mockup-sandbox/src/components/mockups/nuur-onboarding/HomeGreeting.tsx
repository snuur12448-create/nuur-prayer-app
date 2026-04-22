import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const GOLD = "#C9933A";
const GOLD_SOFT = "#E0B968";
const BG = "#0F0E0C";
const PARCHMENT = "#F2E8D5";
const DIM = "#A89C84";
const SURFACE = "#171411";

const TIME_PHRASE = "on this blessed Friday";

export function HomeGreeting() {
  const [typedSuffix, setTypedSuffix] = useState("");

  useEffect(() => {
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) => {
      const t = setTimeout(() => { if (!cancelled) fn(); }, ms);
      timeouts.push(t);
    };
    const loop = () => {
      for (let i = 0; i <= TIME_PHRASE.length; i++) {
        schedule(() => setTypedSuffix(TIME_PHRASE.slice(0, i)), 2400 + i * 45);
      }
      schedule(() => { setTypedSuffix(""); loop(); }, 2400 + TIME_PHRASE.length * 45 + 4500);
    };
    loop();
    return () => { cancelled = true; timeouts.forEach(clearTimeout); };
  }, []);

  return (
    <div
      className="min-h-screen w-full flex flex-col overflow-hidden relative"
      style={{ backgroundColor: BG }}
    >
      <RadialGlow />

      {/* Status bar look */}
      <div className="flex items-center justify-between px-6 pt-3 pb-2 font-['Inter'] text-[11px] relative z-10" style={{ color: PARCHMENT }}>
        <span>9:41</span>
        <span className="opacity-60">●●●●●</span>
      </div>

      {/* ﷽ ornament */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, delay: 0.2 }}
        className="text-center pt-2 relative z-10"
      >
        <div
          className="font-['Amiri_Quran']"
          style={{ color: GOLD, fontSize: 22, opacity: 0.8 }}
        >
          ﷽
        </div>
      </motion.div>

      {/* Greeting block */}
      <div className="px-6 pt-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <h1
            className="font-['Playfair_Display'] text-[26px] leading-tight"
            style={{ color: PARCHMENT }}
          >
            Assalamu alaikum,
            <br />
            <span style={{ color: GOLD }}>Yusuf</span>
            <span style={{ color: PARCHMENT, opacity: 0.85 }}> {typedSuffix && "—"} </span>
            <span style={{ color: PARCHMENT, opacity: 0.85 }}>{typedSuffix}</span>
            {typedSuffix.length > 0 && typedSuffix.length < TIME_PHRASE.length && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block w-[2px] h-5 ml-0.5 align-middle"
                style={{ backgroundColor: GOLD }}
              />
            )}
            <span style={{ color: PARCHMENT, opacity: 0.85 }}>
              {typedSuffix.length === TIME_PHRASE.length ? "." : ""}
            </span>
          </h1>
          <div
            className="mt-2 font-['Amiri'] text-base"
            style={{ color: DIM }}
          >
            السَّلَامُ عَلَيْكُمْ
          </div>
        </motion.div>
      </div>

      {/* Next prayer card */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-5 mt-7 rounded-3xl p-5 relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${SURFACE}, #100D0A)`,
          border: `1px solid ${GOLD}22`,
          boxShadow: `0 18px 50px -25px ${GOLD}40, inset 0 1px 0 ${GOLD}11`,
        }}
      >
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: GOLD + "33" }}
        />
        <div className="relative">
          <div
            className="font-['Inter'] text-[10px] tracking-[0.28em] uppercase"
            style={{ color: GOLD }}
          >
            Next Prayer
          </div>
          <div className="flex items-baseline justify-between mt-1.5">
            <div>
              <div className="font-['Playfair_Display'] text-[34px] leading-none" style={{ color: PARCHMENT }}>
                Maghrib
              </div>
              <div className="font-['Amiri'] text-xl mt-1" style={{ color: GOLD }}>
                المغرب
              </div>
            </div>
            <div className="text-right">
              <div className="font-['Inter'] text-2xl tabular-nums" style={{ color: PARCHMENT }}>
                6:42<span className="text-sm opacity-60"> PM</span>
              </div>
              <Countdown />
            </div>
          </div>
          <div className="mt-5 h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: GOLD + "22" }}>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "68%" }}
              transition={{ duration: 1.6, delay: 2.0, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_SOFT})` }}
            />
          </div>
          <div
            className="mt-2 font-['Inter'] text-[10px] tracking-wider flex justify-between"
            style={{ color: DIM }}
          >
            <span>Asr · 3:18 PM</span>
            <span>Maghrib · 6:42 PM</span>
          </div>
        </div>
      </motion.div>

      {/* Quick row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.2 }}
        className="grid grid-cols-3 gap-3 mx-5 mt-5 relative z-10"
      >
        {[
          { label: "Quran", glyph: "ﻕ" },
          { label: "Qibla", glyph: "✦" },
          { label: "Tasbeeh", glyph: "◯" },
        ].map((q) => (
          <div
            key={q.label}
            className="rounded-2xl py-4 flex flex-col items-center gap-1.5"
            style={{ backgroundColor: SURFACE, border: `1px solid ${GOLD}1F` }}
          >
            <div className="font-['Amiri'] text-xl" style={{ color: GOLD }}>{q.glyph}</div>
            <div className="font-['Inter'] text-[10px] tracking-[0.2em] uppercase" style={{ color: DIM }}>{q.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Verse of the day strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 2.6 }}
        className="mx-5 mt-5 px-4 py-3 rounded-xl relative z-10"
        style={{ borderLeft: `2px solid ${GOLD}`, backgroundColor: SURFACE + "AA" }}
      >
        <div className="font-['Amiri'] text-base text-right" style={{ color: PARCHMENT }} dir="rtl">
          إِنَّ مَعَ الْعُسْرِ يُسْرًا
        </div>
        <div className="mt-1 font-['Playfair_Display'] text-[11px] italic" style={{ color: DIM }}>
          "Indeed, with hardship comes ease." — 94:6
        </div>
      </motion.div>
    </div>
  );
}

function Countdown() {
  const [s, setS] = useState(14);
  useEffect(() => {
    const id = setInterval(() => setS((v) => (v + 1) % 60), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      className="font-['Inter'] text-[11px] tracking-wider mt-1"
      style={{ color: GOLD }}
    >
      in 2h 14m {s.toString().padStart(2, "0")}s
    </div>
  );
}

function RadialGlow() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse at 50% 0%, ${GOLD}18 0%, transparent 50%)`,
      }}
    />
  );
}
