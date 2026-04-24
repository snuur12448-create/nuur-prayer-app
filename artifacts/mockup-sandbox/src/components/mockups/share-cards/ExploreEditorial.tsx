/**
 * Variant 2 — Editorial Minimal.
 * Inverted palette (warm cream ground, deep ink type), enormous serif
 * display, ample negative space, single hairline. Aesop / Apartamento mood.
 *
 * The arabic and the translation share the stage; the eye lands first
 * on the translation as a typographic statement, then settles on the
 * Arabic underneath as the source.
 */

const ARABIC = "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ، وَأَنَا خَيْرُكُمْ لِأَهْلِي";
const TRANSLATION =
  "The best of you are those who are best to their families.";

const CREAM = "#F2EAD3";
const INK = "#0E1A12";
const INK_SOFT = "#3A4A3D";
const BRONZE = "#8B6A2A";

export function ExploreEditorial() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative flex flex-col"
      style={{ backgroundColor: CREAM }}
    >
      {/* Header bar */}
      <div className="px-12 pt-12 pb-0 flex items-baseline justify-between">
        <span
          className="font-['Inter'] uppercase"
          style={{ color: INK_SOFT, fontSize: 9, letterSpacing: "0.36em", fontWeight: 500 }}
        >
          Hadith — On Family
        </span>
        <span
          className="font-['Inter'] uppercase"
          style={{ color: INK_SOFT, fontSize: 9, letterSpacing: "0.22em", fontWeight: 500 }}
        >
          № 03 / Tirmidhi 3895
        </span>
      </div>

      {/* Hairline */}
      <div className="px-12 mt-4">
        <div className="h-px w-full" style={{ backgroundColor: INK, opacity: 0.18 }} />
      </div>

      {/* Body — translation as the typographic hero */}
      <div className="flex-1 flex flex-col justify-center px-12 pt-2">
        <p
          className="font-['Cormorant_Garamond'] text-left"
          style={{
            color: INK,
            fontSize: 42,
            lineHeight: 1.1,
            fontWeight: 400,
            letterSpacing: "-0.01em",
          }}
        >
          “{TRANSLATION}”
        </p>

        <div className="mt-10 flex items-center gap-3">
          <div className="h-px w-10" style={{ backgroundColor: BRONZE }} />
          <span
            className="font-['Inter'] uppercase"
            style={{ color: BRONZE, fontSize: 9, letterSpacing: "0.32em", fontWeight: 600 }}
          >
            in the words of the Prophet ﷺ
          </span>
        </div>

        <p
          className="font-['Amiri'] text-right mt-6"
          style={{ color: INK, fontSize: 28, lineHeight: 1.9, direction: "rtl", fontWeight: 400 }}
        >
          {ARABIC}
        </p>
      </div>

      {/* Footer */}
      <div className="px-12 pb-12">
        <div className="h-px w-full mb-5" style={{ backgroundColor: INK, opacity: 0.18 }} />
        <div className="flex items-end justify-between">
          <div>
            <p
              className="font-['Cormorant_Garamond'] italic"
              style={{ color: INK_SOFT, fontSize: 14, fontWeight: 400 }}
            >
              Jāmiʿ at-Tirmidhī, 3895
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="font-['Cormorant_Garamond']"
              style={{ color: INK, fontSize: 22, fontWeight: 500, letterSpacing: "-0.01em" }}
            >
              Nuur
            </span>
            <span
              className="font-['Inter'] uppercase"
              style={{ color: INK_SOFT, fontSize: 8, letterSpacing: "0.32em", fontWeight: 500 }}
            >
              نور
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
