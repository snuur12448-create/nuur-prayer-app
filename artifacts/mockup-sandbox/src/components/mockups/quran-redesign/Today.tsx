import React from 'react';
import { Search, Play, Sun, Moon, BookOpen, Sparkles } from 'lucide-react';

const BG = '#0A1612';
const SURFACE = '#10231C';
const SURFACE_2 = '#0D1C17';
const BORDER = '#1F3A30';
const GOLD = '#D4A017';
const GOLD_SOFT = '#C9933A';
const TEXT = '#E8EAE6';
const TEXT_DIM = '#7A8B82';
const EMERALD = '#3B7A5E';

export default function Today() {
  return (
    <div
      className="relative w-full h-[100dvh] max-h-[844px] max-w-[390px] mx-auto overflow-hidden font-sans"
      style={{ background: BG, color: TEXT }}
    >
      {/* Aura behind hero */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[400px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse, ${GOLD}1a 0%, transparent 60%)`,
        }}
      />

      <div className="relative h-full overflow-y-auto">
        {/* Status bar */}
        <div className="flex justify-between items-center px-6 pt-3 pb-2 text-[11px]" style={{ color: TEXT_DIM }}>
          <span className="font-medium">9:41</span>
          <div className="flex gap-1 items-center"><span>•••</span><span>􀙇</span></div>
        </div>

        {/* Header */}
        <div className="px-6 pt-3">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em]" style={{ color: GOLD }}>
                Friday · Jumu'ah
              </p>
              <h1 className="font-['Amiri'] text-[26px] mt-0.5" style={{ color: TEXT }}>
                As-salāmu ʿalaykum
              </h1>
              <p className="text-[12px] mt-0.5" style={{ color: TEXT_DIM }}>
                12 Ramadan 1447 · April 19
              </p>
            </div>
            <Search size={18} strokeWidth={1.5} style={{ color: TEXT_DIM }} />
          </div>
        </div>

        {/* Continue Reading hero */}
        <div className="px-6 pt-5">
          <div
            className="relative rounded-3xl p-5 overflow-hidden"
            style={{
              background: `linear-gradient(140deg, ${SURFACE} 0%, ${SURFACE_2} 100%)`,
              border: `1px solid ${GOLD}55`,
              boxShadow: `0 20px 50px -25px ${GOLD}66`,
            }}
          >
            <div
              className="absolute -right-6 -top-6 w-32 h-32 opacity-30 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${GOLD}55 0%, transparent 70%)`,
              }}
            />
            <p className="text-[10px] uppercase tracking-[0.3em] mb-1" style={{ color: GOLD }}>
              Continue
            </p>
            <div className="flex items-baseline justify-between">
              <h2 className="text-[20px] font-bold" style={{ color: TEXT }}>
                Al-Baqarah
              </h2>
              <span className="font-['Amiri_Quran'] text-[26px]" style={{ color: TEXT }}>
                ٱلْبَقَرَة
              </span>
            </div>
            <p className="text-[12px] mt-1 mb-3" style={{ color: TEXT_DIM }}>
              The Cow · Ayah 97 of 286
            </p>

            {/* Progress */}
            <div className="h-[5px] rounded-full overflow-hidden" style={{ background: `${GOLD}1f` }}>
              <div
                className="h-full rounded-full"
                style={{ width: '34%', background: `linear-gradient(to right, ${GOLD_SOFT}, ${GOLD})` }}
              />
            </div>
            <div className="flex justify-between mt-2 mb-4">
              <span className="text-[10px]" style={{ color: TEXT_DIM }}>34% read</span>
              <span className="text-[10px]" style={{ color: TEXT_DIM }}>~38 min left</span>
            </div>

            <button
              className="w-full h-11 rounded-full flex items-center justify-center gap-2 font-semibold text-[13px]"
              style={{ background: GOLD, color: '#1a1207' }}
            >
              <Play size={14} fill="#1a1207" strokeWidth={0} />
              Resume
            </button>
          </div>
        </div>

        {/* For Today */}
        <div className="px-6 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={13} style={{ color: GOLD }} strokeWidth={1.5} />
            <h3 className="text-[11px] uppercase tracking-[0.25em]" style={{ color: TEXT }}>
              For Today
            </h3>
          </div>

          {/* Big Friday Al-Kahf card */}
          <div
            className="rounded-2xl p-4 mb-2.5 flex items-center gap-3"
            style={{ background: `${EMERALD}22`, border: `1px solid ${EMERALD}66` }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: EMERALD }}
            >
              <BookOpen size={20} strokeWidth={1.5} color="#fff" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider" style={{ color: '#8FCFB1' }}>
                Sunnah of Friday
              </p>
              <div className="flex items-baseline justify-between">
                <span className="font-bold text-[15px]" style={{ color: TEXT }}>Al-Kahf</span>
                <span className="font-['Amiri_Quran'] text-[17px]" style={{ color: TEXT }}>ٱلْكَهْف</span>
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: TEXT_DIM }}>
                "Light between two Fridays" · 110 ayat
              </p>
            </div>
          </div>

          {/* Two compact rec cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <RecCard icon={<Sun size={14} />} when="After Fajr" name="Yaseen" ar="يس" />
            <RecCard icon={<Moon size={14} />} when="Before sleep" name="Al-Mulk" ar="ٱلْمُلْك" />
          </div>
        </div>

        {/* Juz of the day */}
        <div className="px-6 pt-5">
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
          >
            <div className="relative w-12 h-12 shrink-0">
              <svg viewBox="0 0 48 48" className="absolute inset-0">
                <circle cx="24" cy="24" r="20" fill="none" stroke={`${GOLD}22`} strokeWidth="3" />
                <circle
                  cx="24" cy="24" r="20"
                  fill="none"
                  stroke={GOLD}
                  strokeWidth="3"
                  strokeDasharray={`${0.4 * 125.6} 125.6`}
                  transform="rotate(-90 24 24)"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-['Amiri'] font-bold text-[15px]" style={{ color: GOLD }}>
                12
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-wider" style={{ color: GOLD }}>
                Juz of the day
              </p>
              <p className="font-semibold text-[14px]" style={{ color: TEXT }}>
                Wa-mā min dābbah
              </p>
              <p className="text-[11px]" style={{ color: TEXT_DIM }}>
                40% complete · 8 of 20 pages
              </p>
            </div>
          </div>
        </div>

        {/* 114 grid */}
        <div className="px-6 pt-5 pb-24">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] uppercase tracking-[0.25em]" style={{ color: TEXT }}>
              All Surahs
            </h3>
            <span className="text-[10px]" style={{ color: TEXT_DIM }}>114</span>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 32 }).map((_, i) => {
              const n = i + 1;
              const read = [1, 2, 18, 36, 67].includes(n);
              const current = n === 2;
              return (
                <div
                  key={n}
                  className="aspect-square rounded-md flex items-center justify-center font-['Amiri'] text-[11px]"
                  style={{
                    background: current ? GOLD : read ? `${GOLD}22` : `${BORDER}77`,
                    color: current ? '#1a1207' : read ? GOLD : TEXT_DIM,
                    fontWeight: current ? 700 : 500,
                    border: current ? 'none' : `1px solid ${current ? 'transparent' : `${BORDER}`}`,
                  }}
                >
                  {n}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecCard({
  icon, when, name, ar,
}: { icon: React.ReactNode; when: string; name: string; ar: string }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
    >
      <div className="flex items-center gap-1.5 mb-1.5" style={{ color: GOLD }}>
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{when}</span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="font-semibold text-[13px]" style={{ color: TEXT }}>{name}</span>
        <span className="font-['Amiri_Quran'] text-[15px]" style={{ color: TEXT_DIM }}>{ar}</span>
      </div>
    </div>
  );
}
