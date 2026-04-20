import React from 'react';
import { MapPin, Bell, Sparkles, BookOpen, Share2, ChevronRight, Compass, BookMarked } from 'lucide-react';

const BG = '#0A1612';
const SURFACE = '#10231C';
const SURFACE_2 = '#0D1C17';
const BORDER = '#1F3A30';
const GOLD = '#D4A017';
const GOLD_SOFT = 'rgba(212,160,23,0.14)';
const EMBER = '#F77F2E';
const TEXT = '#E8EAE6';
const TEXT_DIM = '#8A9A91';

const PRAYERS = [
  { en: 'Fajr',    ar: 'الفجر',  time: '05:42', state: 'done' },
  { en: 'Sunrise', ar: 'الشروق', time: '06:58', state: 'sunrise' },
  { en: 'Dhuhr',   ar: 'الظهر',  time: '12:18', state: 'done' },
  { en: 'Asr',     ar: 'العصر',  time: '15:31', state: 'now' },
  { en: 'Maghrib', ar: 'المغرب', time: '18:04', state: 'upcoming' },
  { en: 'Isha',    ar: 'العشاء', time: '19:32', state: 'upcoming' },
];

function Rosebud({ filled, partial }: { filled?: boolean; partial?: boolean }) {
  return (
    <div style={{
      width: 12, height: 12, borderRadius: '50%',
      background: filled ? GOLD : (partial ? 'rgba(212,160,23,0.4)' : BORDER),
      border: `1px solid ${filled ? 'rgba(212,160,23,0.7)' : BORDER}`,
      boxShadow: filled ? `0 0 6px rgba(212,160,23,0.6)` : 'none',
      position: 'relative',
    }}>
      {filled && <div style={{ position: 'absolute', width: 3, height: 3, borderRadius: '50%', background: '#FFEEC2', top: 2.5, left: 3.5 }} />}
    </div>
  );
}

export function LivingDay() {
  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: 'Inter, system-ui, sans-serif' }} className="pb-12">
      {/* ── Top bar ── */}
      <div style={{ padding: '50px 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: SURFACE, border: `1px solid ${BORDER}` }}>
          <MapPin size={12} color={GOLD} />
          <span style={{ fontSize: 11, fontWeight: 600, color: TEXT }}>Karachi</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: TEXT_DIM }}>2 Shawwāl 1447</span>
          <button style={{ padding: 8, borderRadius: 999, background: SURFACE, border: `1px solid ${BORDER}` }}>
            <Bell size={12} color={GOLD} />
          </button>
        </div>
      </div>

      {/* ── NOW card — current prayer with arc + countdown ── */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1A2E26 0%, #16271F 100%)',
          border: `1px solid ${BORDER}`,
          borderRadius: 22, padding: 18, position: 'relative', overflow: 'hidden',
        }}>
          {/* ambient glow */}
          <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,169,92,0.18) 0%, transparent 70%)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 9, letterSpacing: 2, color: GOLD, fontWeight: 700 }}>● NOW · IN PROGRESS</span>
            <span style={{ fontSize: 10, color: TEXT_DIM }}>15:24</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Mini arc */}
            <div style={{ position: 'relative', width: 92, height: 92, flexShrink: 0 }}>
              <svg width="92" height="92" viewBox="0 0 92 92">
                <defs>
                  <linearGradient id="arcRing" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#E8A95C" />
                    <stop offset="100%" stopColor={GOLD} />
                  </linearGradient>
                </defs>
                <circle cx="46" cy="46" r="38" fill="none" stroke={BORDER} strokeWidth="6" />
                <circle
                  cx="46" cy="46" r="38" fill="none"
                  stroke="url(#arcRing)" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${0.62 * 2 * Math.PI * 38} ${2 * Math.PI * 38}`}
                  transform="rotate(-90 46 46)"
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, letterSpacing: -0.5 }}>62%</div>
                <div style={{ fontSize: 8, letterSpacing: 1, color: TEXT_DIM, fontWeight: 600 }}>WINDOW</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: TEXT, letterSpacing: -0.5 }}>Asr</span>
                <span style={{ fontSize: 18, color: '#E8A95C', fontFamily: 'serif' }}>العصر</span>
              </div>
              <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 2 }}>Started 15:31 · ends 18:04</div>
              <div style={{ marginTop: 10, padding: '6px 10px', background: 'rgba(232,169,92,0.12)', borderRadius: 8, display: 'inline-block' }}>
                <span style={{ fontSize: 11, color: '#E8A95C', fontWeight: 600 }}>2h 40m until Maghrib</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Daily Reflection — promoted to second focal point ── */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 10, letterSpacing: 2, color: TEXT_DIM, fontWeight: 600 }}>DAILY REFLECTION</span>
          <span style={{ fontSize: 10, color: GOLD, fontFamily: 'serif' }}>تأمل اليوم</span>
        </div>
        <div style={{
          background: SURFACE, border: `1px solid ${BORDER}`,
          borderRadius: 22, padding: '20px 18px', position: 'relative', overflow: 'hidden',
        }}>
          {/* parchment top wash */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(212,160,23,0.08), transparent 50%)' }} />

          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.25)' }} />
              <span style={{ color: GOLD, fontSize: 14, fontFamily: 'serif' }}>﷽</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.25)' }} />
            </div>
            <div style={{
              fontFamily: '"Amiri Quran", serif',
              fontSize: 22, lineHeight: 2, textAlign: 'right', color: TEXT, marginBottom: 12,
              direction: 'rtl' as const,
            }}>
              وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: '#C5CFC8', fontStyle: 'italic', textAlign: 'center', marginBottom: 12, padding: '0 8px' }}>
              "And whoever fears Allah — He will make for him a way out."
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
              <span style={{ fontSize: 11, color: GOLD, fontWeight: 600 }}>Aṭ-Ṭalāq · 65:2</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={{ padding: '5px 10px', borderRadius: 8, background: GOLD_SOFT, border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BookOpen size={11} color={GOLD} />
                  <span style={{ fontSize: 10, color: GOLD, fontWeight: 600 }}>Read</span>
                </button>
                <button style={{ padding: 6, borderRadius: 8, background: GOLD_SOFT, border: 'none' }}><Share2 size={11} color={GOLD} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Today's prayers list with rosebud progress ── */}
      <div style={{ padding: '0 20px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 10, letterSpacing: 2, color: TEXT_DIM, fontWeight: 600 }}>TODAY'S PRAYERS</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Rosebud filled />
            <Rosebud filled />
            <Rosebud partial />
            <Rosebud />
            <Rosebud />
            <span style={{ fontSize: 10, color: TEXT_DIM, marginLeft: 4, fontWeight: 600 }}>2 / 5</span>
          </div>
        </div>
        <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 4 }}>
          {PRAYERS.map((p, i) => {
            const isNow = p.state === 'now';
            const isDone = p.state === 'done';
            const isSunrise = p.state === 'sunrise';
            return (
              <div key={p.en} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 12px',
                borderTop: i > 0 ? `1px solid rgba(31,58,48,0.5)` : 'none',
                background: isNow ? GOLD_SOFT : 'transparent',
                borderRadius: 12,
                opacity: isSunrise ? 0.6 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {isDone ? <Rosebud filled />
                    : isNow ? <div style={{ width: 12, height: 12, borderRadius: '50%', background: GOLD, animation: 'pulse 2s infinite' }} />
                    : isSunrise ? <div style={{ width: 12, height: 12, borderRadius: '50%', border: `1px dashed ${TEXT_DIM}` }} />
                    : <Rosebud />}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: isNow ? 700 : 600, color: isNow ? GOLD : TEXT, fontStyle: isSunrise ? 'italic' : 'normal' }}>
                        {p.en}
                      </span>
                      <span style={{ fontSize: 11, color: TEXT_DIM, fontFamily: 'serif' }}>{p.ar}</span>
                    </div>
                    {isNow && <div style={{ fontSize: 9, color: GOLD, fontWeight: 600, marginTop: 1, letterSpacing: 0.5 }}>● IN PROGRESS</div>}
                    {isSunrise && <div style={{ fontSize: 9, color: TEXT_DIM, fontStyle: 'italic', marginTop: 1 }}>not a prayer · for reference</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: isNow ? GOLD : TEXT_DIM, fontVariantNumeric: 'tabular-nums' }}>{p.time}</span>
                  {!isSunrise && <Bell size={12} color={isDone || isNow ? GOLD : TEXT_DIM} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div style={{ padding: '0 20px 14px', display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <Compass size={18} color={GOLD} />
          <span style={{ fontSize: 11, color: TEXT, fontWeight: 600 }}>Qibla</span>
        </div>
        <div style={{ flex: 1, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <BookMarked size={18} color={GOLD} />
          <span style={{ fontSize: 11, color: TEXT, fontWeight: 600 }}>Quran</span>
        </div>
        <div style={{ flex: 1, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <Sparkles size={18} color={GOLD} />
          <span style={{ fontSize: 11, color: TEXT, fontWeight: 600 }}>Adhkar</span>
        </div>
      </div>

      {/* Footer ornament */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '10px 60px' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.2)' }} />
        <span style={{ color: GOLD, fontSize: 14, fontFamily: 'serif' }}>﷽</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.2)' }} />
      </div>
    </div>
  );
}

export default LivingDay;
