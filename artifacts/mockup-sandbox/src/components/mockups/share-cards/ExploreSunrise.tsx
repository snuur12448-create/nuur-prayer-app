/**
 * Variant B — Soft Gradient (Sunrise).
 * Modern, IG-native: peach-to-plum sunrise gradient, grainy soft-shadow,
 * humanist sans, friendly lowercase eyebrow. Feels like a quote card from
 * a contemporary wellness app — the opposite end of the visual spectrum
 * from the manuscript direction.
 */

const ARABIC = "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ، وَأَنَا خَيْرُكُمْ لِأَهْلِي";
const TRANSLATION =
  "The best of you are those who are best to their families, and I am the best of you to my family.";

export function ExploreSunrise() {
  return (
    <div className="w-screen h-screen overflow-hidden relative">
      {/* Gradient ground */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, #FFD6A8 0%, #F4A582 28%, #C76A6A 55%, #6B3A6F 85%, #2F1B3F 100%)",
        }}
      />
      {/* Soft "sun" highlight in upper-right */}
      <div
        className="absolute"
        style={{
          top: -180,
          right: -120,
          width: 480,
          height: 480,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,236,200,0.65) 0%, rgba(255,220,170,0) 60%)",
          filter: "blur(20px)",
        }}
      />
      {/* Grain — fake film grain via tiny SVG noise */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.18] mix-blend-overlay" preserveAspectRatio="none">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1   0 0 0 0.9 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      {/* Top brand pill */}
      <div className="absolute top-7 left-1/2 -translate-x-1/2">
        <div
          className="px-4 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2"
          style={{
            backgroundColor: "rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.28)",
          }}
        >
          <span
            className="font-['Inter']"
            style={{ fontSize: 11, fontWeight: 600, color: "#FFFCF4", letterSpacing: "0.16em" }}
          >
            nuur · hadith
          </span>
        </div>
      </div>

      {/* Center content — glass card */}
      <div className="absolute inset-0 flex items-center justify-center px-8">
        <div
          className="rounded-3xl px-8 py-10 w-full backdrop-blur-md"
          style={{
            backgroundColor: "rgba(20,8,30,0.22)",
            border: "1px solid rgba(255,255,255,0.16)",
            boxShadow: "0 30px 60px rgba(40,10,50,0.35)",
          }}
        >
          <p
            className="font-['Amiri'] text-center"
            style={{
              fontSize: 30,
              lineHeight: 1.85,
              direction: "rtl",
              color: "#FFFAEC",
              fontWeight: 400,
            }}
          >
            {ARABIC}
          </p>
          <div
            className="my-6 mx-auto"
            style={{
              width: 40,
              height: 1,
              backgroundColor: "rgba(255,250,236,0.5)",
            }}
          />
          <p
            className="font-['Inter'] text-center"
            style={{
              fontSize: 16,
              lineHeight: 1.5,
              color: "#FFFAEC",
              fontWeight: 400,
              letterSpacing: "0.005em",
            }}
          >
            “{TRANSLATION}”
          </p>
        </div>
      </div>

      {/* Bottom attribution */}
      <div className="absolute bottom-7 inset-x-0 flex items-center justify-center">
        <span
          className="font-['Inter'] uppercase"
          style={{
            fontSize: 9,
            letterSpacing: "0.32em",
            color: "rgba(255,250,236,0.78)",
            fontWeight: 500,
          }}
        >
          — prophet muhammad ﷺ · tirmidhi 3895
        </span>
      </div>
    </div>
  );
}
