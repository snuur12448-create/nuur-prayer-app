import { motion } from "framer-motion";
import { BG, GOLD, GOLD_BRIGHT, TEXT_DIM } from "./_shared";
import { ConceptLabel } from "./DotVessel";

/**
 * D. INKSTROKE  —  ٱلْقَلَم
 * Surah al-ʿAlaq 96:4: "Who taught by the pen — taught man what he
 * knew not." The first divine command was Iqra' (Recite). Light here
 * is the light of revelation, of inscription.
 *
 * Animation: a single drop of gold ink falls onto dark parchment,
 * blooms, and a calligrapher's hand draws نور in one continuous
 * sweep — the stroke writes itself in real time.
 */
export function Inkstroke() {
  const loop = 7;

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center"
      style={{
        background: `radial-gradient(ellipse at 50% 50%, #14140E 0%, #08070A 70%)`,
      }}
    >
      {/* Subtle parchment grain */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${GOLD}06 1px, transparent 1px)`,
          backgroundSize: "8px 8px",
          opacity: 0.5,
        }}
      />

      {/* Falling ink droplet */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: "50%",
          width: 14,
          height: 14,
          backgroundColor: GOLD_BRIGHT,
          transform: "translateX(-50%)",
          boxShadow: `0 0 16px ${GOLD_BRIGHT}, 0 0 36px ${GOLD}`,
        }}
        animate={{
          top: [80, 80, 320, 320, 320],
          opacity: [0, 1, 1, 0, 0],
          scale: [0.4, 1, 1, 2.4, 2.4],
        }}
        transition={{
          duration: loop,
          times: [0, 0.06, 0.2, 0.26, 1],
          repeat: Infinity,
          ease: [0.55, 0.06, 0.68, 0.19],
        }}
      />

      {/* Ink-bloom on impact */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: "50%",
          top: 320,
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          background: `radial-gradient(circle, ${GOLD_BRIGHT} 0%, ${GOLD}88 40%, transparent 70%)`,
        }}
        animate={{
          width: [0, 0, 0, 90, 60, 0],
          height: [0, 0, 0, 90, 60, 0],
          marginTop: [0, 0, 0, -45, -30, 0],
          marginLeft: [0, 0, 0, -45, -30, 0],
          opacity: [0, 0, 0, 0.9, 0.4, 0],
        }}
        transition={{
          duration: loop,
          times: [0, 0.18, 0.22, 0.3, 0.5, 0.7],
          repeat: Infinity,
          ease: "easeOut",
        }}
      />

      {/* The calligraphic stroke — kufic-inspired نور drawn as one path */}
      <svg width={320} height={200} viewBox="0 0 320 200" className="relative z-10" style={{ marginTop: 60 }}>
        <defs>
          <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={GOLD} stopOpacity={0.7} />
            <stop offset="50%" stopColor={GOLD_BRIGHT} stopOpacity={1} />
            <stop offset="100%" stopColor={GOLD} stopOpacity={0.7} />
          </linearGradient>
          <filter id="inkGlow">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Soft underglow */}
        <motion.path
          d="M 290 100
             L 230 100
             Q 215 100 215 115
             Q 215 130 230 130
             Q 245 130 245 115
             L 245 80

             M 200 130
             Q 200 100 175 100
             Q 150 100 150 130

             M 130 130
             Q 130 105 110 95
             Q 90 105 90 130
             L 90 80
             M 90 75 L 90 70"
          fill="none"
          stroke={GOLD}
          strokeWidth={14}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.25}
          filter="url(#inkGlow)"
          animate={{ pathLength: [0, 0, 1, 1, 1], opacity: [0, 0, 0.3, 0.3, 0.3] }}
          transition={{ duration: loop, times: [0, 0.3, 0.65, 0.9, 1], repeat: Infinity, ease: "easeOut" }}
        />

        {/* Crisp inked stroke — Right to left, mimicking how Arabic is written.
            ر then و then ن. The stroke draws itself across the cycle. */}
        <motion.path
          d="M 290 100
             L 230 100
             Q 215 100 215 115
             Q 215 130 230 130
             Q 245 130 245 115
             L 245 80

             M 200 130
             Q 200 100 175 100
             Q 150 100 150 130

             M 130 130
             Q 130 105 110 95
             Q 90 105 90 130
             L 90 80
             M 90 75 L 90 70"
          fill="none"
          stroke="url(#strokeGrad)"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ pathLength: [0, 0, 1, 1, 1] }}
          transition={{ duration: loop, times: [0, 0.3, 0.7, 0.9, 1], repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
        />

        {/* Dot of ن — the niqṭa, placed last as the final flourish */}
        <motion.circle
          cx={110}
          cy={55}
          r={5}
          fill={GOLD_BRIGHT}
          animate={{ scale: [0, 0, 0, 1, 1], opacity: [0, 0, 0, 1, 1] }}
          transition={{
            duration: loop,
            times: [0, 0.3, 0.7, 0.78, 1],
            repeat: Infinity,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        />
      </svg>

      {/* Wordmark — latin only, since the Arabic is the artwork above */}
      <motion.div
        className="absolute left-0 right-0 flex flex-col items-center"
        style={{ bottom: 140 }}
        animate={{ opacity: [0, 0, 0, 1, 1, 0] }}
        transition={{ duration: loop, times: [0, 0.7, 0.8, 0.85, 0.95, 1], repeat: Infinity }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontSize: 22,
            letterSpacing: 14,
            color: GOLD_BRIGHT,
          }}
        >
          NUUR
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: 10,
            letterSpacing: 4,
            color: TEXT_DIM,
            marginTop: 18,
            textTransform: "uppercase",
          }}
        >
          Read · Reflect · Rise
        </div>
      </motion.div>

      <ConceptLabel index="D" name="Qalam" />
    </div>
  );
}
