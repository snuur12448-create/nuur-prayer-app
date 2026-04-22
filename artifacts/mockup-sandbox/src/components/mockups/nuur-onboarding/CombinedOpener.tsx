import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const GOLD = "#C9933A";
const GOLD_SOFT = "#E0B968";
const BG = "#0F0E0C";
const PARCHMENT = "#F2E8D5";
const DIM = "#A89C84";
const SURFACE = "#171411";

const TIME_PHRASE = "on this blessed Friday";
const LOOP_MS = 11000;

export function CombinedOpener() {
  const [phase, setPhase] = useState<"opener" | "home">("opener");
  const [tick, setTick] = useState(0);
  const [typedSuffix, setTypedSuffix] = useState("");

  useEffect(() => {
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) =>
      timeouts.push(setTimeout(() => { if (!cancelled) fn(); }, ms));

    const runCycle = () => {
      setPhase("opener");
      setTypedSuffix("");
      schedule(() => setPhase("home"), 2200);
      for (let i = 0; i <= TIME_PHRASE.length; i++) {
        schedule(() => setTypedSuffix(TIME_PHRASE.slice(0, i)), 3800 + i * 45);
      }
      schedule(() => setTick((t) => t + 1), LOOP_MS);
    };

    runCycle();
    return () => { cancelled = true; timeouts.forEach(clearTimeout); };
  }, [tick]);

  return (
    <div
      className="min-h-screen w-full flex flex-col overflow-hidden relative"
      style={{ backgroundColor: BG }}
    >
      <RadialGlow phase={phase} />

      {/* The ﷽ ornament — animates from huge centered → small at top */}
      <motion.div
        layout
        className={`relative z-20 flex items-center justify-center ${phase === "opener" ? "absolute inset-0" : ""}`}
        animate={
          phase === "opener"
            ? { fontSize: 64, opacity: 1, paddingTop: 0 }
            : { fontSize: 22, opacity: 0.85, paddingTop: 28 }
        }
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: phase === "opener" ? "absolute" : "relative", inset: phase === "opener" ? 0 : undefined }}
      >
        <motion.span
          className="font-['Amiri_Quran']"
          style={{ color: GOLD, lineHeight: 1, textShadow: `0 0 30px ${GOLD}55` }}
          animate={{ fontSize: phase === "opener" ? 64 : 22 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          ﷽
        </motion.span>

        {/* halo only during opener */}
        <AnimatePresence>
          {phase === "opener" && (
            <motion.div
              key="halo"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: [0.4, 0.9, 0.4], scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
              className="absolute pointer-events-none rounded-full blur-3xl"
              style={{
                width: 240,
                height: 240,
                background: `radial-gradient(circle, ${GOLD}40 0%, transparent 70%)`,
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* OPENER-only flourish: hairlines + Nuur wordmark fade out before home */}
      <AnimatePresence>
        {phase === "opener" && (
          <motion.div
            key="opener-mark"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.9, delay: 0.7 }}
            className="absolute z-10 left-0 right-0 flex flex-col items-center"
            style={{ top: "62%" }}
          >
            <div className="flex items-center gap-3">
              <Hairline />
              <ShimmerWord text="Nuur" />
              <Hairline />
            </div>
            <div
              className="mt-3 font-['Inter'] text-[10px] tracking-[0.3em] uppercase"
              style={{ color: DIM }}
            >
              Light · Prayer · Quran
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HOME content fades in once phase = home */}
      <AnimatePresence>
        {phase === "home" && (
          <motion.div
            key="home-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10 flex flex-col"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="px-6 pt-4"
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

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
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
                    <div className="font-['Inter'] text-[11px] tracking-wider mt-1" style={{ color: GOLD }}>
                      in 2h 14m
                    </div>
                  </div>
                </div>
                <div className="mt-5 h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: GOLD + "22" }}>
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "68%" }}
                    transition={{ duration: 1.4, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
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

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.6 }}
              className="mx-5 mt-5 px-4 py-3 rounded-xl"
              style={{ borderLeft: `2px solid ${GOLD}`, backgroundColor: SURFACE + "AA" }}
            >
              <div className="font-['Amiri'] text-base text-right" style={{ color: PARCHMENT }} dir="rtl">
                إِنَّ مَعَ الْعُسْرِ يُسْرًا
              </div>
              <div className="mt-1 font-['Playfair_Display'] text-[11px] italic" style={{ color: DIM }}>
                "Indeed, with hardship comes ease." — 94:6
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "tap to skip" hint during opener */}
      <AnimatePresence>
        {phase === "opener" && (
          <motion.div
            key="skip-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="absolute bottom-8 left-0 right-0 text-center font-['Inter'] text-[10px] tracking-[0.25em] uppercase z-30"
            style={{ color: DIM }}
          >
            Tap anywhere to enter
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Hairline() {
  return (
    <div
      className="h-px w-12"
      style={{ background: `linear-gradient(90deg, transparent, ${GOLD}88, transparent)` }}
    />
  );
}

function ShimmerWord({ text }: { text: string }) {
  return (
    <div className="relative font-['Playfair_Display'] text-3xl tracking-wider" style={{ color: GOLD }}>
      {text}
      <motion.div
        initial={{ x: "-120%" }}
        animate={{ x: "120%" }}
        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(105deg, transparent 30%, ${PARCHMENT}cc 50%, transparent 70%)`,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}

function RadialGlow({ phase }: { phase: "opener" | "home" }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      animate={{
        background:
          phase === "opener"
            ? `radial-gradient(ellipse at 50% 38%, ${GOLD}22 0%, transparent 55%)`
            : `radial-gradient(ellipse at 50% 0%, ${GOLD}18 0%, transparent 50%)`,
      }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    />
  );
}
