/**
 * Variant A — Brutalist Type.
 * Massive Arabic that bleeds off the right edge, asymmetric Swiss grid,
 * single hot-orange accent, no ornaments. Quiet rebellion against the
 * usual "mosque ornament" treatment — lets the calligraphy be a
 * graphic-design object first, devotional artifact second.
 */

const ARABIC = "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ";
const ARABIC_LINE2 = "وَأَنَا خَيْرُكُمْ لِأَهْلِي";
const TRANSLATION =
  "The best of you are those who are best to their families, and I am the best of you to my family.";

const PAPER = "#F4F2EC";
const INK = "#0A0A0A";
const ACCENT = "#E04F1A";
const MUTED = "#6E6E6E";

export function ExploreBrutalist() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ backgroundColor: PAPER, color: INK }}
    >
      {/* 12-col asymmetric grid — top metadata strip */}
      <div className="absolute top-0 inset-x-0 px-8 pt-7 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2" style={{ backgroundColor: ACCENT }} />
          <span
            className="font-['Geist_Mono'] uppercase"
            style={{ fontSize: 10, letterSpacing: "0.18em" }}
          >
            Hadith / 003
          </span>
        </div>
        <span
          className="font-['Geist_Mono'] uppercase"
          style={{ fontSize: 10, letterSpacing: "0.18em", color: MUTED }}
        >
          Tirmidhi.3895
        </span>
      </div>

      {/* Massive Arabic — bleeds off the right edge */}
      <div className="absolute" style={{ top: 80, left: -20, right: -40 }}>
        <p
          className="font-['Amiri_Quran'] text-right"
          style={{
            fontSize: 76,
            lineHeight: 1.0,
            color: INK,
            direction: "rtl",
            paddingRight: 20,
            letterSpacing: "-0.01em",
          }}
        >
          {ARABIC}
        </p>
        <p
          className="font-['Amiri_Quran'] text-right mt-2"
          style={{
            fontSize: 76,
            lineHeight: 1.0,
            color: ACCENT,
            direction: "rtl",
            paddingRight: 20,
          }}
        >
          {ARABIC_LINE2}
        </p>
      </div>

      {/* Mid divider — single thick rule, asymmetric */}
      <div
        className="absolute"
        style={{ top: 410, left: 32, width: 96, height: 4, backgroundColor: INK }}
      />

      {/* Translation — left-aligned, narrow column */}
      <div className="absolute px-8" style={{ top: 432, right: "32%" }}>
        <p
          className="font-['Inter']"
          style={{
            fontSize: 18,
            lineHeight: 1.35,
            color: INK,
            fontWeight: 500,
            letterSpacing: "-0.005em",
          }}
        >
          {TRANSLATION}
        </p>
      </div>

      {/* Bottom — colophon block */}
      <div className="absolute bottom-0 inset-x-0 px-8 pb-7">
        <div className="h-px w-full mb-4" style={{ backgroundColor: INK, opacity: 0.15 }} />
        <div className="flex items-end justify-between">
          <div>
            <span
              className="font-['Geist_Mono'] block uppercase"
              style={{ fontSize: 9, letterSpacing: "0.2em", color: MUTED }}
            >
              Source
            </span>
            <span
              className="font-['Geist_Mono'] block mt-1"
              style={{ fontSize: 11, color: INK }}
            >
              Jami at-Tirmidhi · Hadith 3895
            </span>
          </div>
          <div className="text-right">
            <span
              className="font-['Geist_Mono'] uppercase block"
              style={{ fontSize: 9, letterSpacing: "0.2em", color: MUTED }}
            >
              Nuur نور
            </span>
            <span
              className="font-['Geist_Mono'] block mt-1"
              style={{ fontSize: 11, color: ACCENT, fontWeight: 600 }}
            >
              ●
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
