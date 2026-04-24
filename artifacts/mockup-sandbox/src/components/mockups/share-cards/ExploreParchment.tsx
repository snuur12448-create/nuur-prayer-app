/**
 * Variant C — Aged Parchment.
 * Looks like a scanned page from an old codex: warm cream paper grain,
 * soft brown vignette, foxing speckles, a single deep-red wax seal as
 * the only "logo". Tactile, archival, photographic.
 */

const ARABIC = "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ، وَأَنَا خَيْرُكُمْ لِأَهْلِي";
const TRANSLATION =
  "The best of you are those who are best to their families, and I am the best of you to my family.";

const PAPER = "#E9DCBA";
const INK = "#3A2A14";
const INK_SOFT = "#6B4F28";
const SEAL = "#7B1F1F";

function PaperTexture() {
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
      <defs>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="2" seed="11" />
          <feColorMatrix values="0 0 0 0 0.36   0 0 0 0 0.24   0 0 0 0 0.10   0 0 0 0.35 0" />
        </filter>
        <radialGradient id="vig" cx="50%" cy="50%" r="70%">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="0.7" stopColor="#3a2a14" stopOpacity="0" />
          <stop offset="1" stopColor="#1a0f04" stopOpacity="0.45" />
        </radialGradient>
        <radialGradient id="warm" cx="40%" cy="35%" r="55%">
          <stop offset="0" stopColor="#F4E5B8" stopOpacity="0.5" />
          <stop offset="1" stopColor="#F4E5B8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={PAPER} />
      <rect width="100%" height="100%" fill="url(#warm)" />
      <rect width="100%" height="100%" filter="url(#grain)" opacity="0.55" />
      {/* Foxing speckles — random rust spots */}
      {[
        [62, 88, 1.4], [108, 540, 2.1], [430, 132, 1.0], [486, 612, 1.7],
        [72, 312, 0.9], [380, 478, 1.3], [220, 70, 0.8], [320, 622, 1.5],
        [140, 200, 0.7], [430, 320, 1.0], [60, 460, 1.2], [495, 240, 0.9],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x as number} cy={y as number} r={r as number} fill="#7a4a1a" opacity="0.28" />
      ))}
      <rect width="100%" height="100%" fill="url(#vig)" />
    </svg>
  );
}

function WaxSeal() {
  return (
    <svg width="58" height="58" viewBox="0 0 60 60">
      <defs>
        <radialGradient id="wax" cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#A03333" />
          <stop offset="0.6" stopColor={SEAL} />
          <stop offset="1" stopColor="#4A0F0F" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="26" fill="url(#wax)" />
      {/* Drip notches */}
      <circle cx="30" cy="30" r="22" fill="none" stroke="#4A0F0F" strokeWidth="0.6" strokeDasharray="2 2" />
      <text
        x="30" y="35" textAnchor="middle"
        fill="#F2D9B0" fontSize="14" fontWeight="700"
        fontFamily="'Cormorant Garamond', serif" letterSpacing="0.14em"
      >
        N
      </text>
      <text
        x="30" y="46" textAnchor="middle"
        fill="#F2D9B0" fontSize="5" fontWeight="600"
        fontFamily="Inter, sans-serif" letterSpacing="0.28em"
      >
        NUUR
      </text>
    </svg>
  );
}

export function ExploreParchment() {
  return (
    <div className="w-screen h-screen overflow-hidden relative">
      <PaperTexture />

      {/* Header — handwritten-feeling label */}
      <div className="absolute top-0 inset-x-0 pt-9 px-12 flex items-baseline justify-between">
        <span
          className="font-['Libre_Baskerville'] italic"
          style={{ fontSize: 12, color: INK_SOFT }}
        >
          on family — a hadith
        </span>
        <span
          className="font-['Libre_Baskerville']"
          style={{ fontSize: 11, color: INK_SOFT }}
        >
          fol. iii.r
        </span>
      </div>

      {/* Body */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-10">
        <p
          className="font-['Amiri'] text-center"
          style={{
            fontSize: 32,
            lineHeight: 1.95,
            direction: "rtl",
            color: INK,
            fontWeight: 400,
            textShadow: "0 1px 0 rgba(255,235,180,0.35)",
          }}
        >
          {ARABIC}
        </p>

        {/* Hand-drawn rule */}
        <svg className="my-7" width="180" height="6" viewBox="0 0 180 6">
          <path
            d="M 2 3 Q 45 1 90 3 T 178 3"
            fill="none"
            stroke={INK_SOFT}
            strokeWidth="0.9"
            strokeLinecap="round"
          />
        </svg>

        <p
          className="font-['Cormorant_Garamond'] italic text-center px-2"
          style={{ fontSize: 19, lineHeight: 1.4, color: INK, fontWeight: 500 }}
        >
          “{TRANSLATION}”
        </p>
      </div>

      {/* Bottom — wax seal + reference */}
      <div className="absolute bottom-0 inset-x-0 pb-9 px-12 flex items-end justify-between">
        <div>
          <span
            className="font-['Libre_Baskerville']"
            style={{ fontSize: 11, color: INK_SOFT, display: "block" }}
          >
            transmitted by
          </span>
          <span
            className="font-['Cormorant_Garamond']"
            style={{ fontSize: 16, color: INK, fontWeight: 600, display: "block", marginTop: 2 }}
          >
            Jāmiʿ at-Tirmidhī · 3895
          </span>
        </div>
        <WaxSeal />
      </div>
    </div>
  );
}
