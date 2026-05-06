import React, { useState } from 'react';
import { ChevronRight, BookOpen, Check } from 'lucide-react';

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
      <div style={{ height: 1, flex: 1, background: `linear-gradient(to left, ${GOLD}33, transparent)` }} />
      <svg width="16" height="16" viewBox="-12 -12 24 24">
        <Floret x={0} y={0} />
      </svg>
      <div style={{ height: 1, flex: 1, background: `linear-gradient(to right, ${GOLD}33, transparent)` }} />
    </div>
  );
}

function Badge({ status }: { status: string }) {
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
}

type PrayerRowProps = {
  nameEn: string;
  nameAr: string;
  rakaat: string;
  status: string;
  hadithSnippet: string;
  madhabViews?: Record<string, string>;
};

function PrayerRow({ nameEn, nameAr, rakaat, status, hadithSnippet, madhabViews }: PrayerRowProps) {
  const [showMadhab, setShowMadhab] = useState(false);

  return (
    <div className="py-5 cursor-pointer group" style={{ borderBottom: `1px solid ${BORDER}80` }}>
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 16, fontFamily: SERIF, color: TEXT, fontWeight: 500 }}>{nameEn}</span>
          <Badge status={status} />
        </div>
        <span style={{ fontSize: 18, fontFamily: ARABIC, color: GOLD_LIGHT }}>{nameAr}</span>
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <span style={{ fontSize: 13, color: GOLD, fontFamily: SANS }}>{rakaat}</span>
        {madhabViews && (
          <div 
            className="flex items-center gap-1 cursor-help"
            style={{ padding: '2px 6px', background: SURFACE_HI, borderRadius: 4, border: `1px solid ${BORDER}` }}
            onClick={(e) => { e.stopPropagation(); setShowMadhab(!showMadhab); }}
          >
            <BookOpen size={10} color={TEXT_MUTE} />
            <span style={{ fontSize: 10, color: TEXT_DIM, fontWeight: 500 }}>MADHĀHIB DIFFER</span>
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-4">
        <p style={{ fontSize: 14, fontFamily: SERIF, color: TEXT_DIM, lineHeight: 1.5, fontStyle: 'italic' }}>
          "{hadithSnippet}"
        </p>
        <ChevronRight size={16} color={TEXT_MUTE} className="mt-1 group-hover:text-[#F4C842] transition-colors" />
      </div>

      {showMadhab && madhabViews && (
        <div style={{ marginTop: 12, padding: 12, background: SURFACE_HI, borderRadius: 6, border: `1px dashed ${BORDER}` }}>
          <p style={{ fontSize: 11, color: GOLD_DARK, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 6 }}>VIEWS ON RAKʿAHS</p>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            {Object.entries(madhabViews).map(([madhab, view]) => (
              <div key={madhab}>
                <span style={{ fontSize: 11, color: TEXT_MUTE, display: 'block', marginBottom: 2 }}>{madhab}</span>
                <span style={{ fontSize: 12, color: TEXT_DIM, fontFamily: SANS }}>{view}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Ledger() {
  const [marked, setMarked] = useState(false);

  return (
    <div
      className="w-full min-h-screen relative flex justify-center"
      style={{ backgroundColor: BG, color: TEXT, fontFamily: SANS }}
    >
      <div className="w-[390px] h-[900px] overflow-y-auto no-scroll relative bg-[#0A1A0E]">
        <style>{`
          .no-scroll::-webkit-scrollbar { display: none; }
        `}</style>
        
        {/* Header */}
        <div className="pt-12 px-6 pb-4 flex justify-between items-end border-b" style={{ borderColor: `${BORDER}80` }}>
          <div>
            <h1 style={{ fontSize: 24, fontFamily: SERIF, color: TEXT }}>Kitāb al-Sunan</h1>
            <p style={{ fontSize: 12, color: TEXT_DIM, marginTop: 4, letterSpacing: '0.02em' }}>The Book of Voluntary Prayers</p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: GOLD_DARK, marginBottom: 2 }}>
            12 RAMAḌĀN 1446
          </span>
        </div>

        <div className="px-6 py-8">
          {/* Featured Hadith Hero */}
          <div className="mb-10 text-center relative">
            <svg width="24" height="24" viewBox="-12 -12 24 24" className="mx-auto mb-4 opacity-80">
              <Floret x={0} y={0} />
            </svg>
            <p style={{ fontSize: 12, color: GOLD_DARK, fontWeight: 600, letterSpacing: '0.15em', marginBottom: 12 }}>
              SUNNAH OF THE DAY
            </p>
            <p 
              dir="rtl" 
              style={{ 
                fontFamily: ARABIC, 
                fontSize: 32, 
                color: GOLD_LIGHT, 
                lineHeight: 1.6, 
                marginBottom: 16,
                textShadow: '0 2px 10px rgba(244,200,66,0.1)'
              }}
            >
              رَكْعَتَا الْفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا
            </p>
            <p style={{ fontSize: 17, fontFamily: SERIF, color: TEXT, lineHeight: 1.5, marginBottom: 12 }}>
              "The two rakʿahs of Fajr are better than the world and all that is in it."
            </p>
            <p style={{ fontSize: 12, color: TEXT_MUTE, fontFamily: SANS }}>
              — Ṣaḥīḥ Muslim 725 · <span style={{ color: GOLD_DARK }}>Ṣaḥīḥ</span>
            </p>
            <div className="mt-6 mx-auto" style={{ width: 40, height: 1, background: GOLD, opacity: 0.3 }} />
            <p style={{ fontSize: 13, color: TEXT_DIM, fontStyle: 'italic', fontFamily: SERIF, marginTop: 16, padding: '0 16px', lineHeight: 1.5 }}>
              The Prophet ﷺ never left these two rakʿahs, even while travelling. They are the most emphasized of all voluntary prayers.
            </p>
          </div>

          <SectionDivider />

          {/* Category 1 */}
          <div className="mt-8 mb-12">
            <div className="text-center mb-6">
              <h2 style={{ fontSize: 20, fontFamily: ARABIC, color: GOLD_DARK, marginBottom: 4 }}>بَابُ السُّنَنِ الرَّوَاتِب</h2>
              <p style={{ fontSize: 14, fontFamily: SERIF, color: GOLD_LIGHT, fontStyle: 'italic' }}>Chapter on the Confirmed Sunnah Prayers</p>
            </div>

            <PrayerRow
              nameEn="Before Fajr"
              nameAr="سنة الفجر"
              rakaat="2 raka'āt"
              status="Mu'akkadah"
              hadithSnippet="The two rakʿahs of Fajr are better than the world and all that is in it."
            />
            <PrayerRow
              nameEn="Before Dhuhr"
              nameAr="قبل الظهر"
              rakaat="2 or 4 raka'āt"
              status="Mu'akkadah"
              hadithSnippet="Whoever is consistent with twelve rakʿahs of voluntary prayer, Allah will build for them a house in Paradise."
              madhabViews={{
                "Ḥanafī": "4 (one salām)",
                "Mālikī": "2 (4 is also recommended)",
                "Shāfiʿī": "4 (in two pairs, two salāms)",
                "Ḥanbalī": "2 (4 is also recommended)"
              }}
            />
            <PrayerRow
              nameEn="After Dhuhr"
              nameAr="بعد الظهر"
              rakaat="2 or 4 raka'āt"
              status="Mu'akkadah"
              hadithSnippet="Whoever prays four before Dhuhr and four after, Allah forbids them to the Fire."
            />
            <PrayerRow
              nameEn="After Maghrib"
              nameAr="بعد المغرب"
              rakaat="2 raka'āt"
              status="Mu'akkadah"
              hadithSnippet="The Prophet ﷺ used to pray two rakʿahs after Maghrib in his house."
            />
            <PrayerRow
              nameEn="After ʿIshāʾ"
              nameAr="بعد العشاء"
              rakaat="2 raka'āt"
              status="Mu'akkadah"
              hadithSnippet="I memorised from the Prophet ﷺ ten rakʿahs..."
            />
            <PrayerRow
              nameEn="Before ʿAṣr"
              nameAr="قبل العصر"
              rakaat="4 (or 2) raka'āt"
              status="Ghayr Mu'akkadah"
              hadithSnippet="May Allah have mercy on a person who prays four (rakʿahs) before ʿAṣr."
            />
          </div>

          <SectionDivider />

          {/* Category 2 */}
          <div className="mt-8 mb-12">
            <div className="text-center mb-6">
              <h2 style={{ fontSize: 20, fontFamily: ARABIC, color: GOLD_DARK, marginBottom: 4 }}>صَلَوَاتٌ مُسْتَحَبَّة</h2>
              <p style={{ fontSize: 14, fontFamily: SERIF, color: GOLD_LIGHT, fontStyle: 'italic' }}>Recommended at Special Times</p>
            </div>

            <PrayerRow
              nameEn="Ṣalāt al-Ḍuḥā"
              nameAr="صلاة الضحى"
              rakaat="2 to 8 raka'āt"
              status="Recommended"
              hadithSnippet="Two rakʿahs prayed in the forenoon (Ḍuḥā) are sufficient for all of that (charity due upon joints)."
            />
            <PrayerRow
              nameEn="Taḥiyyat al-Masjid"
              nameAr="تحية المسجد"
              rakaat="2 raka'āt"
              status="Mu'akkadah"
              hadithSnippet="When one of you enters the masjid, let him not sit until he has prayed two rakʿahs."
            />
          </div>

          <div className="h-24"></div> {/* padding for floating action */}
        </div>

        {/* Discreet Floating Action */}
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50"
          style={{ width: 'calc(100% - 48px)' }}
        >
          <div 
            className="cursor-pointer mx-auto flex items-center justify-between"
            style={{ 
              background: SURFACE_HI, 
              border: `1px solid ${BORDER}`, 
              borderRadius: 12,
              padding: '12px 16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              maxWidth: 300
            }}
            onClick={() => setMarked(!marked)}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ 
                  border: `1px solid ${marked ? GOLD : TEXT_MUTE}`, 
                  background: marked ? GOLD : 'transparent' 
                }}
              >
                {marked && <Check size={12} color={BG} strokeWidth={3} />}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: marked ? TEXT : TEXT_DIM }}>
                I prayed today's featured sunnah
              </span>
            </div>
            {marked && <span style={{ fontSize: 11, color: GOLD_DARK, fontFamily: SERIF }}>MāshāʾAllāh</span>}
          </div>
        </div>

      </div>
    </div>
  );
}
