import React, { useState } from 'react';
import { Flame, Check, ChevronLeft, ChevronRight, Moon, Sun, Cloud, Sunset, Stars, Sparkles, BookOpen, Bookmark } from 'lucide-react';

const BG = '#0A1612';
const SURFACE = '#10231C';
const SURFACE_2 = '#0D1C17';
const BORDER = '#1F3A30';
const GOLD = '#D4A017';
const TEXT = '#E8EAE6';
const TEXT_DIM = '#7A8B82';
const EMERALD = '#3B7A5E';

const PRAYERS = [
  { id: 'fajr',    en: 'Fajr',    ar: 'الفجر',   color: '#6366f1', icon: Stars,   time: '05:42', moment: 'Dawn' },
  { id: 'dhuhr',   en: 'Dhuhr',   ar: 'الظهر',  color: '#f59e0b', icon: Sun,     time: '12:18', moment: 'Midday' },
  { id: 'asr',     en: 'Asr',     ar: 'العصر',  color: '#10b981', icon: Cloud,   time: '15:31', moment: 'Afternoon' },
  { id: 'maghrib', en: 'Maghrib', ar: 'المغرب', color: '#f97316', icon: Sunset,  time: '18:04', moment: 'Sunset' },
  { id: 'isha',    en: 'Isha',    ar: 'العشاء', color: '#8b5cf6', icon: Moon,    time: '19:32', moment: 'Night' },
];

const WEEK = [
  { d: 'Su', n: 13, count: 5 },
  { d: 'Mo', n: 14, count: 5 },
  { d: 'Tu', n: 15, count: 4 },
  { d: 'We', n: 16, count: 5 },
  { d: 'Th', n: 17, count: 5 },
  { d: 'Fr', n: 18, count: 5 },
  { d: 'Sa', n: 19, count: 3, today: true },
];

export function HearthGarden() {
  const [done, setDone] = useState<Record<string, boolean>>({
    fajr: true, dhuhr: true, asr: true,
  });
  const completed = Object.values(done).filter(Boolean).length;
  const streak = 47;

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: 'Inter, system-ui, sans-serif' }} className="pb-12">
      {/* ── Top hero: Streak ember ── */}
      <div style={{
        background: `radial-gradient(120% 100% at 50% 0%, rgba(212,160,23,0.18) 0%, rgba(247,127,46,0.08) 35%, transparent 70%), ${SURFACE}`,
        borderBottom: `1px solid ${BORDER}`,
        paddingTop: 56,
      }} className="px-5 pb-7 relative overflow-hidden">
        {/* ambient sparks */}
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <div className="absolute" style={{ top: 30, left: 40, width: 3, height: 3, borderRadius: 999, background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
          <div className="absolute" style={{ top: 60, right: 50, width: 2, height: 2, borderRadius: 999, background: '#F77F2E', boxShadow: '0 0 6px #F77F2E' }} />
          <div className="absolute" style={{ top: 110, left: 70, width: 2, height: 2, borderRadius: 999, background: GOLD, boxShadow: `0 0 5px ${GOLD}` }} />
          <div className="absolute" style={{ top: 90, right: 80, width: 3, height: 3, borderRadius: 999, background: '#F77F2E', boxShadow: '0 0 7px #F77F2E' }} />
        </div>

        <div className="flex items-center justify-between mb-5 relative">
          <span style={{ color: GOLD, fontSize: 10, letterSpacing: 3, fontWeight: 600 }}>PRAYER · TRACKER</span>
          <span style={{ color: GOLD, fontFamily: 'Amiri, serif', fontSize: 16 }}>متابعة الصلوات</span>
        </div>

        {/* Ember + streak number */}
        <div className="flex items-center gap-4 relative">
          <div className="relative" style={{ width: 72, height: 72 }}>
            {/* outer glow */}
            <div className="absolute inset-0 rounded-full" style={{
              background: 'radial-gradient(circle, rgba(247,127,46,0.4) 0%, transparent 70%)',
              filter: 'blur(8px)',
            }} />
            <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{
              background: `linear-gradient(160deg, #F77F2E 0%, ${GOLD} 100%)`,
              boxShadow: `0 0 24px rgba(247,127,46,0.5), inset 0 0 12px rgba(255,255,255,0.2)`,
            }}>
              <Flame size={34} color="#FFF8E7" strokeWidth={2.2} fill="rgba(255,248,231,0.3)" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span style={{ fontSize: 42, fontWeight: 800, color: TEXT, letterSpacing: -1, fontVariantNumeric: 'tabular-nums' }}>{streak}</span>
              <span style={{ fontSize: 13, color: TEXT_DIM, fontWeight: 500 }}>day streak</span>
            </div>
            <div style={{ color: GOLD, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, marginTop: 2 }}>
              ✦ Next milestone: 60 days
            </div>
            {/* streak progress */}
            <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: BORDER }}>
              <div className="h-full" style={{ width: `${(47 / 60) * 100}%`, background: `linear-gradient(90deg, #F77F2E, ${GOLD})` }} />
            </div>
          </div>
        </div>

        {/* Today pill */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-full" style={{ background: SURFACE_2, border: `1px solid ${BORDER}` }}>
              <ChevronLeft size={14} color={TEXT_DIM} />
            </button>
            <div className="text-center">
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Saturday, April 19</div>
              <div style={{ fontSize: 11, color: GOLD, fontFamily: 'Amiri, serif' }}>2 Shawwāl 1447 AH</div>
            </div>
            <button className="p-1.5 rounded-full" style={{ background: SURFACE_2, border: `1px solid ${BORDER}` }}>
              <ChevronRight size={14} color={TEXT_DIM} />
            </button>
          </div>
          <div style={{ background: GOLD + '22', border: `1px solid ${GOLD}55`, color: GOLD, fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 999 }}>
            {completed}/5
          </div>
        </div>
      </div>

      {/* ── Week garden strip ── */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span style={{ color: TEXT_DIM, fontSize: 10, letterSpacing: 2, fontWeight: 600 }}>THIS WEEK</span>
          <span style={{ color: TEXT_DIM, fontSize: 10 }}>32 / 35 prayers</span>
        </div>
        <div className="flex justify-between gap-1">
          {WEEK.map((w) => {
            const filled = w.count === 5;
            return (
              <button key={w.n} className="flex-1 flex flex-col items-center gap-1.5 py-2 rounded-xl"
                style={{ background: w.today ? GOLD + '12' : 'transparent', border: w.today ? `1px solid ${GOLD}44` : '1px solid transparent' }}>
                <span style={{ fontSize: 9, color: w.today ? GOLD : TEXT_DIM, fontWeight: 700, letterSpacing: 0.5 }}>{w.d}</span>
                <span style={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>{w.n}</span>
                {/* rosebud */}
                <div className="relative" style={{ width: 14, height: 14 }}>
                  <div className="absolute inset-0 rounded-full" style={{
                    background: filled ? `radial-gradient(circle, ${GOLD} 0%, #B8860B 80%)` : `${BORDER}`,
                    boxShadow: filled ? `0 0 6px ${GOLD}66` : 'none',
                    border: filled ? `1px solid #FFD96B` : `1px solid ${BORDER}`,
                  }} />
                  {filled && <div className="absolute" style={{ top: 3, left: 5, width: 4, height: 4, borderRadius: 999, background: '#FFEEC2' }} />}
                </div>
                <span style={{ fontSize: 8, color: TEXT_DIM, fontVariantNumeric: 'tabular-nums' }}>{w.count}/5</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Today's path: vertical ascending lanterns ── */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <span style={{ color: TEXT, fontSize: 14, fontWeight: 700 }}>Today's path</span>
          <span style={{ color: TEXT_DIM, fontSize: 11 }}>{Math.round((completed / 5) * 100)}% lit</span>
        </div>

        <div className="relative">
          {/* vertical path line */}
          <div className="absolute" style={{
            left: 26, top: 18, bottom: 18, width: 2,
            background: `linear-gradient(180deg, ${GOLD}88 0%, ${BORDER} ${(completed / 5) * 100}%, ${BORDER} 100%)`,
            borderRadius: 1,
          }} />

          {PRAYERS.map((p, i) => {
            const isDone = !!done[p.id];
            const Icon = p.icon;
            return (
              <div key={p.id} className="flex items-center gap-3 mb-2.5 relative">
                {/* lantern node */}
                <button onClick={() => setDone({ ...done, [p.id]: !isDone })}
                  className="relative flex-shrink-0 rounded-full flex items-center justify-center transition-all"
                  style={{
                    width: 54, height: 54,
                    background: isDone
                      ? `radial-gradient(circle at 30% 30%, ${p.color}DD 0%, ${p.color}88 60%, ${p.color}33 100%)`
                      : SURFACE_2,
                    border: isDone ? `2px solid ${p.color}` : `2px solid ${BORDER}`,
                    boxShadow: isDone ? `0 0 16px ${p.color}77, inset 0 0 8px rgba(255,255,255,0.15)` : 'none',
                  }}>
                  <Icon size={22} color={isDone ? '#fff' : TEXT_DIM} strokeWidth={isDone ? 2.4 : 1.8} />
                  {isDone && (
                    <div className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center"
                      style={{ width: 18, height: 18, background: GOLD, border: `2px solid ${BG}` }}>
                      <Check size={10} color={BG} strokeWidth={3.5} />
                    </div>
                  )}
                </button>

                {/* card */}
                <div className="flex-1 rounded-2xl px-4 py-3 flex items-center justify-between" style={{
                  background: isDone ? `${p.color}10` : SURFACE,
                  border: `1px solid ${isDone ? p.color + '44' : BORDER}`,
                }}>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span style={{ fontSize: 15, fontWeight: 700, color: isDone ? p.color : TEXT }}>{p.en}</span>
                      <span style={{ fontSize: 13, color: TEXT_DIM, fontFamily: 'Amiri, serif' }}>{p.ar}</span>
                    </div>
                    <span style={{ fontSize: 10, color: TEXT_DIM, fontWeight: 500, letterSpacing: 0.3 }}>{p.moment}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: TEXT_DIM, fontVariantNumeric: 'tabular-nums' }}>{p.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Sunnah & Qaḍā cards ── */}
      <div className="px-5 mt-4 space-y-2.5">
        <button className="w-full rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <div className="rounded-xl flex items-center justify-center" style={{ width: 36, height: 36, background: GOLD + '18', border: `1px solid ${GOLD}33` }}>
            <BookOpen size={16} color={GOLD} />
          </div>
          <div className="flex-1 text-left">
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Sunnah prayers</div>
            <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 1 }}>Rawātib, Ḍuḥā, Tahajjud, Witr</div>
          </div>
          <ChevronRight size={16} color={TEXT_DIM} />
        </button>
        <button className="w-full rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <div className="rounded-xl flex items-center justify-center" style={{ width: 36, height: 36, background: GOLD + '18', border: `1px solid ${GOLD}33` }}>
            <Bookmark size={16} color={GOLD} />
          </div>
          <div className="flex-1 text-left">
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Make-up prayers</div>
            <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 1 }}>A quiet ledger for qaḍā</div>
          </div>
          <ChevronRight size={16} color={TEXT_DIM} />
        </button>
      </div>

      {/* ornament */}
      <div className="flex items-center gap-3 mt-6 px-12">
        <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
        <Sparkles size={11} color={GOLD} />
        <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)` }} />
      </div>
    </div>
  );
}

export default HearthGarden;
