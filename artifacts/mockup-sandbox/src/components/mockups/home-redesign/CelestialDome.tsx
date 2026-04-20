import React from 'react';
import { MapPin, Bell, Share2, BookOpen, ChevronRight, Sparkles } from 'lucide-react';

const BG = '#0A1612';
const SURFACE = '#10231C';
const BORDER = '#1F3A30';
const GOLD = '#D4A017';
const GOLD_SOFT = 'rgba(212,160,23,0.14)';
const TEXT = '#E8EAE6';
const TEXT_DIM = '#8A9A91';

const PRAYERS = [
  { id: 'fajr',    en: 'Fajr',    ar: 'الفجر',  time: '05:42', angle: -180, color: '#7B6FD4' },
  { id: 'dhuhr',   en: 'Dhuhr',   ar: 'الظهر',  time: '12:18', angle: -90,  color: '#5BA3D9' },
  { id: 'asr',     en: 'Asr',     ar: 'العصر',  time: '15:31', angle: -45,  color: '#E8A95C' },
  { id: 'maghrib', en: 'Maghrib', ar: 'المغرب', time: '18:04', angle: 0,    color: '#E55B3C' },
  { id: 'isha',    en: 'Isha',    ar: 'العشاء', time: '19:32', angle: 30,   color: '#3D407A' },
];

const ACTIVE_IDX = 2; // Asr

export function CelestialDome() {
  // Dome geometry
  const W = 390;
  const cx = W / 2;
  const cy = 300;
  const R = 150;

  // Sun position along arc — interpolate smoothly between Asr and Maghrib (60% through)
  const t = 0.62;
  const startAngle = PRAYERS[ACTIVE_IDX].angle;
  const endAngle = PRAYERS[ACTIVE_IDX + 1].angle;
  const sunAngle = startAngle + (endAngle - startAngle) * t;
  const sunRad = (sunAngle * Math.PI) / 180;
  const sunX = cx + R * Math.cos(sunRad);
  const sunY = cy + R * Math.sin(sunRad);

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: 'Inter, system-ui, sans-serif' }} className="pb-12">
      {/* ── Sky dome hero ── */}
      <div style={{ position: 'relative', height: 380, overflow: 'hidden' }}>
        {/* Sky gradient — afternoon amber */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, #2A1F2C 0%, #4D2E33 35%, #8B4A2F 70%, #C66A38 100%)',
        }} />
        {/* Stars hint top */}
        {[...Array(18)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: Math.random() * 80,
            left: Math.random() * W,
            width: 1.5, height: 1.5, borderRadius: '50%',
            background: 'rgba(255,240,210,0.4)',
          }} />
        ))}

        {/* Top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '50px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)' }}>
            <MapPin size={12} color="#FFE4B5" />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#FFE4B5' }}>Karachi</span>
          </div>
          <div style={{ padding: 8, borderRadius: 999, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)' }}>
            <Bell size={14} color="#FFE4B5" />
          </div>
        </div>

        {/* The dome arc */}
        <svg width={W} height={380} style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,228,181,0.15)" />
              <stop offset="50%" stopColor="rgba(255,228,181,0.45)" />
              <stop offset="100%" stopColor="rgba(255,228,181,0.15)" />
            </linearGradient>
            <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#FFE4B5" stopOpacity="1" />
              <stop offset="60%" stopColor="#FFB347" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFB347" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Dotted dome */}
          <path
            d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
            fill="none"
            stroke="url(#arcGrad)"
            strokeWidth="1.5"
            strokeDasharray="2 5"
          />
          {/* Horizon line */}
          <line x1={20} y1={cy} x2={W - 20} y2={cy} stroke="rgba(255,228,181,0.2)" strokeWidth="1" />
          {/* Prayer markers */}
          {PRAYERS.map((p, i) => {
            const r = (p.angle * Math.PI) / 180;
            const x = cx + R * Math.cos(r);
            const y = cy + R * Math.sin(r);
            const past = i < ACTIVE_IDX;
            const active = i === ACTIVE_IDX;
            return (
              <g key={p.id}>
                <circle
                  cx={x} cy={y} r={active ? 9 : 6}
                  fill={active ? p.color : (past ? p.color : 'transparent')}
                  stroke={active ? '#FFE4B5' : p.color}
                  strokeWidth={active ? 2 : 1.5}
                  opacity={past || active ? 1 : 0.7}
                />
                <text
                  x={x} y={y + (p.angle === 0 ? 24 : (p.angle === -90 ? -14 : 22))}
                  textAnchor={p.angle < -90 ? 'start' : (p.angle > 0 ? 'end' : 'middle')}
                  dx={p.angle < -90 ? 8 : (p.angle > 0 ? -8 : 0)}
                  fill="rgba(255,228,181,0.85)"
                  style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1 }}
                >
                  {p.en.toUpperCase()}
                </text>
                <text
                  x={x} y={y + (p.angle === 0 ? 36 : (p.angle === -90 ? -2 : 34))}
                  textAnchor={p.angle < -90 ? 'start' : (p.angle > 0 ? 'end' : 'middle')}
                  dx={p.angle < -90 ? 8 : (p.angle > 0 ? -8 : 0)}
                  fill="rgba(255,228,181,0.55)"
                  style={{ fontSize: 9, fontWeight: 500 }}
                >
                  {p.time}
                </text>
              </g>
            );
          })}
          {/* Sun glow */}
          <circle cx={sunX} cy={sunY} r="28" fill="url(#sunGlow)" />
          <circle cx={sunX} cy={sunY} r="10" fill="#FFE4B5" />
        </svg>

        {/* Centre time */}
        <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 38, fontWeight: 200, letterSpacing: -1, color: '#FFE4B5', fontVariantNumeric: 'tabular-nums' }}>15:24</div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, color: 'rgba(255,228,181,0.7)', marginTop: 2 }}>SATURDAY · 2 SHAWWĀL 1447</div>
        </div>
      </div>

      {/* ── Next prayer countdown ribbon ── */}
      <div style={{ padding: '0 20px', marginTop: -20, position: 'relative', zIndex: 2 }}>
        <div style={{
          background: SURFACE, borderRadius: 18, border: `1px solid ${BORDER}`,
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: '0 12px 28px rgba(0,0,0,0.35)',
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: GOLD_SOFT, border: `1px solid rgba(212,160,23,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color={GOLD} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: TEXT_DIM, fontWeight: 600 }}>NEXT PRAYER</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: TEXT }}>Maghrib</span>
              <span style={{ fontSize: 13, color: GOLD, fontFamily: 'serif' }}>المغرب</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: GOLD, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5 }}>2h 40m</div>
            <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 1 }}>at 18:04</div>
          </div>
        </div>
      </div>

      {/* ── Daily Ayah — promoted to second focal ── */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 10, letterSpacing: 2, color: TEXT_DIM, fontWeight: 600 }}>VERSE OF THE DAY</span>
          <span style={{ fontSize: 10, color: GOLD, fontFamily: 'serif' }}>آية اليوم</span>
        </div>
        <div style={{
          background: SURFACE, border: `1px solid ${BORDER}`,
          borderRadius: 18, padding: '20px 18px',
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(212,160,23,0.07) 0%, transparent 60%)',
        }}>
          {/* ornament */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.25)' }} />
            <div style={{ color: GOLD, fontSize: 16, fontFamily: 'serif' }}>﷽</div>
            <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.25)' }} />
          </div>
          <div style={{
            fontFamily: '"Amiri Quran", serif',
            fontSize: 22, lineHeight: 1.9, textAlign: 'right', color: TEXT, marginBottom: 14,
            direction: 'rtl' as const,
          }}>
            وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: TEXT_DIM, fontStyle: 'italic', textAlign: 'center', marginBottom: 14 }}>
            "And whoever fears Allah — He will make for him a way out."
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
            <span style={{ fontSize: 11, color: GOLD, fontWeight: 600 }}>Surah Aṭ-Ṭalāq · 65:2</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ padding: 6, borderRadius: 8, background: GOLD_SOFT, border: 'none' }}><BookOpen size={12} color={GOLD} /></button>
              <button style={{ padding: 6, borderRadius: 8, background: GOLD_SOFT, border: 'none' }}><Share2 size={12} color={GOLD} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Compact prayer strip (Sunrise included as separator) ── */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 10, letterSpacing: 2, color: TEXT_DIM, fontWeight: 600 }}>TODAY'S TIMES</span>
          <span style={{ fontSize: 10, color: TEXT_DIM }}>tap any to set bell</span>
        </div>
        <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 6 }}>
          {[
            { en: 'Fajr', ar: 'الفجر', time: '05:42', state: 'past' },
            { en: 'Sunrise', ar: 'الشروق', time: '06:58', state: 'past', sunrise: true },
            { en: 'Dhuhr', ar: 'الظهر', time: '12:18', state: 'past' },
            { en: 'Asr', ar: 'العصر', time: '15:31', state: 'now' },
            { en: 'Maghrib', ar: 'المغرب', time: '18:04', state: 'next' },
            { en: 'Isha', ar: 'العشاء', time: '19:32', state: 'upcoming' },
          ].map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: 10,
              background: p.state === 'now' ? GOLD_SOFT : 'transparent',
              borderTop: i > 0 ? `1px solid rgba(31,58,48,0.5)` : 'none',
              opacity: p.sunrise ? 0.55 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {p.state === 'now' && <div style={{ width: 5, height: 5, borderRadius: '50%', background: GOLD }} />}
                <span style={{ fontSize: 13, fontWeight: p.state === 'now' ? 700 : 500, color: p.state === 'now' ? GOLD : TEXT, fontStyle: p.sunrise ? 'italic' : 'normal' }}>{p.en}</span>
                <span style={{ fontSize: 11, color: TEXT_DIM, fontFamily: 'serif' }}>{p.ar}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: p.state === 'now' ? GOLD : TEXT_DIM, fontVariantNumeric: 'tabular-nums' }}>{p.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer ornament */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '8px 60px' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.2)' }} />
        <span style={{ color: GOLD, fontSize: 14, fontFamily: 'serif' }}>✦</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.2)' }} />
      </div>
    </div>
  );
}

export default CelestialDome;
