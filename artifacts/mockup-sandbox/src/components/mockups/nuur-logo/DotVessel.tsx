import { motion } from "framer-motion";
import { BG, GOLD, GOLD_BRIGHT, TEXT_DIM } from "./_shared";

/**
 * A. THE VESSEL AND THE DOT  —  ٱلنُّقْطَة
 * In Arabic calligraphy the niqṭa (dot) is the seed from which every
 * letter grows. Light starts as a single dot. The bowl of the letter
 * ن then sweeps around the dot like a vessel cradling it.
 *
 * Reading: light is held by form. The dot doesn't go away — it stays
 * inside the bowl as the heart of the letter.
 */
export function DotVessel() {
  const loop = 7;
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: BG }}
    >
      <BackdropTexture />

      {/* The whole composition lives in this 280x280 stage so the
          motion can be precisely choreographed in coordinates. */}
      <div className="relative" style={{ width: 280, height: 320 }}>
        <motion.div
          key={`stage-${loop}`}
          className="absolute inset-0"
          animate={{ opacity: [0, 1, 1, 1, 0] }}
          transition={{ duration: loop, times: [0, 0.05, 0.6, 0.85, 1], repeat: Infinity }}
        >
          {/* Dot — appears first, breathes, then drops into the bowl position */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 22,
              height: 22,
              backgroundColor: GOLD_BRIGHT,
              boxShadow: `0 0 32px ${GOLD_BRIGHT}, 0 0 64px ${GOLD}`,
              left: 280 / 2 - 11,
              top: 80,
            }}
            animate={{
              scale: [0, 1, 1, 1, 1],
              opacity: [0, 1, 1, 1, 1],
              y: [0, 0, 0, 88, 88],
            }}
            transition={{
              duration: loop,
              times: [0, 0.12, 0.32, 0.5, 1],
              ease: [0.22, 1, 0.36, 1],
              repeat: Infinity,
            }}
          />

          {/* The bowl of ن — drawn as an SVG arc that strokes itself.
              We stagger after the dot has settled. */}
          <svg
            width={280}
            height={320}
            viewBox="0 0 280 320"
            className="absolute inset-0"
          >
            <defs>
              <linearGradient id="bowlGrad" x1="0" x2="1" y1="1" y2="0">
                <stop offset="0%" stopColor={GOLD} stopOpacity={0.5} />
                <stop offset="50%" stopColor={GOLD_BRIGHT} stopOpacity={1} />
                <stop offset="100%" stopColor={GOLD} stopOpacity={0.5} />
              </linearGradient>
              <filter id="bowlGlow">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>
            {/* Soft glow underlay */}
            <motion.path
              d="M 60 175 Q 60 245 140 245 Q 220 245 220 175"
              fill="none"
              stroke={GOLD}
              strokeWidth={14}
              strokeLinecap="round"
              opacity={0.35}
              filter="url(#bowlGlow)"
              animate={{ pathLength: [0, 0, 1, 1, 1], opacity: [0, 0, 0.35, 0.35, 0.35] }}
              transition={{ duration: loop, times: [0, 0.5, 0.7, 0.85, 1], repeat: Infinity, ease: "easeOut" }}
            />
            {/* Crisp stroke */}
            <motion.path
              d="M 60 175 Q 60 245 140 245 Q 220 245 220 175"
              fill="none"
              stroke="url(#bowlGrad)"
              strokeWidth={5}
              strokeLinecap="round"
              animate={{ pathLength: [0, 0, 1, 1, 1] }}
              transition={{ duration: loop, times: [0, 0.5, 0.72, 0.85, 1], repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* Tiny terminal serifs at the lip of the bowl — calligraphic detail */}
            <motion.circle
              cx={60}
              cy={175}
              r={4}
              fill={GOLD_BRIGHT}
              animate={{ opacity: [0, 0, 0, 1, 1] }}
              transition={{ duration: loop, times: [0, 0.65, 0.7, 0.78, 1], repeat: Infinity }}
            />
            <motion.circle
              cx={220}
              cy={175}
              r={4}
              fill={GOLD_BRIGHT}
              animate={{ opacity: [0, 0, 0, 1, 1] }}
              transition={{ duration: loop, times: [0, 0.65, 0.7, 0.78, 1], repeat: Infinity }}
            />
          </svg>
        </motion.div>
      </div>

      {/* Wordmark */}
      <motion.div
        className="absolute left-0 right-0 flex flex-col items-center"
        style={{ bottom: 180 }}
        animate={{ opacity: [0, 0, 0, 1, 1, 0] }}
        transition={{ duration: loop, times: [0, 0.55, 0.78, 0.85, 0.95, 1], repeat: Infinity }}
      >
        <div
          style={{
            fontFamily: "'Amiri', serif",
            fontSize: 44,
            color: GOLD_BRIGHT,
            lineHeight: 1,
            letterSpacing: 1,
            textShadow: `0 0 18px ${GOLD}66`,
          }}
        >
          نُور
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontSize: 16,
            letterSpacing: 8,
            color: GOLD_BRIGHT,
            marginTop: 14,
          }}
        >
          NUUR
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: 11,
            letterSpacing: 2,
            color: TEXT_DIM,
            marginTop: 14,
            textTransform: "uppercase",
          }}
        >
          The Vessel · The Dot
        </div>
      </motion.div>

      {/* Concept label */}
      <ConceptLabel index="A" name="Niqṭa" />
    </div>
  );
}

function BackdropTexture() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse at 50% 38%, ${GOLD}14 0%, transparent 55%)`,
      }}
    />
  );
}

export function ConceptLabel({ index, name }: { index: string; name: string }) {
  return (
    <div
      className="absolute top-12 left-0 right-0 flex flex-col items-center"
      style={{ pointerEvents: "none" }}
    >
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: 10,
          letterSpacing: 4,
          color: GOLD,
          opacity: 0.9,
        }}
      >
        CONCEPT {index}
      </div>
      <div
        style={{
          fontFamily: "'Amiri', serif",
          fontSize: 18,
          color: TEXT_DIM,
          marginTop: 4,
          opacity: 0.8,
        }}
      >
        {name}
      </div>
    </div>
  );
}
