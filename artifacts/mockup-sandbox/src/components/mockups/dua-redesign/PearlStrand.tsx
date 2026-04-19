import React, { useState } from 'react';
import { Search, Sunrise, Moon, Star, Heart, Shield, Users, MapPin, Activity, RefreshCw, Bookmark, ChevronDown, Copy, Share2 } from 'lucide-react';

const BG = '#0A1612';
const SURFACE = '#10231C';
const SURFACE_2 = '#0D1C17';
const BORDER = '#1F3A30';
const GOLD = '#D4A017';
const TEXT = '#E8EAE6';
const TEXT_DIM = '#7A8B82';
const EMERALD = '#3B7A5E';

const CATS = [
  { id: 'morning',     name: 'Morning',    icon: Sunrise,   color: '#F6C55A', total: 12, done: 7 },
  { id: 'evening',     name: 'Evening',    icon: Moon,      color: '#7986CB', total: 12, done: 0 },
  { id: 'prayer',      name: 'After Salah',icon: Star,      color: '#4DB6AC', total: 9,  done: 5 },
  { id: 'ramadan',     name: 'Ramadan',    icon: Moon,      color: '#81C784', total: 8,  done: 3 },
  { id: 'daily',       name: 'Daily',      icon: Heart,     color: '#E8A87C', total: 14, done: 0 },
  { id: 'forgiveness', name: 'Forgiveness',icon: RefreshCw, color: '#64B5F6', total: 8,  done: 0 },
  { id: 'hardship',    name: 'Hardship',   icon: Shield,    color: '#EF9A9A', total: 9,  done: 0 },
  { id: 'family',      name: 'Family',     icon: Users,     color: '#F48FB1', total: 7,  done: 0 },
  { id: 'travel',      name: 'Travel',     icon: MapPin,    color: '#80CBC4', total: 6,  done: 0 },
  { id: 'health',      name: 'Health',     icon: Activity,  color: '#A5D6A7', total: 7,  done: 0 },
];

const SAMPLE_DUAS = [
  {
    id: 'm1',
    title: 'Morning Remembrance',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ',
    transliteration: 'Asbahna wa asbahal mulku lillah…',
    translation: 'We have entered the morning and the kingdom belongs to Allah.',
    reference: 'Abu Dawud 4:317',
    repeat: null,
    expanded: true,
  },
  {
    id: 'm3',
    title: 'Ayat al-Kursi',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
    transliteration: '',
    translation: '',
    reference: 'Al-Baqarah 2:255',
    repeat: '1×',
    virtue: 'Protected from jinn until evening.',
  },
  {
    id: 'm4',
    title: 'Protection from Harm',
    arabic: 'بِسْمِ اللهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ',
    transliteration: '',
    translation: '',
    reference: 'Abu Dawud 5088',
    repeat: '3×',
  },
  {
    id: 'm7',
    title: 'Morning Tasbih',
    arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
    transliteration: '',
    translation: '',
    reference: 'Muslim 2691',
    repeat: '100×',
  },
];

function ProgressRing({ pct, color, size = 26 }: { pct: number; color: string; size?: number }) {
  const r = size / 2 - 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="overflow-visible">
      <circle cx={size/2} cy={size/2} r={r} stroke={color + '33'} strokeWidth={2} fill="none" />
      <circle
        cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={2} fill="none"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
    </svg>
  );
}

export default function PearlStrand() {
  const [activeCatId, setActiveCatId] = useState('morning');
  const activeCat = CATS.find(c => c.id === activeCatId)!;
  const ActiveIcon = activeCat.icon;
  const ACCENT = activeCat.color;
  const totalDone = CATS.reduce((s, c) => s + c.done, 0);
  const totalAll  = CATS.reduce((s, c) => s + c.total, 0);

  return (
    <div
      className="relative w-full h-[100dvh] max-h-[844px] max-w-[390px] mx-auto overflow-hidden font-sans"
      style={{ background: BG, color: TEXT }}
    >
      {/* Aura behind hero */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[400px] pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${ACCENT}20 0%, transparent 60%)` }}
      />

      <div className="relative h-full overflow-y-auto pb-24">
        {/* Status bar */}
        <div className="flex justify-between items-center px-6 pt-3 pb-2 text-[11px]" style={{ color: TEXT_DIM }}>
          <span className="font-medium">9:41</span>
          <span>•••</span>
        </div>

        {/* Header */}
        <div className="px-6 pt-2 flex items-baseline justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
              Du'a · Adhkar
            </p>
            <h1 className="font-['Amiri'] text-[28px] mt-0.5 leading-tight" style={{ color: TEXT }}>
              الأدعية والأذكار
            </h1>
            <p className="text-[12px] mt-0.5" style={{ color: TEXT_DIM }}>92 authentic supplications</p>
          </div>
          <Search size={18} strokeWidth={1.5} style={{ color: TEXT_DIM }} />
        </div>

        {/* Today's Adhkar progress hero */}
        <div className="px-6 pt-5">
          <div
            className="rounded-3xl p-4 relative overflow-hidden"
            style={{
              background: `linear-gradient(140deg, ${SURFACE} 0%, ${SURFACE_2} 100%)`,
              border: `1px solid ${ACCENT}55`,
              boxShadow: `0 20px 50px -25px ${ACCENT}66`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: ACCENT }}>Today's Adhkar</p>
                <p className="text-[22px] font-bold mt-1" style={{ color: TEXT }}>
                  {totalDone}<span className="text-[14px] font-normal" style={{ color: TEXT_DIM }}> / {totalAll}</span>
                </p>
              </div>
              <ProgressRing pct={totalDone / totalAll} color={ACCENT} size={48} />
            </div>
            {/* Two pillars */}
            <div className="flex gap-2">
              {[CATS[0], CATS[1]].map((c) => {
                const Icon = c.icon;
                const pct = c.done / c.total;
                return (
                  <div
                    key={c.id}
                    className="flex-1 rounded-2xl p-3 flex items-center gap-3"
                    style={{ background: c.color + '12', border: `1px solid ${c.color}33` }}
                  >
                    <div className="rounded-full p-2" style={{ background: c.color + '22' }}>
                      <Icon size={16} strokeWidth={1.5} style={{ color: c.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px]" style={{ color: TEXT_DIM }}>{c.name}</p>
                      <div className="h-1 rounded-full mt-1.5" style={{ background: c.color + '22' }}>
                        <div className="h-1 rounded-full" style={{ width: `${pct*100}%`, background: c.color }} />
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: c.color }}>{c.done}/{c.total} done</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category chips */}
        <div className="mt-5">
          <div className="flex gap-2 overflow-x-auto px-6 pb-1" style={{ scrollbarWidth: 'none' }}>
            {CATS.map((c) => {
              const Icon = c.icon;
              const active = c.id === activeCatId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCatId(c.id)}
                  className="flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full transition"
                  style={{
                    background: active ? c.color : 'transparent',
                    border: `1px solid ${active ? c.color : BORDER}`,
                    boxShadow: active ? `0 6px 16px -8px ${c.color}` : 'none',
                  }}
                >
                  <Icon size={13} strokeWidth={1.6} style={{ color: active ? '#0A1612' : c.color }} />
                  <span className="text-[12px] font-medium" style={{ color: active ? '#0A1612' : TEXT_DIM }}>
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section divider */}
        <div className="px-6 mt-5 mb-3 flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: BORDER }} />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: ACCENT + '22', border: `1px solid ${ACCENT}55` }}>
            <ActiveIcon size={11} style={{ color: ACCENT }} />
            <span className="text-[11px] font-semibold" style={{ color: ACCENT }}>
              {activeCat.name} Adhkar · {activeCat.total}
            </span>
          </div>
          <div className="flex-1 h-px" style={{ background: BORDER }} />
        </div>

        {/* Pearl-strand cards */}
        <div className="px-4 space-y-2.5">
          {SAMPLE_DUAS.map((d, i) => (
            <div
              key={d.id}
              className="rounded-2xl flex overflow-hidden"
              style={{
                background: SURFACE,
                border: `1px solid ${i === 0 ? ACCENT + '55' : BORDER}`,
              }}
            >
              {/* accent seam */}
              <div className="w-1" style={{ background: ACCENT }} />
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-[0.22em] mb-1" style={{ color: ACCENT }}>
                      {activeCat.name}
                    </p>
                    <h3 className="text-[15px] font-semibold leading-tight" style={{ color: TEXT }}>{d.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {d.repeat && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={{ background: ACCENT + '22', color: ACCENT, border: `1px solid ${ACCENT}55` }}
                      >
                        {d.repeat}
                      </span>
                    )}
                    <Bookmark size={15} style={{ color: i === 0 ? ACCENT : TEXT_DIM }} fill={i === 0 ? ACCENT : 'none'} />
                    <ChevronDown size={14} style={{ color: TEXT_DIM, transform: i === 0 ? 'rotate(180deg)' : undefined }} />
                  </div>
                </div>

                <p
                  className="font-['Amiri'] text-[22px] mt-3 leading-[1.9] text-right"
                  style={{ color: TEXT, direction: 'rtl' }}
                >
                  {d.arabic}
                </p>

                {i === 0 && (
                  <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                    <p className="text-[12px] italic mb-2" style={{ color: ACCENT }}>
                      {d.transliteration}
                    </p>
                    <p className="text-[12.5px] leading-[1.55]" style={{ color: TEXT_DIM }}>
                      {d.translation}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md"
                        style={{ background: SURFACE_2 }}
                      >
                        <span className="text-[10px]" style={{ color: TEXT_DIM }}>📖 {d.reference}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md"
                          style={{ background: SURFACE_2 }}
                        >
                          <Copy size={11} style={{ color: TEXT_DIM }} />
                          <span className="text-[10px]" style={{ color: TEXT_DIM }}>Copy</span>
                        </button>
                        <button
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md"
                          style={{ background: SURFACE_2 }}
                        >
                          <Share2 size={11} style={{ color: TEXT_DIM }} />
                          <span className="text-[10px]" style={{ color: TEXT_DIM }}>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Faux tab bar */}
      <div
        className="absolute bottom-0 inset-x-0 h-[68px] flex items-center justify-around px-6"
        style={{ background: SURFACE, borderTop: `1px solid ${BORDER}` }}
      >
        {[0,1,2,3,4].map(i => (
          <div key={i} className="w-7 h-7 rounded-full" style={{ background: i === 2 ? ACCENT + '33' : 'transparent', border: `1px solid ${i === 2 ? ACCENT : BORDER}` }} />
        ))}
      </div>
    </div>
  );
}
