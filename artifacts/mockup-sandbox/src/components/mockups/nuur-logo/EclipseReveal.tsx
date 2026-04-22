import { motion } from "framer-motion";
import { ConceptLabel, Wordmark } from "./_label";

/**
 * D. ECLIPSE REVEAL  —  ن emerges from the body of the light itself
 *
 * A solid disc of brilliant gold light fills the centre. Then a dark
 * crescent sweeps across it like an eclipse, but the dark stops short
 * — what remains visible from the original disc is shaped like the
 * letter ن. The letter is literally CARVED from the body of light.
 * Then the disc blooms outward as rays and the wordmark resolves.
 *
 * Reading: the letter is what survives the dark. ن is the part of
 * the light that the dark cannot cover.
 */
export function EclipseReveal() {
  const loop = 7;
  const W = 390;
  const H = 844;
  const cx = W / 2;
  const cy = 360;
  const R = 130;

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{ backgroundColor: "#04060A" }}
    >
      {/* Outer glow that pulses with the disc */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: cx - 280,
          top: cy - 280,
          width: 560,
          height: 560,
          background: `radial-gradient(circle, #E8B85C44 0%, #C9933A22 30%, transparent 60%)`,
          pointerEvents: "none",
        }}
        animate={{ opacity: [0, 0.5, 0.95, 0.95, 0], scale: [0.6, 0.9, 1, 1.05, 0.95] }}
        transition={{ duration: loop, times: [0, 0.15, 0.35, 0.92, 1], repeat: Infinity }}
      />

      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0"
      >
        <defs>
          <radialGradient id="discGrad" cx="0.5" cy="0.45">
            <stop offset="0%" stopColor="#FFFCEC" />
            <stop offset="40%" stopColor="#FFE9B0" />
            <stop offset="100%" stopColor="#C9933A" />
          </radialGradient>
          {/* Mask: white circle minus the eclipsing dark + minus the rest
              of the disc the dark covers, leaving only ن visible. */}
          <mask id="eclipse">
            {/* Start with a fully visible white disc */}
            <circle cx={cx} cy={cy} r={R} fill="white" />
            {/* Eclipsing dark crescent — covers most of the disc EXCEPT
                where the ن glyph sits. We carve the disc with a
                rectangle that has the ن cut OUT of it. */}
            <motion.g
              animate={{ opacity: [0, 0, 1, 1, 1, 0] }}
              transition={{ duration: loop, times: [0, 0.15, 0.4, 0.65, 0.92, 1], repeat: Infinity }}
            >
              {/* Cover whole disc area in black */}
              <rect x={cx - R - 20} y={cy - R - 20} width={(R + 20) * 2} height={(R + 20) * 2} fill="black" />
              {/* PUNCH the ن shape back to white — these areas remain visible.
                  Bowl drawn as a thick stroke (calligraphic), dot as a diamond. */}
              <g transform={`translate(${cx} ${cy})`}>
                <path
                  d="M -78 -28 Q -78 70 0 70 Q 78 70 78 -28"
                  stroke="white"
                  strokeWidth={26}
                  fill="none"
                  strokeLinecap="round"
                />
                <circle cx={-78} cy={-28} r={7} fill="white" />
                <circle cx={78} cy={-28} r={7} fill="white" />
                <rect
                  x={-9}
                  y={-78}
                  width={18}
                  height={18}
                  fill="white"
                  transform="rotate(45 0 -69)"
                />
              </g>
            </motion.g>
          </mask>
        </defs>

        {/* PHASE 1: full disc — pure light, no eclipse yet */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={R}
          fill="url(#discGrad)"
          mask="url(#eclipse)"
          animate={{ opacity: [0, 1, 1, 1, 0] }}
          transition={{ duration: loop, times: [0, 0.12, 0.7, 0.92, 1], repeat: Infinity }}
        />

        {/* PHASE 3 (overlay): rays radiating outward when eclipse releases */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((ang, i) => (
          <motion.line
            key={ang}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos((ang * Math.PI) / 180) * (R + 70)}
            y2={cy + Math.sin((ang * Math.PI) / 180) * (R + 70)}
            stroke="#E8B85C"
            strokeWidth={1}
            strokeOpacity={0.7}
            strokeLinecap="round"
            animate={{
              x2: [cx, cx + Math.cos((ang * Math.PI) / 180) * (R + 10), cx + Math.cos((ang * Math.PI) / 180) * (R + 70)],
              y2: [cy, cy + Math.sin((ang * Math.PI) / 180) * (R + 10), cy + Math.sin((ang * Math.PI) / 180) * (R + 70)],
              opacity: [0, 0, 0, 0.7, 0],
            }}
            transition={{
              duration: loop,
              times: [0, 0.65, 0.7, 0.78, 0.92],
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.01,
            }}
          />
        ))}
      </svg>

      {/* Wordmark — appears just as the disc finishes blooming */}
      <motion.div
        className="absolute left-0 right-0 flex justify-center"
        style={{ bottom: 150 }}
        animate={{ opacity: [0, 0, 0, 1, 1, 0] }}
        transition={{ duration: loop, times: [0, 0.65, 0.78, 0.85, 0.95, 1], repeat: Infinity }}
      >
        <Wordmark tagline="What survives the dark" />
      </motion.div>

      <ConceptLabel index="D" name="kusūf · revealed by eclipse" />
    </div>
  );
}
