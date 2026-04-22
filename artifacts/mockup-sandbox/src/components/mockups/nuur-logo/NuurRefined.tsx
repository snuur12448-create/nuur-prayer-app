import { motion } from "framer-motion";

/**
 * NUUR — Refined Splash (animation-only refinement)
 *
 * Visually IDENTICAL to the existing NuurLogo + NuurSplash:
 *   • Outer ring (160), Mid ring (120)
 *   • 8 sun rays at 45° intervals (2px × 26px, gap 4 from outer ring)
 *   • Inner circle (80) with ن glyph centered
 *   • Wordmark: نُور + ✸ divider + NUUR + tagline
 *
 * No new shapes, no extra particles, no ripples — only the timing
 * and easing of how the existing elements enter and breathe is new.
 *
 * Choreography (6.5s loop):
 *   0.0–0.7s  Inner circle + ن glyph fade in & settle (the heart first)
 *   0.7–1.6s  8 rays sweep CLOCKWISE one by one (staggered)
 *   1.6–2.0s  Mid ring fades in
 *   2.0–2.4s  Outer ring fades in
 *   2.4–3.0s  Wordmark rises in below
 *   3.0–5.5s  Hold — gentle synchronised breathing (rings + glyph
 *             pulse together, ~3s sine cycle)
 *   5.5–6.5s  Fade out, loop
 */

const BG = "#09150D";
const GOLD = "#C9933A";
const GOLD_BRIGHT = "#E8B85C";
const GOLD_DIM = "#C9933A55";
const GOLD_FAINT = "#C9933A18";

export function NuurRefined() {
  const loop = 6.5;

  // Phase keyframe times (fractions of loop) — referenced everywhere so
  // the choreography stays internally consistent.
  const t = {
    coreIn: 0.0,
    coreSettled: 0.11,
    raysStart: 0.11,
    raysEnd: 0.25,
    midIn: 0.25,
    midDone: 0.31,
    outerIn: 0.31,
    outerDone: 0.37,
    textIn: 0.37,
    textDone: 0.46,
    holdEnd: 0.85,
    fadeOut: 1.0,
  };

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center"
      style={{ backgroundColor: BG }}
    >
      {/* Container fades to 0 at end of loop, then restarts */}
      <motion.div
        className="flex flex-col items-center"
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: loop, times: [0, 0.04, t.holdEnd, 1], repeat: Infinity }}
      >
        {/* THE LOGO MARK — 160x160 stage, exact same composition as
            NuurLogo.tsx in the real app. */}
        <div
          className="relative"
          style={{ width: 160, height: 160, marginBottom: 32 }}
        >
          {/* OUTER RING (160) — fades in last among the rings */}
          <motion.div
            className="absolute"
            style={{
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: GOLD_FAINT,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: GOLD_DIM,
              top: 0,
              left: 0,
            }}
            animate={{
              opacity: [0, 0, 0, 1, 0.88, 1, 0.88, 0],
              scale: [1, 1, 1, 1, 1.03, 1, 1.03, 1],
            }}
            transition={{
              duration: loop,
              times: [0, t.outerIn, t.outerDone - 0.02, t.outerDone, 0.55, 0.7, 0.85, 1],
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* MID RING (120) — fades in just before outer */}
          <motion.div
            className="absolute"
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: GOLD + "10",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: GOLD + "55",
              top: 20,
              left: 20,
            }}
            animate={{
              opacity: [0, 0, 0, 1, 0.78, 1, 0.78, 0],
              scale: [1, 1, 1, 1, 1.04, 1, 1.04, 1],
            }}
            transition={{
              duration: loop,
              times: [0, t.midIn, t.midDone - 0.02, t.midDone, 0.55, 0.7, 0.85, 1],
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* 8 RAYS — sweep clockwise from 12 o'clock.
              Each ray is positioned via rotation around the center, with
              the ray itself drawn at the TOP edge (marginTop:4 from rim),
              EXACTLY matching the React Native rayWrap pattern. */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => {
            // Stagger each ray across the rays phase (0.11 → 0.25)
            const rayDur = t.raysEnd - t.raysStart;
            const start = t.raysStart + (i / 8) * rayDur * 0.8;
            const peak = start + 0.04;
            return (
              <div
                key={ang}
                className="absolute"
                style={{
                  width: 160,
                  height: 160,
                  top: 0,
                  left: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  transform: `rotate(${ang}deg)`,
                }}
              >
                <motion.div
                  style={{
                    width: 2,
                    height: 26,
                    borderRadius: 1,
                    backgroundColor: GOLD,
                    marginTop: 4,
                    transformOrigin: "center top",
                  }}
                  animate={{
                    opacity: [0, 0, 0, 0.85, 0.85, 0.85, 0.85, 0],
                    scaleY: [0, 0, 0, 1, 1, 1, 1, 1],
                  }}
                  transition={{
                    duration: loop,
                    times: [0, start - 0.001, start, peak, 0.55, 0.75, t.holdEnd, 1],
                    repeat: Infinity,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              </div>
            );
          })}

          {/* INNER CIRCLE (80) + ن GLYPH — fades in FIRST and settles */}
          <motion.div
            className="absolute flex items-center justify-center"
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: GOLD + "22",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: GOLD + "88",
              top: 40,
              left: 40,
            }}
            animate={{
              opacity: [0, 1, 1, 1, 1, 1, 1, 0],
              scale: [0.7, 1.04, 1, 1, 1.025, 1, 1.025, 1],
            }}
            transition={{
              duration: loop,
              times: [0, 0.06, t.coreSettled, 0.4, 0.55, 0.7, 0.85, 1],
              repeat: Infinity,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <motion.span
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: 38,
                color: GOLD_BRIGHT,
                textShadow: `0 0 10px ${GOLD}`,
                lineHeight: 1,
              }}
              animate={{
                opacity: [0, 0, 1, 1, 0.92, 1, 0.92, 0],
              }}
              transition={{
                duration: loop,
                times: [0, 0.04, 0.1, 0.5, 0.62, 0.74, 0.85, 1],
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              ن
            </motion.span>
          </motion.div>
        </div>

        {/* WORDMARK — rises in after rings settle */}
        <motion.div
          className="flex flex-col items-center"
          animate={{
            opacity: [0, 0, 0, 1, 1, 0],
            y: [10, 10, 10, 0, 0, 0],
          }}
          transition={{
            duration: loop,
            times: [0, t.outerDone, t.textIn, t.textDone, t.holdEnd, 1],
            repeat: Infinity,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div
            style={{
              fontFamily: "'Amiri', serif",
              fontSize: 52,
              color: GOLD_BRIGHT,
              letterSpacing: 2,
              lineHeight: 1.23,
              textShadow: `0 0 12px ${GOLD}88`,
            }}
          >
            نُور
          </div>

          <div className="flex items-center" style={{ gap: 10, marginTop: 4 }}>
            <div style={{ width: 40, height: 1, backgroundColor: GOLD + "55" }} />
            <span style={{ fontSize: 11, color: GOLD }}>✸</span>
            <div style={{ width: 40, height: 1, backgroundColor: GOLD + "55" }} />
          </div>

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
      </motion.div>
    </div>
  );
}
