/**
 * Variant D — Color Block (Matisse / museum poster).
 * Three flat color zones: forest-green top, ochre band middle, sand
 * bottom. Each zone holds one element. Bold, graphic, exhibition-poster
 * energy. Modern but warm.
 */

const ARABIC = "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ، وَأَنَا خَيْرُكُمْ لِأَهْلِي";
const TRANSLATION =
  "The best of you are those who are best to their families, and I am the best of you to my family.";

const FOREST = "#1F3A2D";
const OCHRE = "#D9A441";
const SAND = "#EFE3C7";
const CREAM = "#FBF4DE";
const INK = "#1A1306";

export function ExploreColorBlock() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: SAND }}>
      {/* Forest zone — top 55% */}
      <div className="absolute inset-x-0 top-0" style={{ height: "58%", backgroundColor: FOREST }}>
        {/* Decorative hand-cut shape — Matisse-style organic blob */}
        <svg className="absolute" style={{ top: 28, right: 28 }} width="62" height="62" viewBox="0 0 62 62">
          <path
            d="M 31 4 C 44 4 56 14 56 28 C 56 44 46 56 32 56 C 16 56 6 46 6 30 C 6 16 18 4 31 4 Z"
            fill={OCHRE}
          />
          <circle cx="31" cy="30" r="9" fill={FOREST} />
        </svg>

        {/* Eyebrow */}
        <div className="px-9 pt-9">
          <span
            className="font-['Inter'] uppercase block"
            style={{ fontSize: 10, letterSpacing: "0.42em", color: OCHRE, fontWeight: 700 }}
          >
            Hadith
          </span>
          <span
            className="font-['Inter'] uppercase block mt-1"
            style={{ fontSize: 9, letterSpacing: "0.28em", color: CREAM, opacity: 0.7 }}
          >
            № 03 · On Family
          </span>
        </div>

        {/* Arabic — large, left-aligned */}
        <div className="absolute inset-x-0" style={{ bottom: 36 }}>
          <p
            className="font-['Amiri_Quran'] text-right pr-9 pl-9"
            style={{
              fontSize: 32,
              lineHeight: 1.75,
              direction: "rtl",
              color: CREAM,
              fontWeight: 400,
            }}
          >
            {ARABIC}
          </p>
        </div>
      </div>

      {/* Ochre band — middle 8% */}
      <div
        className="absolute inset-x-0 flex items-center"
        style={{ top: "58%", height: "7%", backgroundColor: OCHRE }}
      >
        <div className="px-9 flex items-center justify-between w-full">
          <span
            className="font-['Cormorant_Garamond'] italic"
            style={{ fontSize: 14, color: FOREST, fontWeight: 500 }}
          >
            — said the Prophet ﷺ
          </span>
          <span
            className="font-['Inter'] uppercase"
            style={{ fontSize: 9, letterSpacing: "0.28em", color: FOREST, fontWeight: 700 }}
          >
            Tirmidhi 3895
          </span>
        </div>
      </div>

      {/* Sand zone — bottom 35% */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: "35%" }}>
        <div className="px-9 pt-7 pb-9 h-full flex flex-col justify-between">
          <p
            className="font-['Cormorant_Garamond']"
            style={{
              fontSize: 24,
              lineHeight: 1.2,
              color: INK,
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            “{TRANSLATION}”
          </p>

          <div className="flex items-end justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: FOREST }} />
              <span
                className="font-['Inter'] uppercase"
                style={{ fontSize: 9, letterSpacing: "0.36em", color: FOREST, fontWeight: 700 }}
              >
                Nuur
              </span>
            </div>
            <span
              className="font-['Cormorant_Garamond']"
              style={{ fontSize: 18, color: FOREST, fontWeight: 500 }}
            >
              نور
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
