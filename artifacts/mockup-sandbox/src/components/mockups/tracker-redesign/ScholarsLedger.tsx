import React, { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Flame, BookOpen, Bookmark } from 'lucide-react';

const BG = '#0A1612';
const SURFACE = '#10231C';
const SURFACE_2 = '#0D1C17';
const BORDER = '#1F3A30';
const GOLD = '#D4A017';
const GOLD_HI = '#F0C24A';
const TEXT = '#E8EAE6';
const TEXT_DIM = '#7A8B82';

const PRAYERS = [
  { id: 'fajr',    en: 'Fajr',    ar: 'الفجر',   color: '#6366f1', time: '05:42' },
  { id: 'dhuhr',   en: 'Dhuhr',   ar: 'الظهر',  color: '#f59e0b', time: '12:18' },
  { id: 'asr',     en: 'Asr',     ar: 'العصر',  color: '#10b981', time: '15:31' },
  { id: 'maghrib', en: 'Maghrib', ar: 'المغرب', color: '#f97316', time: '18:04' },
  { id: 'isha',    en: 'Isha',    ar: 'العشاء', color: '#8b5cf6', time: '19:32' },
];

// 28-day heat grid (4 weeks × 7 days). Counts of prayers (0-5).
const HEAT: number[] = [
  5,5,4,5,5,5,3,
  5,5,5,4,5,5,5,
  4,5,5,5,5,5,5,
  5,5,5,5,5,5,3,
];

function heatColor(n: number) {
  if (n === 0) return BORDER;
  if (n <= 2) return GOLD + '22';
  if (n <= 3) return GOLD + '55';
  if (n === 4) return GOLD + '99';
  return GOLD;
}

export function ScholarsLedger() {
  const [done, setDone] = useState<Record<string, boolean>>({
    fajr: true, dhuhr: true, asr: true,
  });
  const completed = Object.values(done).filter(Boolean).length;
  const streak = 47;

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: 'Inter, system-ui, sans-serif' }} className="pb-12">
      {/* ── Engraved hero ── */}
      <div className="px-5 pt-14 pb-6 relative" style={{
        background: `linear-gradient(180deg, rgba(212,160,23,0.06) 0%, transparent 100%)`,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        {/* eyebrow */}
        <div className="flex items-center justify-between mb-3">
          <span style={{ color: GOLD, fontSize: 10, letterSpacing: 4, fontWeight: 600 }}>PRAYER · LEDGER</span>
          <span style={{ color: GOLD, fontFamily: 'Amiri, serif', fontSize: 17 }}>متابعة الصلوات</span>
        </div>

        {/* Engraved streak */}
        <div className="flex items-end justify-between">
          <div>
            <div style={{ color: TEXT_DIM, fontSize: 10, letterSpacing: 2.5, fontWeight: 600 }}>DAY STREAK</div>
            <div className="flex items-end gap-2 mt-1">
              <span style={{
                fontSize: 76, fontFamily: 'Cormorant Garamond, Playfair Display, Georgia, serif',
                fontWeight: 600, color: GOLD_HI, letterSpacing: -2, lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                textShadow: `0 1px 0 #B8860B, 0 0 30px rgba(212,160,23,0.4)`,
              }}>{streak}</span>
              <div className="pb-3 flex items-center gap-1.5">
                <Flame size={16} color={GOLD} fill={GOLD + '44'} />
                <span style={{ color: GOLD, fontSize: 11, fontWeight: 600 }}>continuous</span>
              </div>
            </div>
          </div>

          {/* Date stack */}
          <div className="text-right pb-2">
            <button className="inline-flex items-center gap-1.5 text-xs" style={{ color: TEXT_DIM }}>
              <ChevronLeft size={14} />
              <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>Sat, Apr 19</span>
              <ChevronRight size={14} />
            </button>
            <div style={{ color: GOLD, fontFamily: 'Amiri, serif', fontSize: 11, marginTop: 2 }}>
              2 Shawwāl 1447 AH
            </div>
          </div>
        </div>

        {/* Milestone progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span style={{ fontSize: 10, color: TEXT_DIM, letterSpacing: 1, fontWeight: 600 }}>NEXT · 60 DAYS</span>
            <span style={{ fontSize: 10, color: GOLD, fontWeight: 600 }}>13 days remaining</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden relative" style={{ background: BORDER }}>
            <div className="h-full" style={{
              width: `${(streak / 60) * 100}%`,
              background: `linear-gradient(90deg, ${GOLD}, ${GOLD_HI})`,
              boxShadow: `0 0 8px ${GOLD}66`,
            }} />
          </div>
          {/* milestone markers */}
          <div className="flex justify-between mt-2 px-0.5" style={{ fontSize: 8, color: TEXT_DIM, fontWeight: 600 }}>
            <span>3</span><span>7</span><span style={{ color: GOLD }}>14</span><span style={{ color: GOLD }}>30</span><span style={{ color: GOLD_HI }}>60</span><span>100</span>
          </div>
        </div>
      </div>

      {/* ── Today's ledger ── */}
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Today's Ledger</div>
            <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 1, letterSpacing: 0.3 }}>
              {completed === 5 ? 'All 5 inscribed' : `${completed} of 5 inscribed`}
            </div>
          </div>
          <div className="rounded-full px-3 py-1" style={{ background: GOLD + '15', border: `1px solid ${GOLD}44` }}>
            <span style={{ color: GOLD, fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{completed}/5</span>
          </div>
        </div>

        {/* Ledger card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          {PRAYERS.map((p, i) => {
            const isDone = !!done[p.id];
            return (
              <button key={p.id}
                onClick={() => setDone({ ...done, [p.id]: !isDone })}
                className="w-full flex items-center px-4 py-3.5"
                style={{ borderBottom: i < PRAYERS.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                {/* numeral */}
                <span style={{
                  fontFamily: 'Cormorant Garamond, Playfair Display, Georgia, serif',
                  fontSize: 22, color: isDone ? GOLD_HI : TEXT_DIM, fontWeight: 600,
                  width: 24, textAlign: 'center',
                  fontVariantNumeric: 'tabular-nums',
                }}>{['I','II','III','IV','V'][i]}</span>

                {/* color seam */}
                <div className="ml-3 mr-3" style={{ width: 3, height: 28, background: p.color, borderRadius: 2, opacity: isDone ? 1 : 0.4 }} />

                <div className="flex-1 text-left">
                  <div className="flex items-baseline gap-2">
                    <span style={{ fontSize: 15, fontWeight: 700, color: TEXT, letterSpacing: -0.1 }}>{p.en}</span>
                    <span style={{ fontSize: 13, color: TEXT_DIM, fontFamily: 'Amiri, serif' }}>{p.ar}</span>
                  </div>
                  <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>{p.time}</div>
                </div>

                {/* Inscribe checkbox */}
                <div className="rounded-md flex items-center justify-center" style={{
                  width: 26, height: 26,
                  background: isDone ? GOLD : 'transparent',
                  border: isDone ? `1.5px solid ${GOLD}` : `1.5px solid ${BORDER}`,
                  boxShadow: isDone ? `0 0 8px ${GOLD}55` : 'none',
                }}>
                  {isDone && <Check size={14} color={BG} strokeWidth={3.2} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 28-day heatmap ── */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: 11, color: TEXT, fontWeight: 700, letterSpacing: 0.3 }}>Last 4 weeks</span>
          <span style={{ fontSize: 10, color: TEXT_DIM }}>134 / 140 prayers</span>
        </div>
        <div className="rounded-2xl p-3" style={{ background: SURFACE_2, border: `1px solid ${BORDER}` }}>
          <div className="flex justify-between mb-1.5 px-1" style={{ fontSize: 8, color: TEXT_DIM, fontWeight: 600, letterSpacing: 0.5 }}>
            {['S','M','T','W','T','F','S'].map((d, i) => <span key={i} className="flex-1 text-center">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {HEAT.map((n, i) => (
              <div key={i} className="aspect-square rounded-md flex items-center justify-center" style={{
                background: heatColor(n),
                border: i === 27 ? `1.5px solid ${GOLD_HI}` : `1px solid ${BORDER}`,
                boxShadow: n === 5 ? `inset 0 0 4px rgba(255,224,138,0.3)` : 'none',
              }}>
                {i === 27 && <span style={{ fontSize: 8, color: GOLD_HI, fontWeight: 700 }}>•</span>}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <span style={{ fontSize: 9, color: TEXT_DIM }}>less</span>
            <div className="flex gap-0.5">
              {[0,1,3,4,5].map((n) => (
                <div key={n} className="w-3 h-3 rounded-sm" style={{ background: heatColor(n), border: `1px solid ${BORDER}` }} />
              ))}
            </div>
            <span style={{ fontSize: 9, color: TEXT_DIM }}>more</span>
          </div>
        </div>
      </div>

      {/* ── Auxiliary ── */}
      <div className="px-5 mt-4 space-y-2">
        <button className="w-full rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <div className="rounded-xl flex items-center justify-center" style={{ width: 32, height: 32, background: GOLD + '18', border: `1px solid ${GOLD}33` }}>
            <BookOpen size={14} color={GOLD} />
          </div>
          <div className="flex-1 text-left">
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>Sunnah prayers</div>
            <div style={{ fontSize: 10, color: TEXT_DIM }}>Rawātib, Ḍuḥā, Tahajjud</div>
          </div>
          <ChevronRight size={14} color={TEXT_DIM} />
        </button>
        <button className="w-full rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <div className="rounded-xl flex items-center justify-center" style={{ width: 32, height: 32, background: GOLD + '18', border: `1px solid ${GOLD}33` }}>
            <Bookmark size={14} color={GOLD} />
          </div>
          <div className="flex-1 text-left">
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>Make-up prayers</div>
            <div style={{ fontSize: 10, color: TEXT_DIM }}>A quiet ledger for qaḍā</div>
          </div>
          <ChevronRight size={14} color={TEXT_DIM} />
        </button>
      </div>

      {/* gold ﷽ ornament */}
      <div className="text-center mt-6">
        <div className="flex items-center justify-center gap-3 px-12">
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}66, transparent)` }} />
          <span style={{ fontFamily: 'Amiri, serif', color: GOLD, fontSize: 22 }}>﷽</span>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}66, transparent)` }} />
        </div>
      </div>
    </div>
  );
}

export default ScholarsLedger;
