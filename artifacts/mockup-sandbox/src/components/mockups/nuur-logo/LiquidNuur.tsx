import { motion } from "framer-motion";
import { ConceptLabel, Wordmark } from "./_label";

/**
 * C. LIQUID NUUR  —  the word نور written in pure liquid light
 *
 * No parchment, no ink, no surface. Just darkness. A leading
 * point of brilliant light flies right-to-left across the screen,
 * trailing a continuous ribbon of molten gold that draws the
 * three letters of نور — ر, then و, then the bowl & dot of ن —
 * forming the entire word out of light alone.
 *
 * Reading: the word IS light. The letterforms are made of nothing
 * but luminescence. There is no scaffold, no surface, no ink.
 */
export function LiquidNuur() {
  const loop = 7;

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex items-center justify-center"
      style={{
        background: `radial-gradient(ellipse at 50% 40%, #0E1014 0%, #050306 70%)`,
      }}
    >
      <svg width={360} height={260} viewBox="0 0 360 260" style={{ marginTop: -50 }}>
        <defs>
          <linearGradient id="liquidGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#C9933A" stopOpacity={0.9} />
            <stop offset="50%" stopColor="#FFE9B0" stopOpacity={1} />
            <stop offset="100%" stopColor="#C9933A" stopOpacity={0.9} />
          </linearGradient>
          <filter id="liquidGlow">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="liquidGlowWide">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* WIDE underglow stroke — gives the word a halo even before
            the crisp line completes */}
        <motion.path
          d="M 330 130
             L 280 130
             Q 260 130 260 150
             Q 260 170 280 170
             Q 300 170 300 150
             L 300 110

             M 240 170
             Q 240 130 210 130
             Q 180 130 180 170

             M 150 170
             Q 150 130 110 110
             Q 70 130 70 170
             L 70 110

             M 110 95 L 110 75"
          fill="none"
          stroke="#E8B85C"
          strokeWidth={16}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity={0.55}
          filter="url(#liquidGlowWide)"
          animate={{ pathLength: [0, 0.05, 1, 1, 1, 0] }}
          transition={{
            duration: loop,
            times: [0, 0.1, 0.65, 0.75, 0.92, 1],
            repeat: Infinity,
            ease: [0.45, 0, 0.55, 1],
          }}
        />

        {/* CRISP molten core — the actual writing */}
        <motion.path
          d="M 330 130
             L 280 130
             Q 260 130 260 150
             Q 260 170 280 170
             Q 300 170 300 150
             L 300 110

             M 240 170
             Q 240 130 210 130
             Q 180 130 180 170

             M 150 170
             Q 150 130 110 110
             Q 70 130 70 170
             L 70 110

             M 110 95 L 110 75"
          fill="none"
          stroke="url(#liquidGrad)"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#liquidGlow)"
          animate={{ pathLength: [0, 0.05, 1, 1, 1, 0] }}
          transition={{
            duration: loop,
            times: [0, 0.1, 0.65, 0.75, 0.92, 1],
            repeat: Infinity,
            ease: [0.45, 0, 0.55, 1],
          }}
        />

        {/* The dot of ن — placed last as the final mark of light */}
        <motion.circle
          cx={110}
          cy={55}
          r={6}
          fill="#FFFCEC"
          filter="url(#liquidGlow)"
          animate={{
            scale: [0, 0, 0, 0, 1, 1, 0],
            opacity: [0, 0, 0, 0, 1, 1, 0],
          }}
          transition={{
            duration: loop,
            times: [0, 0.6, 0.65, 0.7, 0.75, 0.92, 1],
            repeat: Infinity,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        />
      </svg>

      {/* Tagline only (the word IS the artwork above) */}
      <motion.div
        className="absolute left-0 right-0 flex justify-center"
        style={{ bottom: 180 }}
        animate={{ opacity: [0, 0, 0, 1, 1, 0] }}
        transition={{ duration: loop, times: [0, 0.65, 0.75, 0.82, 0.95, 1], repeat: Infinity }}
      >
        <div className="flex flex-col items-center">
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              fontSize: 22,
              letterSpacing: 14,
              color: "#E8B85C",
            }}
          >
            NUUR
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: 11,
              letterSpacing: 3,
              color: "rgba(240,237,228,0.55)",
              marginTop: 16,
              textTransform: "uppercase",
            }}
          >
            Written in light
          </div>
        </div>
      </motion.div>

      <ConceptLabel index="C" name="نور · the word made light" />
    </div>
  );
}
