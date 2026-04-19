import React, { useState } from 'react';
import { Search, Sunrise, Moon, Star, Heart, Shield, Users, MapPin, Activity, RefreshCw, Bookmark, ChevronLeft, BookOpen } from 'lucide-react';

const BG = '#0E1A14';
const PARCHMENT = '#13231C';
const SURFACE = '#152721';
const SURFACE_2 = '#0E1B16';
const BORDER = '#22463A';
const GOLD = '#D4A017';
const GOLD_SOFT = '#C9933A';
const TEXT = '#EFE9D8';
const TEXT_DIM = '#8A9B91';

const CATS = [
  { id: 'morning',     name: 'Morning Adhkar',  icon: Sunrise,   color: '#F6C55A', total: 12, done: 7,  desc: 'After Fajr' },
  { id: 'evening',     name: 'Evening Adhkar',  icon: Moon,      color: '#7986CB', total: 12, done: 0,  desc: 'After Asr' },
  { id: 'prayer',      name: 'After Salah',     icon: Star,      color: '#4DB6AC', total: 9,  done: 5,  desc: 'Post-prayer' },
  { id: 'ramadan',     name: 'Ramadan',         icon: Moon,      color: '#81C784', total: 8,  done: 3,  desc: 'Fasting & iftar' },
  { id: 'daily',       name: 'Daily Life',      icon: Heart,     color: '#E8A87C', total: 14, done: 0,  desc: 'Eating, sleep' },
  { id: 'forgiveness', name: 'Forgiveness',     icon: RefreshCw, color: '#64B5F6', total: 8,  done: 0,  desc: 'Tawbah' },
  { id: 'hardship',    name: 'Hardship',        icon: Shield,    color: '#EF9A9A', total: 9,  done: 0,  desc: 'Anxiety, worry' },
  { id: 'family',      name: 'Family',          icon: Users,     color: '#F48FB1', total: 7,  done: 0,  desc: 'Loved ones' },
  { id: 'travel',      name: 'Travel',          icon: MapPin,    color: '#80CBC4', total: 6,  done: 0,  desc: 'Journey' },
  { id: 'health',      name: 'Health',          icon: Activity,  color: '#A5D6A7', total: 7,  done: 0,  desc: 'Healing' },
];

const PLATES = [
  {
    n: 1,
    title: 'Morning Remembrance',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ',
    transliteration: 'Asbahna wa asbahal mulku lillah…',
    translation: 'We have entered the morning and the kingdom belongs to Allah.',
    reference: 'Abu Dawud · 4:317',
    repeat: null,
  },
  {
    n: 2,
    title: 'Ayat al-Kursi',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
    transliteration: 'Allahu la ilaha illa huwal-hayyul-qayyum…',
    translation: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer.',
    reference: 'Al-Baqarah · 2:255',
    repeat: '1×',
    virtue: 'Whoever recites it every morning is protected from jinn until evening.',
  },
];

function ProgressRing({ pct, color, size = 30 }: { pct: number; color: string; size?: number }) {
  const r = size / 2 - 2.5;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="overflow-visible">
      <circle cx={size/2} cy={size/2} r={r} stroke={color + '33'} strokeWidth={2.5} fill="none" />
      <circle
        cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={2.5} fill="none"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
    </svg>
  );
}

function GridView({ onOpen }: { onOpen: (id: string) => void }) {
  const totalDone = CATS.reduce((s, c) => s + c.done, 0);
  const totalAll  = CATS.reduce((s, c) => s + c.total, 0);
  return (
    <>
      {/* Header */}
      <div className="px-6 pt-2">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em]" style={{ color: GOLD }}>
              The Library
            </p>
            <h1 className="font-['Amiri'] text-[28px] mt-0.5 leading-tight" style={{ color: TEXT }}>
              الأدعية والأذكار
            </h1>
            <p className="text-[12px] mt-0.5" style={{ color: TEXT_DIM }}>
              Du'a &amp; Adhkar · 92 supplications
            </p>
          </div>
          <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            <Search size={15} style={{ color: TEXT_DIM }} />
          </button>
        </div>
      </div>

      {/* Daily progress band */}
      <div className="px-6 mt-4">
        <div
          className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{
            background: `linear-gradient(120deg, ${PARCHMENT} 0%, ${SURFACE_2} 100%)`,
            border: `1px solid ${GOLD}44`,
          }}
        >
          <ProgressRing pct={totalDone / totalAll} color={GOLD} size={42} />
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: GOLD }}>Today's Wird</p>
            <p className="text-[14px] mt-0.5" style={{ color: TEXT }}>
              <span className="font-bold">{totalDone}</span>
              <span style={{ color: TEXT_DIM }}> of {totalAll} adhkar completed</span>
            </p>
          </div>
          <button
            className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg"
            style={{ background: GOLD, color: '#0A1612' }}
          >
            Resume
          </button>
        </div>
      </div>

      {/* Saved row */}
      <div className="px-6 mt-5 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: TEXT_DIM }}>Categories</p>
        <button className="flex items-center gap-1.5 text-[11px]" style={{ color: GOLD }}>
          <Bookmark size={12} fill={GOLD} />
          Saved · 6
        </button>
      </div>

      {/* 2-col tile grid */}
      <div className="px-5 mt-3 grid grid-cols-2 gap-3 pb-6">
        {CATS.map((c) => {
          const Icon = c.icon;
          const pct = c.done / c.total;
          return (
            <button
              key={c.id}
              onClick={() => onOpen(c.id)}
              className="rounded-2xl p-3.5 text-left relative overflow-hidden"
              style={{
                background: `linear-gradient(160deg, ${SURFACE} 0%, ${SURFACE_2} 100%)`,
                border: `1px solid ${c.color}33`,
                minHeight: 128,
              }}
            >
              <div
                className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${c.color}22 0%, transparent 70%)` }}
              />
              <div className="flex items-start justify-between">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: c.color + '22', border: `1px solid ${c.color}55` }}
                >
                  <Icon size={17} strokeWidth={1.6} style={{ color: c.color }} />
                </div>
                <ProgressRing pct={pct} color={c.color} size={26} />
              </div>
              <h3 className="text-[13.5px] font-semibold mt-3 leading-tight" style={{ color: TEXT }}>{c.name}</h3>
              <p className="text-[10.5px] mt-0.5" style={{ color: TEXT_DIM }}>{c.desc}</p>
              <p className="text-[10px] mt-2" style={{ color: c.color }}>
                {c.done > 0 ? `${c.done}/${c.total} today` : `${c.total} duas`}
              </p>
            </button>
          );
        })}
      </div>
    </>
  );
}

function CategoryView({ catId, onBack }: { catId: string; onBack: () => void }) {
  const cat = CATS.find(c => c.id === catId)!;
  const Icon = cat.icon;
  const ACCENT = cat.color;

  return (
    <>
      {/* Header w/ back */}
      <div className="px-5 pt-2 flex items-center justify-between">
        <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <ChevronLeft size={17} style={{ color: TEXT }} />
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: ACCENT + '18', border: `1px solid ${ACCENT}55` }}>
          <Icon size={12} style={{ color: ACCENT }} />
          <span className="text-[11px] font-semibold" style={{ color: ACCENT }}>{cat.name}</span>
        </div>
        <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <Search size={15} style={{ color: TEXT_DIM }} />
        </button>
      </div>

      {/* Category title plate */}
      <div className="px-6 mt-5 text-center">
        <Icon size={26} strokeWidth={1.4} style={{ color: ACCENT, margin: '0 auto' }} />
        <h2 className="font-['Amiri'] text-[24px] mt-2" style={{ color: TEXT }}>{cat.name}</h2>
        <p className="text-[11.5px] mt-1" style={{ color: TEXT_DIM }}>{cat.total} duas · {cat.done} completed today</p>

        {/* Progress bar */}
        <div className="h-1 rounded-full mt-3 mx-auto max-w-[200px]" style={{ background: ACCENT + '22' }}>
          <div className="h-1 rounded-full" style={{ width: `${(cat.done/cat.total)*100}%`, background: ACCENT }} />
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-6 mt-5 flex justify-center gap-2">
        {['All', 'Today', 'Saved'].map((label, i) => (
          <button
            key={label}
            className="px-3.5 py-1.5 rounded-full text-[11px] font-medium"
            style={{
              background: i === 0 ? ACCENT + '22' : 'transparent',
              border: `1px solid ${i === 0 ? ACCENT : BORDER}`,
              color: i === 0 ? ACCENT : TEXT_DIM,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Plates */}
      <div className="px-5 mt-6 pb-8">
        {PLATES.map((p, i) => (
          <React.Fragment key={p.n}>
            <div
              className="rounded-2xl p-5"
              style={{
                background: `linear-gradient(155deg, ${PARCHMENT} 0%, ${SURFACE_2} 100%)`,
                border: `1px solid ${BORDER}`,
              }}
            >
              {/* Plate header — illuminated number */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="font-['Amiri'] text-[32px] leading-none flex-shrink-0"
                  style={{
                    color: ACCENT,
                    width: 44, height: 44,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${ACCENT}66`,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${ACCENT}18 0%, transparent 70%)`,
                  }}
                >
                  {p.n}
                </div>
                <div className="flex-1">
                  <h4 className="text-[14px] font-semibold" style={{ color: TEXT }}>{p.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px]" style={{ color: TEXT_DIM }}>📖 {p.reference}</span>
                    {p.repeat && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: ACCENT + '22', color: ACCENT, border: `1px solid ${ACCENT}55` }}
                      >
                        {p.repeat}
                      </span>
                    )}
                  </div>
                </div>
                <Bookmark size={15} style={{ color: i === 1 ? ACCENT : TEXT_DIM }} fill={i === 1 ? ACCENT : 'none'} />
              </div>

              {/* Arabic plate */}
              <div
                className="rounded-xl p-4 my-2"
                style={{
                  background: `linear-gradient(170deg, ${SURFACE_2} 0%, ${BG} 100%)`,
                  border: `1px solid ${ACCENT}22`,
                }}
              >
                <p
                  className="font-['Amiri'] text-[24px] leading-[2] text-right"
                  style={{ color: TEXT, direction: 'rtl' }}
                >
                  {p.arabic}
                </p>
              </div>

              <p className="text-[12px] italic mt-3" style={{ color: GOLD_SOFT }}>{p.transliteration}</p>
              <p className="text-[12.5px] mt-2 leading-[1.55]" style={{ color: TEXT_DIM }}>{p.translation}</p>

              {p.virtue && (
                <div
                  className="mt-3 flex items-start gap-2 p-2.5 rounded-lg"
                  style={{ background: ACCENT + '12', border: `1px solid ${ACCENT}33` }}
                >
                  <Star size={11} style={{ color: ACCENT, marginTop: 2 }} />
                  <p className="text-[11px] leading-[1.4]" style={{ color: ACCENT }}>{p.virtue}</p>
                </div>
              )}
            </div>

            {/* Ornamental § divider */}
            {i < PLATES.length - 1 && (
              <div className="flex items-center justify-center my-4 gap-3">
                <div className="h-px w-12" style={{ background: GOLD + '44' }} />
                <span className="font-['Amiri'] text-[20px]" style={{ color: GOLD_SOFT }}>﷽</span>
                <div className="h-px w-12" style={{ background: GOLD + '44' }} />
              </div>
            )}
          </React.Fragment>
        ))}

        {/* End ornament */}
        <div className="flex items-center justify-center mt-6 gap-2 opacity-60">
          <BookOpen size={11} style={{ color: GOLD_SOFT }} />
          <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: GOLD_SOFT }}>End of Section</span>
        </div>
      </div>
    </>
  );
}

export default function LibraryShelf() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div
      className="relative w-full h-[100dvh] max-h-[844px] max-w-[390px] mx-auto overflow-hidden font-sans"
      style={{ background: BG, color: TEXT }}
    >
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[400px] pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${GOLD}1a 0%, transparent 60%)` }}
      />

      <div className="relative h-full overflow-y-auto pb-6">
        {/* Status bar */}
        <div className="flex justify-between items-center px-6 pt-3 pb-2 text-[11px]" style={{ color: TEXT_DIM }}>
          <span className="font-medium">9:41</span>
          <span>•••</span>
        </div>

        {openId
          ? <CategoryView catId={openId} onBack={() => setOpenId(null)} />
          : <GridView onOpen={(id) => setOpenId(id)} />}
      </div>
    </div>
  );
}
