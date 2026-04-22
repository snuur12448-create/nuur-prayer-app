import { motion } from "framer-motion";
import { ConceptLabel, Wordmark } from "./_label";

/**
 * B. IGNITION  —  the dot of ن lights the whole letter
 *
 * The ن is faintly traced in cold dim outline. The orphan dot above
 * the bowl ignites as a spark. From that spark, light travels along
 * the curve of the bowl like fire along a fuse, igniting the letter
 * stroke-by-stroke until the whole ن is incandescent gold.
 *
 * Reading: the dot is the seed of light; the letter is its conductor.
 * Light is BORN in the letter and TRAVELS through it.
 */
export function Ignition() {
  const loop = 7;

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: "#06090C" }}
    >
      {/* Ambient glow that grows as the letter ignites */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 460,
          height: 460,
          background: `radial-gradient(circle, #C9933A33 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
        animate={{ opacity: [0, 0, 0.4, 0.9, 0.9, 0], scale: [0.7, 0.8, 1, 1.05, 1.05, 0.9] }}
        transition={{ duration: loop, times: [0, 0.2, 0.5, 0.7, 0.92, 1], repeat: Infinity }}
      />

      <svg width={340} height={300} viewBox="0 0 340 300" style={{ marginTop: -120 }}>
        <defs>
          {/* Gradient that gives the glowing stroke a molten core */}
          <linearGradient id="moltenN" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#C9933A" stopOpacity={0.9} />
            <stop offset="50%" stopColor="#FFE9B0" stopOpacity={1} />
            <stop offset="100%" stopColor="#FFFCEC" stopOpacity={1} />
          </linearGradient>
          <filter id="hotGlow">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="hotGlowSm">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        {/* Cold outline of the bowl — always visible as a "what will be" trace */}
        <path
          d="M 60 100
             Q 60 220 170 220
             Q 280 220 280 100"
          fill="none"
          stroke="#C9933A"
          strokeWidth={2}
          strokeOpacity={0.18}
          strokeLinecap="round"
        />
        {/* Cold outline of the dot */}
        <circle cx={170} cy={45} r={11} fill="none" stroke="#C9933A" strokeWidth={2} strokeOpacity={0.18} />

        {/* THE DOT — ignites first, becomes a brilliant spark */}
        <motion.circle
          cx={170}
          cy={45}
          r={11}
          fill="url(#moltenN)"
          filter="url(#hotGlowSm)"
          animate={{
            r: [0, 0, 8, 14, 12, 12, 12, 0],
            opacity: [0, 0, 0.6, 1, 1, 1, 1, 0],
          }}
          transition={{
            duration: loop,
            times: [0, 0.05, 0.12, 0.18, 0.25, 0.7, 0.92, 1],
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
        {/* Dot's halo — a brighter pulse around the spark */}
        <motion.circle
          cx={170}
          cy={45}
          r={22}
          fill="#FFE9B0"
          filter="url(#hotGlow)"
          animate={{ opacity: [0, 0, 0, 0.7, 0.4, 0.4, 0.4, 0] }}
          transition={{ duration: loop, times: [0, 0.1, 0.15, 0.22, 0.3, 0.7, 0.92, 1], repeat: Infinity }}
        />

        {/* THE GLOWING BOWL UNDERLAY — wide blurred stroke that lights up
            as the path draws. Gives the molten halo. */}
        <motion.path
          d="M 60 100
             Q 60 220 170 220
             Q 280 220 280 100"
          fill="none"
          stroke="#E8B85C"
          strokeWidth={18}
          strokeLinecap="round"
          strokeOpacity={0.55}
          filter="url(#hotGlow)"
          animate={{ pathLength: [0, 0, 0, 1, 1, 1, 0] }}
          transition={{
            duration: loop,
            times: [0, 0.18, 0.22, 0.55, 0.7, 0.92, 1],
            repeat: Infinity,
            ease: [0.65, 0, 0.35, 1],
          }}
        />
        {/* THE BOWL CORE — crisp molten line, slightly behind the underlay
            so the trail looks like fire moving through the curve */}
        <motion.path
          d="M 60 100
             Q 60 220 170 220
             Q 280 220 280 100"
          fill="none"
          stroke="url(#moltenN)"
          strokeWidth={6}
          strokeLinecap="round"
          animate={{ pathLength: [0, 0, 0, 1, 1, 1, 0] }}
          transition={{
            duration: loop,
            times: [0, 0.2, 0.24, 0.55, 0.7, 0.92, 1],
            repeat: Infinity,
            ease: [0.65, 0, 0.35, 1],
          }}
        />

        {/* Molten droplets at the bowl's lip — final flourishes */}
        <motion.circle
          cx={60}
          cy={100}
          r={6}
          fill="#FFE9B0"
          filter="url(#hotGlowSm)"
          animate={{ scale: [0, 0, 0, 0, 1, 1, 1, 0], opacity: [0, 0, 0, 0, 1, 1, 1, 0] }}
          transition={{ duration: loop, times: [0, 0.1, 0.3, 0.5, 0.6, 0.7, 0.92, 1], repeat: Infinity }}
        />
        <motion.circle
          cx={280}
          cy={100}
          r={6}
          fill="#FFE9B0"
          filter="url(#hotGlowSm)"
          animate={{ scale: [0, 0, 0, 0, 1, 1, 1, 0], opacity: [0, 0, 0, 0, 1, 1, 1, 0] }}
          transition={{ duration: loop, times: [0, 0.1, 0.3, 0.5, 0.6, 0.7, 0.92, 1], repeat: Infinity }}
        />
      </svg>

      {/* Wordmark */}
      <motion.div
        className="absolute left-0 right-0 flex justify-center"
        style={{ bottom: 150 }}
        animate={{ opacity: [0, 0, 0, 1, 1, 0] }}
        transition={{ duration: loop, times: [0, 0.6, 0.7, 0.78, 0.95, 1], repeat: Infinity }}
      >
        <Wordmark tagline="The dot ignites the letter" />
      </motion.div>

      <ConceptLabel index="B" name="ishrāq · the kindling" />
    </div>
  );
}
