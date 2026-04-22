import { motion } from "framer-motion";

/**
 * NUUR — Refined Splash
 *
 * Same composition as the existing logo (concentric rings + ن in inner
 * circle + 8 sun rays + wordmark) but with intentional choreography:
 *
 *   Phase 1 (0.0–0.7s) — A single point of light (the seed) fades in
 *      dead-center. This is the niqṭa, the dot from which all light
 *      grows. It pulses gently for one beat.
 *   Phase 2 (0.7–1.0s) — The inner circle draws itself around the seed
 *      (stroke-dashoffset). Feels like a chalice forming around the flame.
 *   Phase 3 (1.0–1.2s) — The seed crossfades into the ن glyph.
 *   Phase 4 (1.2–1.9s) — The 8 rays sweep outward CLOCKWISE in a
 *      staggered cascade, each tipped with a tiny gold bead.
 *   Phase 5 (1.9–2.4s) — The mid ring, then the outer ring, draw
 *      themselves concentrically outward (ripples broadcasting from
 *      the core).
 *   Phase 6 (2.4–3.2s) — The whole logo breathes once — a soft pulse.
 *      The wordmark fades in below with a tiny upward float.
 *   Phase 7 (3.2–5.5s) — Hold. The ن glyph shimmers gently like a
 *      candle (opacity 0.85↔1.0). Rays receive a single sweep of light.
 *   Phase 8 (5.5–6.5s) — Fade out, loop.
 */

const BG = "#09150D";
const GOLD = "#C9933A";
const GOLD_BRIGHT = "#E8B85C";
const GOLD_SOFT = "#F0CB7A";

export function NuurRefined() {
  const loop = 6.5;

  // Stage center for the logo art (SVG is 220x220 placed at upper-mid)
  const SZ = 220;
  const cx = SZ / 2;
  const cy = SZ / 2;
  const rOuter = 80;
  const rMid = 60;
  const rInner = 40;

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex flex-col items-center"
      style={{ backgroundColor: BG, paddingTop: 220 }}
    >
      {/* Soft ambient atmosphere — almost invisible, just lifts the BG slightly */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 38%, ${GOLD}10 0%, transparent 55%)`,
        }}
      />

      {/* THE LOGO MARK */}
      <svg width={SZ} height={SZ} viewBox={`0 0 ${SZ} ${SZ}`} style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="seedGlow">
            <stop offset="0%" stopColor="#FFFCEC" stopOpacity={1} />
            <stop offset="40%" stopColor={GOLD_BRIGHT} stopOpacity={0.9} />
            <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
          </radialGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="seedGlowFilter">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* OUTER RING — draws itself in phase 5 */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={rOuter}
          fill={`${GOLD}10`}
          stroke={`${GOLD}55`}
          strokeWidth={1}
          animate={{
            pathLength: [0, 0, 0, 0, 0, 1, 1, 1],
            opacity: [0, 0, 0, 0, 0, 0.9, 0.9, 0],
          }}
          transition={{
            duration: loop,
            times: [0, 0.05, 0.1, 0.18, 0.32, 0.42, 0.92, 1],
            repeat: Infinity,
            ease: "easeOut",
          }}
        />

        {/* MID RING — draws itself slightly before outer */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={rMid}
          fill={`${GOLD}10`}
          stroke={`${GOLD}88`}
          strokeWidth={1}
          animate={{
            pathLength: [0, 0, 0, 0, 1, 1, 1, 0],
            opacity: [0, 0, 0, 0, 0.95, 0.95, 0.95, 0],
          }}
          transition={{
            duration: loop,
            times: [0, 0.05, 0.1, 0.28, 0.36, 0.42, 0.92, 1],
            repeat: Infinity,
            ease: "easeOut",
          }}
        />

        {/* RIPPLE — one extra ring expanding past the outer ring and fading.
            Feels like the logo is broadcasting light. */}
        <motion.circle
          cx={cx}
          cy={cy}
          fill="none"
          stroke={GOLD_BRIGHT}
          strokeWidth={1}
          animate={{
            r: [rOuter, rOuter, rOuter, rOuter, rOuter + 30, rOuter + 30],
            opacity: [0, 0, 0, 0, 0.6, 0],
          }}
          transition={{
            duration: loop,
            times: [0, 0.05, 0.4, 0.42, 0.55, 0.65],
            repeat: Infinity,
            ease: "easeOut",
          }}
        />

        {/* 8 RAYS — sweep clockwise, staggered. Each has a tiny bead at the tip. */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => {
          const rad = ((ang - 90) * Math.PI) / 180; // -90 so 0° = top
          const x1 = cx + Math.cos(rad) * (rOuter + 4);
          const y1 = cy + Math.sin(rad) * (rOuter + 4);
          const x2 = cx + Math.cos(rad) * (rOuter + 26);
          const y2 = cy + Math.sin(rad) * (rOuter + 26);
          // Stagger each ray sweep across phase 4 (0.18 → 0.30 of loop)
          const delayFrac = 0.18 + (i / 8) * 0.12;
          return (
            <g key={ang}>
              {/* The ray line */}
              <motion.line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={GOLD}
                strokeWidth={2}
                strokeLinecap="round"
                animate={{
                  opacity: [0, 0, 0, 0.85, 0.85, 0.85, 0],
                  pathLength: [0, 0, 0, 1, 1, 1, 1],
                }}
                transition={{
                  duration: loop,
                  times: [0, 0.05, delayFrac, delayFrac + 0.04, 0.4, 0.92, 1],
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              {/* Tiny bead at the ray's outer tip — adds craft/precision */}
              <motion.circle
                cx={x2}
                cy={y2}
                r={1.4}
                fill={GOLD_BRIGHT}
                animate={{
                  opacity: [0, 0, 0, 0, 1, 1, 0],
                  scale: [0, 0, 0, 0, 1, 1, 0],
                }}
                transition={{
                  duration: loop,
                  times: [0, 0.05, delayFrac, delayFrac + 0.04, delayFrac + 0.08, 0.92, 1],
                  repeat: Infinity,
                }}
              />
            </g>
          );
        })}

        {/* INNER CIRCLE — draws itself around the seed in phase 2 */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={rInner}
          fill={`${GOLD}22`}
          stroke={`${GOLD_BRIGHT}`}
          strokeWidth={1.5}
          animate={{
            pathLength: [0, 0, 0, 1, 1, 1, 1, 0],
            opacity: [0, 0, 0, 1, 1, 1, 1, 0],
          }}
          transition={{
            duration: loop,
            times: [0, 0.04, 0.1, 0.16, 0.28, 0.42, 0.92, 1],
            repeat: Infinity,
            ease: "easeOut",
          }}
        />

        {/* THE SEED — brilliant point of light, the niqṭa from which the
            mark is born. Visible only during phase 1, then crossfades
            into the ن glyph below. */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={28}
          fill="url(#seedGlow)"
          filter="url(#seedGlowFilter)"
          animate={{
            opacity: [0, 1, 1, 0.6, 0, 0, 0, 0],
            scale: [0.3, 1.1, 1, 0.9, 0.7, 0.7, 0.7, 0.7],
          }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          transition={{
            duration: loop,
            times: [0, 0.05, 0.12, 0.16, 0.2, 0.5, 0.92, 1],
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
        <motion.circle
          cx={cx}
          cy={cy}
          r={4}
          fill="#FFFCEC"
          animate={{
            opacity: [0, 1, 1, 0, 0, 0, 0, 0],
          }}
          transition={{
            duration: loop,
            times: [0, 0.05, 0.12, 0.18, 0.3, 0.5, 0.92, 1],
            repeat: Infinity,
          }}
        />
      </svg>

      {/* THE ن GLYPH — overlaid in HTML for crisp Amiri rendering.
          Crossfades in at phase 3, gently shimmers (candle-flicker) during hold. */}
      <motion.div
        className="absolute"
        style={{
          top: 220 + cy - 24,
          fontFamily: "'Amiri', serif",
          fontSize: 38,
          color: GOLD_BRIGHT,
          textShadow: `0 0 10px ${GOLD}`,
          lineHeight: 1,
          pointerEvents: "none",
        }}
        animate={{
          opacity: [0, 0, 0, 0, 1, 0.92, 1, 0.92, 1, 0],
        }}
        transition={{
          duration: loop,
          times: [0, 0.05, 0.16, 0.18, 0.22, 0.55, 0.7, 0.85, 0.92, 1],
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        ن
      </motion.div>

      {/* WORDMARK — fades in with a tiny upward float at phase 6 */}
      <motion.div
        className="flex flex-col items-center"
        style={{ marginTop: 60 }}
        animate={{
          opacity: [0, 0, 0, 0, 0, 1, 1, 1, 0],
          y: [12, 12, 12, 12, 12, 0, 0, 0, 0],
        }}
        transition={{
          duration: loop,
          times: [0, 0.05, 0.3, 0.4, 0.45, 0.55, 0.7, 0.92, 1],
          repeat: Infinity,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* نُور — Amiri */}
        <div
          style={{
            fontFamily: "'Amiri', serif",
            fontSize: 52,
            color: GOLD_BRIGHT,
            letterSpacing: 2,
            lineHeight: 1.1,
            textShadow: `0 0 12px ${GOLD}88`,
          }}
        >
          نُور
        </div>

        {/* Divider line + star + line */}
        <div className="flex items-center gap-3" style={{ marginTop: 6 }}>
          <div style={{ width: 40, height: 1, backgroundColor: `${GOLD}55` }} />
          <span style={{ fontSize: 11, color: GOLD }}>✸</span>
          <div style={{ width: 40, height: 1, backgroundColor: `${GOLD}55` }} />
        </div>

        {/* NUUR — Georgia (matches RN Platform.select) */}
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 18,
            color: GOLD_BRIGHT,
            letterSpacing: 8,
            marginTop: 8,
          }}
        >
          NUUR
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontSize: 13,
            color: "#8BAF8E",
            letterSpacing: 1.5,
            marginTop: 8,
          }}
        >
          Light for your daily deen
        </div>
      </motion.div>

      {/* SWEEP — a single horizontal pass of light across the rays during hold,
          to give the logo a moment of life rather than freezing static. */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          top: 220 + cy - 110,
          left: "50%",
          width: 240,
          height: 240,
          marginLeft: -120,
          background: `linear-gradient(110deg, transparent 35%, ${GOLD_BRIGHT}55 50%, transparent 65%)`,
          mixBlendMode: "screen",
          borderRadius: "50%",
        }}
        animate={{
          opacity: [0, 0, 0, 0, 0, 0, 0.7, 0, 0],
          x: [-160, -160, -160, -160, -160, -160, 160, 160, 160],
        }}
        transition={{
          duration: loop,
          times: [0, 0.1, 0.45, 0.55, 0.62, 0.66, 0.78, 0.85, 1],
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
