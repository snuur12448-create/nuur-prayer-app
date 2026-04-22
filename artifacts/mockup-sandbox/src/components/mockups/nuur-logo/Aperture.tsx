import { motion } from "framer-motion";
import { ConceptLabel, Wordmark } from "./_label";

/**
 * A. APERTURE  —  ن as a window cut into the dark
 *
 * The screen is pitch black. The shape of ن is a hole punched through
 * the darkness. Pure white-gold light pours through that hole, as if
 * the letter is a stained-glass window and the source of light is
 * behind the universe.
 *
 * Reading: you see the letter only BECAUSE it lets light through.
 * The letter IS the opening through which light enters.
 */
export function Aperture() {
  const loop = 7;
  const W = 390;
  const H = 844;

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ backgroundColor: "#000" }}>
      {/* Light SOURCE that lives behind the cut-out. We brighten and
          pulse it so the aperture appears to "breathe" as if a real
          light is behind it. */}
      <motion.div
        className="absolute"
        style={{
          left: W / 2 - 260,
          top: H / 2 - 260,
          width: 520,
          height: 520,
          borderRadius: 260,
          background: `radial-gradient(circle, #FFF8DC 0%, #E8B85C 25%, #C9933A 45%, transparent 70%)`,
        }}
        animate={{
          opacity: [0, 0.4, 1, 1, 0.95, 0],
          scale: [0.6, 0.8, 1, 1.02, 1, 0.85],
        }}
        transition={{ duration: loop, times: [0, 0.2, 0.45, 0.7, 0.92, 1], repeat: Infinity, ease: "easeOut" }}
      />

      {/* Black mask with the ن cut OUT of it. Anything inside the path
          shows the bright source above; everything else is solid black.
          We use SVG with a mask to achieve the punched-through effect. */}
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0"
        style={{ pointerEvents: "none" }}
      >
        <defs>
          <mask id="apertureMask">
            <rect width={W} height={H} fill="white" />
            {/* The ن cut-out — bowl drawn as a thick stroked arc (calligraphic),
                plus the sacred dot. Black = transparent in the mask, so light
                shows through these areas. */}
            <g transform={`translate(${W / 2} ${H / 2})`}>
              {/* The bowl: a deep thuluth-style curve, drawn as a stroke */}
              <path
                d="M -110 -40 Q -110 100 0 100 Q 110 100 110 -40"
                stroke="black"
                strokeWidth={36}
                fill="none"
                strokeLinecap="round"
              />
              {/* Tapered terminal flicks at the lips of the bowl */}
              <circle cx={-110} cy={-40} r={10} fill="black" />
              <circle cx={110} cy={-40} r={10} fill="black" />
              {/* The sacred dot of ن — a small diamond, calligraphic */}
              <rect
                x={-13}
                y={-110}
                width={26}
                height={26}
                fill="black"
                transform="rotate(45 0 -97)"
              />
            </g>
          </mask>
          <radialGradient id="rim" cx="0.5" cy="0.5">
            <stop offset="40%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.85} />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="#000" mask="url(#apertureMask)" />
        {/* Vignette so edges go fully dark — sharpens the aperture */}
        <rect width={W} height={H} fill="url(#rim)" />
      </svg>

      {/* Soft golden bleed AROUND the cut-out — light spilling onto
          the surrounding darkness, sells the "real light behind" feel. */}
      <motion.div
        className="absolute"
        style={{
          left: W / 2 - 180,
          top: H / 2 - 180,
          width: 360,
          height: 360,
          borderRadius: 200,
          background: `radial-gradient(ellipse, #C9933A33 0%, transparent 60%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
        animate={{ opacity: [0, 0, 0.7, 0.7, 0] }}
        transition={{ duration: loop, times: [0, 0.3, 0.5, 0.92, 1], repeat: Infinity }}
      />

      {/* Wordmark resolves below the aperture */}
      <motion.div
        className="absolute left-0 right-0 flex justify-center"
        style={{ bottom: 130 }}
        animate={{ opacity: [0, 0, 0, 1, 1, 0] }}
        transition={{ duration: loop, times: [0, 0.55, 0.7, 0.78, 0.95, 1], repeat: Infinity }}
      >
        <Wordmark tagline="Light through the letter" />
      </motion.div>

      <ConceptLabel index="A" name="ن al-mishkāt · the aperture" />
    </div>
  );
}
