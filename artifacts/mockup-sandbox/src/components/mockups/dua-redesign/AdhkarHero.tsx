import React, { useState } from 'react';
import { Search, Sunrise, Moon, Star, Heart, Shield, Users, MapPin, Activity, RefreshCw, Bookmark, ChevronLeft, ChevronRight, Volume2, RotateCcw } from 'lucide-react';

const BG = '#0A1612';
const SURFACE = '#10231C';
const SURFACE_2 = '#0D1C17';
const BORDER = '#1F3A30';
const TEXT = '#E8EAE6';
const TEXT_DIM = '#7A8B82';

const CATS = [
  { id: 'morning', name: 'Morning', icon: Sunrise, color: '#F6C55A' },
  { id: 'evening', name: 'Evening', icon: Moon, color: '#7986CB' },
  { id: 'prayer', name: 'After Salah', icon: Star, color: '#4DB6AC' },
  { id: 'ramadan', name: 'Ramadan', icon: Moon, color: '#81C784' },
  { id: 'daily', name: 'Daily', icon: Heart, color: '#E8A87C' },
  { id: 'forgiveness', name: 'Forgiveness', icon: RefreshCw, color: '#64B5F6' },
  { id: 'hardship', name: 'Hardship', icon: Shield, color: '#EF9A9A' },
  { id: 'family', name: 'Family', icon: Users, color: '#F48FB1' },
  { id: 'travel', name: 'Travel', icon: MapPin, color: '#80CBC4' },
  { id: 'health', name: 'Health', icon: Activity, color: '#A5D6A7' },
];

export default function AdhkarHero() {
  const [activeCatId, setActiveCatId] = useState('morning');
  const [count, setCount] = useState(2);
  const target = 3;
  const idx = 4;
  const total = 12;
  const cat = CATS.find(c => c.id === activeCatId)!;
  const ACCENT = cat.color;

  const ringSize = 220;
  const r = ringSize / 2 - 14;
  const c = 2 * Math.PI * r;

  return (
    <div
      className="relative w-full h-[100dvh] max-h-[844px] max-w-[390px] mx-auto overflow-hidden font-sans"
      style={{ background: BG, color: TEXT }}
    >
      {/* Aura */}
      <div
        className="absolute inset-x-0 top-0 h-[460px] pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${ACCENT}26 0%, transparent 65%)` }}
      />

      <div className="relative h-full flex flex-col">
        {/* Status bar */}
        <div className="flex justify-between items-center px-6 pt-3 pb-2 text-[11px]" style={{ color: TEXT_DIM }}>
          <span className="font-medium">9:41</span>
          <span>•••</span>
        </div>

        {/* Mini header */}
        <div className="px-6 flex items-center justify-between">
          <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            <ChevronLeft size={16} style={{ color: TEXT_DIM }} />
          </button>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.32em]" style={{ color: ACCENT }}>{cat.name} Adhkar</p>
            <p className="text-[12px] mt-0.5" style={{ color: TEXT_DIM }}>{idx} of {total}</p>
          </div>
          <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            <Search size={15} style={{ color: TEXT_DIM }} />
          </button>
        </div>

        {/* Progress arc through category */}
        <div className="px-6 mt-3">
          <div className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full"
                style={{ background: i < idx ? ACCENT : i === idx - 1 ? ACCENT : ACCENT + '22' }}
              />
            ))}
          </div>
        </div>

        {/* Hero card */}
        <div className="flex-1 px-5 pt-5 pb-2 overflow-y-auto">
          <div
            className="rounded-[28px] p-6 relative overflow-hidden"
            style={{
              background: `linear-gradient(160deg, ${SURFACE} 0%, ${SURFACE_2} 100%)`,
              border: `1px solid ${ACCENT}55`,
              boxShadow: `0 30px 70px -30px ${ACCENT}80`,
            }}
          >
            {/* Bookmark + repeat badge row */}
            <div className="flex items-center justify-between mb-2">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: ACCENT + '22', border: `1px solid ${ACCENT}55` }}
              >
                <RotateCcw size={11} style={{ color: ACCENT }} />
                <span className="text-[10px] font-bold tracking-wider" style={{ color: ACCENT }}>×{target} REPEAT</span>
              </div>
              <Bookmark size={18} style={{ color: ACCENT }} />
            </div>

            <h2 className="text-[18px] font-semibold mt-2" style={{ color: TEXT }}>Protection from Harm</h2>

            <p
              className="font-['Amiri'] text-[28px] leading-[1.95] text-right mt-5"
              style={{ color: TEXT, direction: 'rtl' }}
            >
              بِسْمِ اللهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ
            </p>

            <p className="text-[13px] italic mt-4 leading-[1.5]" style={{ color: ACCENT }}>
              Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwas-sami'ul-'aleem
            </p>

            <p className="text-[13px] mt-3 leading-[1.55]" style={{ color: TEXT_DIM }}>
              "In the name of Allah with whose name nothing is harmed on earth nor in the heavens, and He is the All-Hearing, the All-Knowing."
            </p>

            {/* Virtue */}
            <div
              className="mt-4 flex items-start gap-2 p-3 rounded-xl"
              style={{ background: ACCENT + '12', border: `1px solid ${ACCENT}33` }}
            >
              <Star size={12} style={{ color: ACCENT, marginTop: 2 }} />
              <p className="text-[11.5px] leading-[1.45]" style={{ color: ACCENT }}>
                Nothing will harm the one who says this three times morning and evening.
              </p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]" style={{ color: TEXT_DIM }}>📖 Abu Dawud 5088</span>
              </div>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: SURFACE_2 }}>
                <Volume2 size={12} style={{ color: TEXT_DIM }} />
                <span className="text-[10px]" style={{ color: TEXT_DIM }}>Audio</span>
              </button>
            </div>
          </div>

          {/* Tap-to-count counter */}
          <div className="flex items-center justify-center mt-6 mb-4 relative">
            <svg width={ringSize} height={ringSize} className="overflow-visible">
              <defs>
                <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity="1" />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <circle cx={ringSize/2} cy={ringSize/2} r={r} stroke={ACCENT + '20'} strokeWidth={6} fill="none" />
              <circle
                cx={ringSize/2} cy={ringSize/2} r={r}
                stroke="url(#ring-grad)"
                strokeWidth={6}
                fill="none"
                strokeDasharray={c}
                strokeDashoffset={c * (1 - count / target)}
                strokeLinecap="round"
                transform={`rotate(-90 ${ringSize/2} ${ringSize/2})`}
              />
            </svg>
            <button
              onClick={() => setCount(v => (v >= target ? 0 : v + 1))}
              className="absolute inset-0 m-auto rounded-full flex flex-col items-center justify-center"
              style={{
                width: ringSize - 50, height: ringSize - 50,
                background: `radial-gradient(circle, ${SURFACE} 30%, ${SURFACE_2} 100%)`,
                border: `1px solid ${ACCENT}55`,
                boxShadow: `inset 0 4px 20px -8px ${ACCENT}55`,
              }}
            >
              <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: TEXT_DIM }}>Tap</p>
              <p className="text-[52px] font-bold leading-none mt-1" style={{ color: TEXT }}>{count}</p>
              <p className="text-[12px] mt-1" style={{ color: ACCENT }}>of {target}</p>
            </button>
          </div>
        </div>

        {/* Bottom dock — category icons */}
        <div
          className="px-3 pb-4 pt-3"
          style={{ background: BG, borderTop: `1px solid ${BORDER}` }}
        >
          <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {CATS.map((c) => {
              const Icon = c.icon;
              const active = c.id === activeCatId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCatId(c.id)}
                  className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition"
                  style={{
                    background: active ? c.color + '22' : 'transparent',
                    border: `1px solid ${active ? c.color + '88' : 'transparent'}`,
                    minWidth: 56,
                  }}
                >
                  <Icon size={17} strokeWidth={active ? 2 : 1.5} style={{ color: active ? c.color : TEXT_DIM }} />
                  <span className="text-[9px] font-medium" style={{ color: active ? c.color : TEXT_DIM }}>
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
