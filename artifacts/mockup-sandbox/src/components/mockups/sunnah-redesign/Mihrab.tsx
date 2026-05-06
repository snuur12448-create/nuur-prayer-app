import React, { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';

const BG = '#0A1A0E';
const SURFACE = '#111F14';
const SURFACE_HI = '#172B1B';
const BORDER = '#1F3526';
const TEXT = '#F0EDE5';
const TEXT_DIM = '#8FA99A';
const TEXT_MUTE = '#5C7264';
const GOLD = '#F4C842';
const GOLD_LIGHT = '#F9D97A';
const GOLD_DARK = '#C99A2A';

const SANS = 'Inter, ui-sans-serif, system-ui, sans-serif';
const SERIF = 'ui-serif, Georgia, "Iowan Old Style", serif';
const ARABIC = '"Amiri Quran", "Scheherazade New", "Noto Naskh Arabic", serif';

function Floret({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} stroke={GOLD} strokeWidth="0.8" fill="none" opacity="0.7">
      <circle cx="0" cy="0" r="2.2" fill={GOLD} opacity="0.9" />
      <path d="M0 -8 Q 3 -3 0 0 Q -3 -3 0 -8 Z" fill={GOLD} opacity="0.5" />
      <path d="M0 8 Q 3 3 0 0 Q -3 3 0 8 Z" fill={GOLD} opacity="0.5" />
      <path d="M-8 0 Q -3 3 0 0 Q -3 -3 -8 0 Z" fill={GOLD} opacity="0.5" />
      <path d="M8 0 Q 3 3 0 0 Q 3 -3 8 0 Z" fill={GOLD} opacity="0.5" />
    </g>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-6 w-full" style={{ gap: 16 }}>
      <div style={{ height: 1, flex: 1, background: 'linear-gradient(to left, ' + GOLD + '33, transparent)' }} />
      <svg width="16" height="16" viewBox="-12 -12 24 24">
        <Floret x={0} y={0} />
      </svg>
      <div style={{ height: 1, flex: 1, background: 'linear-gradient(to right, ' + GOLD + '33, transparent)' }} />
    </div>
  );
}

function Bead({ fill, ring, size = 14 }: { fill: number; ring?: boolean; size?: number }) {
  const pct = fill / 5;
  const r = size / 2;
  return (
    <svg width={size + 4} height={size + 4} viewBox={`0 0 ${size + 4} ${size + 4}`}>
      <circle cx={r + 2} cy={r + 2} r={r} fill={SURFACE_HI} stroke={BORDER} strokeWidth="0.6" />
      {pct > 0 && (
        <circle
          cx={r + 2}
          cy={r + 2}
          r={r - 1.5}
          fill={GOLD}
          opacity={0.25 + pct * 0.65}
        />
      )}
      {pct === 1 && <circle cx={r + 2} cy={r + 2} r={r - 3} fill={GOLD_LIGHT} opacity="0.7" />}
      {ring && <circle cx={r + 2} cy={r + 2} r={r + 1} fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.9" />}
    </svg>
  );
}

export function Mihrab() {
  const [prayedBefore, setPrayedBefore] = useState(false);
  const [prayedAfter, setPrayedAfter] = useState(true);

  const WEEK = [
    { d: 'W', n: 4 }, { d: 'T', n: 5 }, { d: 'F', n: 4 },
    { d: 'S', n: 5 }, { d: 'S', n: 5 }, { d: 'M', n: 3 }, { d: 'T', n: 2, today: true },
  ];

  const renderBadge = (status: string) => {
    if (status === "Mu'akkadah") {
      return (
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', backgroundColor: GOLD, color: BG, padding: '2px 6px', borderRadius: 4 }}>
          MU'AKKADAH
        </span>
      );
    }
    if (status === "Ghayr Mu'akkadah") {
      return (
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', borderColor: GOLD, borderWidth: 1, borderStyle: 'solid', color: GOLD, padding: '1px 5px', borderRadius: 4 }}>
          GHAYR MU'AKKADAH
        </span>
      );
    }
    return (
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', borderColor: TEXT_DIM, borderWidth: 1, borderStyle: 'solid', color: TEXT_DIM, padding: '1px 5px', borderRadius: 4 }}>
        {status.toUpperCase()}
      </span>
    );
  };

  const renderCard = (titleEn: string, titleAr: string, count: string, status: string, reward: string) => (
    <div
      className="cursor-pointer group flex flex-col mb-3 relative overflow-hidden"
      style={{
        padding: '16px',
        borderRadius: 12,
        backgroundColor: SURFACE,
        border: `1px solid ${BORDER}`
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 16, fontWeight: 600, color: TEXT, fontFamily: SANS }}>{titleEn}</span>
            {renderBadge(status)}
          </div>
          <span style={{ fontSize: 13, color: GOLD, fontWeight: 500, fontFamily: SANS }}>{count}</span>
        </div>
        <span style={{ fontSize: 18, color: TEXT_DIM, fontFamily: ARABIC }}>{titleAr}</span>
      </div>
      <div className="flex items-end justify-between mt-2">
        <p style={{ fontSize: 13, color: TEXT_DIM, fontFamily: SANS, lineHeight: 1.4, flex: 1, paddingRight: 16 }}>
          {reward}
        </p>
        <ChevronRight size={16} color={TEXT_MUTE} className="group-hover:text-[#F4C842] transition-colors" />
      </div>
    </div>
  );

  return (
    <div
      className="w-full min-h-screen mx-auto relative overflow-hidden"
      style={{ backgroundColor: BG, color: TEXT, fontFamily: SANS, maxWidth: 390 }}
    >
      <div className="w-full h-full overflow-y-auto no-scroll pb-16">
        <style>{`
          .no-scroll::-webkit-scrollbar { display: none; }
        `}</style>

        {/* HERO SECTION */}
        <div className="relative pt-12 pb-6 px-5 flex flex-col items-center text-center">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, background: 'radial-gradient(circle, ' + GOLD + ' 0%, transparent 70%)' }} />
          </div>

          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', color: GOLD_DARK, marginBottom: 8 }}>
            12 RAMAḌĀN 1446
          </span>
          <h1 style={{ fontSize: 28, fontFamily: SERIF, color: TEXT, marginBottom: 4, textShadow: '0 2px 12px rgba(244,200,66,0.1)' }}>
            Sunnah Prayers
          </h1>
          <p style={{ fontSize: 14, color: TEXT_DIM, marginBottom: 24 }}>
            Voluntary worship around the daily five
          </p>

          <div
            className="w-full relative overflow-hidden"
            style={{
              backgroundColor: SURFACE_HI,
              borderRadius: 16,
              border: `1px solid ${BORDER}`,
              padding: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <div className="flex flex-col gap-4 relative z-10">
              {/* Passed */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-start gap-1">
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: TEXT_MUTE }}>JUST-PASSED</span>
                  <div className="flex items-baseline gap-2">
                    <span style={{ fontSize: 15, fontWeight: 500, color: TEXT }}>4 raka'āt before Dhuhr</span>
                    <span style={{ fontSize: 12, fontFamily: ARABIC, color: TEXT_DIM }}>مَرَّت</span>
                  </div>
                </div>
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer"
                  style={{ borderRadius: 99, border: `1px solid ${GOLD}44`, backgroundColor: prayedBefore ? `${GOLD}22` : 'transparent' }}
                  onClick={() => setPrayedBefore(!prayedBefore)}
                >
                  <Check size={14} color={prayedBefore ? GOLD : TEXT_MUTE} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: prayedBefore ? GOLD : TEXT_MUTE }}>{prayedBefore ? 'PRAYED' : 'MARK'}</span>
                </div>
              </div>

              <div style={{ height: 1, backgroundColor: `${GOLD}22`, width: '100%' }} />

              {/* Coming up */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-start gap-1">
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: GOLD }}>COMING UP</span>
                  <div className="flex items-baseline gap-2">
                    <span style={{ fontSize: 15, fontWeight: 500, color: TEXT }}>2 raka'āt after Dhuhr</span>
                    <span style={{ fontSize: 12, fontFamily: ARABIC, color: GOLD_LIGHT }}>قَرِيبَاً</span>
                  </div>
                </div>
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 cursor-pointer"
                  style={{ borderRadius: 99, border: `1px solid ${GOLD}44`, backgroundColor: prayedAfter ? `${GOLD}22` : 'transparent' }}
                  onClick={() => setPrayedAfter(!prayedAfter)}
                >
                  <Check size={14} color={prayedAfter ? GOLD : TEXT_MUTE} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: prayedAfter ? GOLD : TEXT_MUTE }}>{prayedAfter ? 'PRAYED' : 'MARK'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WEEK STRIP */}
        <div className="px-5 mt-2 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: TEXT_DIM }}>
              DAILY SUNNAH
            </span>
          </div>
          <div className="flex items-end justify-between" style={{ padding: '0 8px' }}>
            {WEEK.map((d, i) => (
              <div key={i} className="flex flex-col items-center cursor-pointer hover:opacity-90" style={{ gap: 6 }}>
                <Bead fill={d.n} ring={d.today} size={d.today ? 20 : 14} />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: d.today ? GOLD : TEXT_MUTE,
                  }}
                >
                  {d.d}
                </span>
              </div>
            ))}
          </div>
        </div>

        <SectionDivider />

        <div className="px-5">
          {/* CATEGORY 1 */}
          <div className="mb-8">
            <h2 style={{ fontSize: 18, fontFamily: SERIF, color: GOLD_LIGHT, marginBottom: 2 }}>Sunan al-Rawātib</h2>
            <div className="flex items-center gap-2 mb-4">
              <span style={{ fontSize: 16, fontFamily: ARABIC, color: GOLD_DARK }}>السُّنَن الرَّوَاتِب</span>
              <span style={{ color: TEXT_MUTE }}>·</span>
              <span style={{ fontSize: 13, color: TEXT_DIM }}>12 confirmed sunnah rakʿahs</span>
            </div>
            
            {renderCard("Before Fajr", "سنة الفجر", "2 raka'āt", "Mu'akkadah", "Better than the world and all that is in it.")}
            {renderCard("Before Dhuhr", "قبل الظهر", "2 or 4 raka'āt", "Mu'akkadah", "Whoever prays 12 sunnah rakʿahs in a day, Allah builds for them a house in Paradise.")}
            {renderCard("After Dhuhr", "بعد الظهر", "2 raka'āt", "Mu'akkadah", "Counted within the 12 sunnah rakʿahs that earn a house in Paradise.")}
            {renderCard("After Maghrib", "بعد المغرب", "2 raka'āt", "Mu'akkadah", "Part of the 12 rawātib of Paradise.")}
            {renderCard("After ʿIshāʾ", "بعد العشاء", "2 raka'āt", "Mu'akkadah", "Completes the 12 rawātib.")}
            {renderCard("Before ʿAṣr", "قبل العصر", "4 raka'āt", "Ghayr Mu'akkadah", "May Allah have mercy on the one who prays four before ʿAṣr.")}
          </div>

          <SectionDivider />

          {/* CATEGORY 2 */}
          <div className="mb-8">
            <h2 style={{ fontSize: 18, fontFamily: SERIF, color: GOLD_LIGHT, marginBottom: 2 }}>Recommended at Special Times</h2>
            <div className="flex items-center gap-2 mb-4">
              <span style={{ fontSize: 16, fontFamily: ARABIC, color: GOLD_DARK }}>صَلَوَاتٌ مُسْتَحَبَّة</span>
            </div>

            {renderCard("Ṣalāt al-Ḍuḥā", "صلاة الضحى", "2 to 8 raka'āt", "Recommended", "Suffices as charity for every joint in the body each morning.")}
            {renderCard("Taḥiyyat al-Masjid", "تحية المسجد", "2 raka'āt", "Recommended", "Greeting the house of Allah.")}
            {renderCard("Two Rakʿahs after Wuḍūʾ", "ركعتا الوضوء", "2 raka'āt", "Recommended", "Forgiveness of past minor sins.")}
            {renderCard("Ṣalāt al-Istikhāra", "صلاة الاستخارة", "2 raka'āt", "Recommended", "Seeking the choice of Allah in a matter.")}
            {renderCard("Ṣalāt al-Tawbah", "صلاة التوبة", "2 raka'āt", "Recommended", "Allah forgives the one who prays it and asks forgiveness sincerely.")}
          </div>

          <SectionDivider />

          {/* CATEGORY 3 */}
          <div className="mb-8">
            <h2 style={{ fontSize: 18, fontFamily: SERIF, color: GOLD_LIGHT, marginBottom: 2 }}>Qiyām al-Layl & Witr</h2>
            <div className="flex items-center gap-2 mb-4">
              <span style={{ fontSize: 16, fontFamily: ARABIC, color: GOLD_DARK }}>قِيَامُ اللَّيْل وَالْوِتْر</span>
            </div>

            {renderCard("Tahajjud", "التهجد", "2 by 2 raka'āt", "Recommended", "The most virtuous prayer after the obligatory.")}
            {renderCard("Witr", "الوتر", "1, 3, 5... odd raka'āt", "Recommended", "Allah is Witr (One) and loves the witr.")}
            {renderCard("Qiyām al-Layl", "قيام الليل", "Any even count", "Recommended", "Honour of the believer; a means of nearness to Allah.")}
            {renderCard("Tarāwīḥ", "التراويح", "8 or 20 raka'āt", "Recommended", "Whoever stands the nights of Ramaḍān in faith, his past sins are forgiven.")}
          </div>

          <SectionDivider />

          {/* CATEGORY 4 */}
          <div className="mb-8">
            <h2 style={{ fontSize: 18, fontFamily: SERIF, color: GOLD_LIGHT, marginBottom: 2 }}>Eid, Jumuʿah & Eclipses</h2>
            <div className="flex items-center gap-2 mb-4">
              <span style={{ fontSize: 16, fontFamily: ARABIC, color: GOLD_DARK }}>صَلَوَاتُ الْمُنَاسَبَات</span>
            </div>

            {renderCard("Before Jumuʿah", "سنة قبل الجمعة", "2 or 4 raka'āt", "Recommended", "Sins between this Jumuʿah and the next are wiped away.")}
            {renderCard("After Jumuʿah", "سنة بعد الجمعة", "2 or 4 raka'āt", "Mu'akkadah", "Continuation of the Prophet's ﷺ practice.")}
            {renderCard("Ṣalāt al-ʿĪdayn", "صلاة العيدين", "2 raka'āt", "Mu'akkadah", "A communal sign of the religion.")}
            {renderCard("Ṣalāt al-Kusūf", "صلاة الكسوف", "2 raka'āt", "Mu'akkadah", "A reminder of the signs of Allah.")}
            {renderCard("Ṣalāt al-Istisqāʾ", "صلاة الاستسقاء", "2 raka'āt", "Recommended", "Seeking rain and mercy from Allah.")}
          </div>

        </div>
      </div>
    </div>
  );
}
