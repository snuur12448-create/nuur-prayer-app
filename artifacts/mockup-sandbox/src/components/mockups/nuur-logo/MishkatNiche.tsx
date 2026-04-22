import { motion } from "framer-motion";
import { BG, GOLD, GOLD_BRIGHT, TEXT_DIM } from "./_shared";
import { ConceptLabel } from "./DotVessel";

/**
 * B. THE NICHE  —  ٱلْمِشْكَاة
 * Surah an-Nur 24:35: "The likeness of His light is as a niche, in
 * which is a lamp, the lamp in a glass, the glass like a brilliant star..."
 *
 * Animation: a mihrab arch is etched into the dark in gold line, then
 * a single point of lamplight blooms inside it. The light expands
 * upward and outward; the wordmark resolves underneath.
 */
export function MishkatNiche() {
  const loop = 7;

  return (
    <div
      className="min-h-screen w-full flex items-start justify-center relative overflow-hidden"
      style={{ backgroundColor: BG, paddingTop: 200 }}
    >
      {/* lamp halo */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 360,
          height: 360,
          background: `radial-gradient(circle, ${GOLD_BRIGHT}55 0%, ${GOLD}22 30%, transparent 60%)`,
          left: "50%",
          top: 230,
          transform: "translate(-50%, -50%)",
        }}
        animate={{ opacity: [0, 0, 0.9, 0.9, 0], scale: [0.5, 0.5, 1, 1.05, 1] }}
        transition={{ duration: loop, times: [0, 0.4, 0.6, 0.85, 1], repeat: Infinity, ease: "easeOut" }}
      />

      <svg width={260} height={420} viewBox="0 0 260 420" className="relative z-10">
        <defs>
          <linearGradient id="nicheStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GOLD} stopOpacity={0.4} />
            <stop offset="50%" stopColor={GOLD_BRIGHT} stopOpacity={1} />
            <stop offset="100%" stopColor={GOLD} stopOpacity={0.6} />
          </linearGradient>
          <radialGradient id="lampGlow">
            <stop offset="0%" stopColor="#FFF8DC" stopOpacity={1} />
            <stop offset="35%" stopColor={GOLD_BRIGHT} stopOpacity={0.9} />
            <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* The mihrab — pointed arch on a base. Drawn as one continuous path
            that strokes itself in. */}
        <motion.path
          d="M 60 400
             L 60 200
             Q 60 100 130 60
             Q 200 100 200 200
             L 200 400"
          fill="none"
          stroke="url(#nicheStroke)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ pathLength: [0, 1, 1, 1, 1], opacity: [0, 1, 1, 1, 0] }}
          transition={{ duration: loop, times: [0, 0.35, 0.7, 0.92, 1], repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Inner contour — slimmer arch echo for depth */}
        <motion.path
          d="M 78 395
             L 78 205
             Q 78 115 130 80
             Q 182 115 182 205
             L 182 395"
          fill="none"
          stroke={GOLD}
          strokeWidth={1}
          strokeOpacity={0.4}
          animate={{ pathLength: [0, 0, 1, 1, 1], opacity: [0, 0, 0.5, 0.5, 0] }}
          transition={{ duration: loop, times: [0, 0.4, 0.6, 0.92, 1], repeat: Infinity, ease: "easeOut" }}
        />

        {/* The lamp — a small ovoid suspended inside the arch */}
        <motion.g
          animate={{ opacity: [0, 0, 1, 1, 0] }}
          transition={{ duration: loop, times: [0, 0.42, 0.5, 0.92, 1], repeat: Infinity }}
        >
          {/* Suspension chain */}
          <line x1={130} y1={80} x2={130} y2={195} stroke={GOLD} strokeWidth={0.6} strokeOpacity={0.5} strokeDasharray="2 3" />
          {/* Lamp glow halo */}
          <circle cx={130} cy={230} r={70} fill="url(#lampGlow)" />
          {/* Lamp body — Mosque oil-lamp silhouette: bulb + stem */}
          <path
            d="M 130 200
               Q 105 200 105 220
               Q 105 250 130 260
               Q 155 250 155 220
               Q 155 200 130 200 Z"
            fill={GOLD_BRIGHT}
            opacity={0.95}
          />
          {/* Lamp wick / flame point */}
          <motion.circle
            cx={130}
            cy={210}
            r={3}
            fill="#FFFCEC"
            animate={{ r: [2.5, 3.5, 2.8, 3.5, 2.8] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>

        {/* Floor base line */}
        <motion.line
          x1={50}
          y1={400}
          x2={210}
          y2={400}
          stroke={GOLD}
          strokeWidth={1.5}
          strokeOpacity={0.6}
          animate={{ pathLength: [0, 1, 1, 1, 1] }}
          transition={{ duration: loop, times: [0, 0.3, 0.7, 0.92, 1], repeat: Infinity }}
        />
      </svg>

      {/* Wordmark */}
      <motion.div
        className="absolute left-0 right-0 flex flex-col items-center"
        style={{ bottom: 110 }}
        animate={{ opacity: [0, 0, 0, 1, 1, 0] }}
        transition={{ duration: loop, times: [0, 0.55, 0.72, 0.82, 0.95, 1], repeat: Infinity }}
      >
        <div
          style={{
            fontFamily: "'Amiri', serif",
            fontSize: 38,
            color: GOLD_BRIGHT,
            lineHeight: 1,
            textShadow: `0 0 18px ${GOLD}66`,
          }}
        >
          نُور
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontSize: 14,
            letterSpacing: 7,
            color: GOLD_BRIGHT,
            marginTop: 12,
          }}
        >
          NUUR
        </div>
        <div
          style={{
            fontFamily: "'Amiri', serif",
            fontStyle: "italic",
            fontSize: 11,
            color: TEXT_DIM,
            marginTop: 12,
            opacity: 0.85,
          }}
        >
          نُورٌ عَلَىٰ نُور · light upon light
        </div>
      </motion.div>

      <ConceptLabel index="B" name="Mishkāt" />
    </div>
  );
}
