import { motion } from "framer-motion";
import { BG, GOLD, GOLD_BRIGHT, TEXT_DIM, TEXT } from "./_shared";
import { ConceptLabel } from "./DotVessel";

/**
 * C. FIRST THREAD OF DAWN  —  ٱلْخَيْطُ ٱلْأَبْيَض
 * The Quran defines fajr as the moment "the white thread of dawn becomes
 * distinct from the black thread of night" (al-Baqarah 2:187). For a
 * prayer app, fajr is the cornerstone — the day begins with light.
 *
 * Animation: deep night fills the screen. A horizon line appears.
 * From it, a single thin sliver of light breaks upward (the first
 * thread). It blooms across the horizon, and the wordmark surfaces
 * from inside the light.
 */
export function FajrThreshold() {
  const loop = 7;

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{ backgroundColor: "#04080A" }}
    >
      {/* Sky gradient overlay that warms during the bloom */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, #04080A 0%, ${BG} 50%, #0A1A12 100%)`,
        }}
        animate={{ opacity: [1, 1, 0.6, 0.6, 1] }}
        transition={{ duration: loop, times: [0, 0.3, 0.6, 0.92, 1], repeat: Infinity }}
      />

      {/* Warm dawn glow */}
      <motion.div
        className="absolute left-0 right-0"
        style={{
          height: 380,
          top: 380,
          background: `radial-gradient(ellipse at 50% 0%, ${GOLD_BRIGHT}55 0%, ${GOLD}33 20%, transparent 55%)`,
          filter: "blur(0px)",
        }}
        animate={{ opacity: [0, 0, 1, 1, 0] }}
        transition={{ duration: loop, times: [0, 0.3, 0.55, 0.92, 1], repeat: Infinity, ease: "easeOut" }}
      />

      {/* Stars — fade out as dawn breaks */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.7, 0.7, 0.1, 0.05, 0.7] }}
        transition={{ duration: loop, times: [0, 0.25, 0.55, 0.92, 1], repeat: Infinity }}
      >
        {STARS.map((s, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.r,
              height: s.r,
              backgroundColor: TEXT,
              opacity: s.o,
              boxShadow: `0 0 ${s.r * 2}px ${TEXT}`,
            }}
            animate={{ opacity: [s.o * 0.4, s.o, s.o * 0.4] }}
            transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>

      {/* Horizon line (the boundary between night and the thread of dawn) */}
      <motion.div
        className="absolute left-0 right-0"
        style={{
          top: 460,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${GOLD}66, ${GOLD_BRIGHT}, ${GOLD}66, transparent)`,
        }}
        animate={{ opacity: [0, 0.6, 0.9, 0.9, 0], scaleX: [0.4, 1, 1, 1, 0.6] }}
        transition={{ duration: loop, times: [0, 0.18, 0.55, 0.92, 1], repeat: Infinity, ease: "easeOut" }}
      />

      {/* THE THREAD — the thin sliver of fajr light breaking above the horizon */}
      <motion.div
        className="absolute left-1/2"
        style={{
          top: 380,
          width: 2,
          background: `linear-gradient(180deg, transparent, ${GOLD_BRIGHT})`,
          transformOrigin: "bottom center",
          translateX: "-50%",
        }}
        animate={{
          height: [0, 0, 80, 80, 0],
          opacity: [0, 0, 1, 1, 0],
          width: [2, 2, 2, 220, 2],
        }}
        transition={{
          duration: loop,
          times: [0, 0.22, 0.4, 0.6, 1],
          repeat: Infinity,
          ease: [0.22, 1, 0.36, 1],
        }}
      />

      {/* Land silhouette — subtle */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: 380,
          background: `linear-gradient(180deg, transparent 0%, #05100B 40%, #03080A 100%)`,
        }}
      />

      {/* Wordmark surfacing from inside the light */}
      <motion.div
        className="absolute left-0 right-0 flex flex-col items-center"
        style={{ top: 270 }}
        animate={{ opacity: [0, 0, 0, 1, 1, 0], y: [-12, -12, -12, 0, 0, 0] }}
        transition={{ duration: loop, times: [0, 0.45, 0.6, 0.7, 0.95, 1], repeat: Infinity }}
      >
        <div
          style={{
            fontFamily: "'Amiri', serif",
            fontSize: 56,
            color: GOLD_BRIGHT,
            lineHeight: 1,
            textShadow: `0 0 24px ${GOLD_BRIGHT}AA, 0 0 60px ${GOLD}66`,
            letterSpacing: 2,
          }}
        >
          نُور
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontSize: 16,
            letterSpacing: 9,
            color: GOLD_BRIGHT,
            marginTop: 16,
          }}
        >
          NUUR
        </div>
      </motion.div>

      {/* Tagline floats below */}
      <motion.div
        className="absolute left-0 right-0 flex justify-center"
        style={{ bottom: 120 }}
        animate={{ opacity: [0, 0, 0, 1, 1, 0] }}
        transition={{ duration: loop, times: [0, 0.6, 0.72, 0.8, 0.95, 1], repeat: Infinity }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: 12,
            letterSpacing: 3,
            color: TEXT_DIM,
            textTransform: "uppercase",
          }}
        >
          Begin each day with light
        </div>
      </motion.div>

      <ConceptLabel index="C" name="Khayṭ al-Fajr" />
    </div>
  );
}

const STARS = [
  { x: 12, y: 12, r: 1.2, o: 0.7 },
  { x: 28, y: 8, r: 1, o: 0.5 },
  { x: 45, y: 18, r: 1.6, o: 0.8 },
  { x: 62, y: 10, r: 1, o: 0.6 },
  { x: 78, y: 22, r: 1.3, o: 0.7 },
  { x: 88, y: 14, r: 1, o: 0.55 },
  { x: 18, y: 30, r: 0.9, o: 0.45 },
  { x: 36, y: 35, r: 1.1, o: 0.6 },
  { x: 55, y: 28, r: 0.9, o: 0.5 },
  { x: 70, y: 36, r: 1.4, o: 0.75 },
  { x: 84, y: 40, r: 1, o: 0.55 },
  { x: 8, y: 25, r: 1, o: 0.5 },
  { x: 92, y: 28, r: 1.2, o: 0.65 },
  { x: 50, y: 5, r: 1, o: 0.55 },
];
