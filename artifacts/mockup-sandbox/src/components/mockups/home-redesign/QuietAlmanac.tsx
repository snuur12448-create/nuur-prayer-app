import React from 'react';
import { MapPin, Bell, BookOpen, Share2, Settings } from 'lucide-react';

const BG = '#0A1612';
const SURFACE = '#10231C';
const SURFACE_2 = '#0D1C17';
const BORDER = '#1F3A30';
const GOLD = '#D4A017';
const GOLD_SOFT = 'rgba(212,160,23,0.12)';
const TEXT = '#E8EAE6';
const TEXT_DIM = '#7A8B82';

const PRAYERS = [
  { en: 'Fajr',    ar: 'الفجر',  time: '05:42', state: 'past' },
  { en: 'Sunrise', ar: 'الشروق', time: '06:58', state: 'past', sunrise: true },
  { en: 'Dhuhr',   ar: 'الظهر',  time: '12:18', state: 'past' },
  { en: 'Asr',     ar: 'العصر',  time: '15:31', state: 'now' },
  { en: 'Maghrib', ar: 'المغرب', time: '18:04', state: 'next' },
  { en: 'Isha',    ar: 'العشاء', time: '19:32', state: 'upcoming' },
];

export function QuietAlmanac() {
  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: 'Inter, system-ui, sans-serif' }} className="pb-12">
      {/* ── Top thin bar ── */}
      <div style={{ paddingTop: 50, padding: '50px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <MapPin size={11} color={TEXT_DIM} />
          <span style={{ fontSize: 11, color: TEXT_DIM, fontWeight: 500 }}>Karachi · Pakistan</span>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <Bell size={14} color={TEXT_DIM} />
          <Settings size={14} color={TEXT_DIM} />
        </div>
      </div>

      {/* ── Eyebrow date ── */}
      <div style={{ padding: '32px 20px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: GOLD, fontWeight: 600 }}>2 SHAWWĀL · 1447 AH</div>
        <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 4 }}>Saturday, 19 April 2026</div>
      </div>

      {/* ── Massive countdown — the only big thing ── */}
      <div style={{ padding: '36px 20px 8px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: TEXT_DIM, fontWeight: 600, marginBottom: 10 }}>UNTIL MAGHRIB</div>
        <div style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontSize: 84, fontWeight: 300, letterSpacing: -3,
          color: TEXT, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
        }}>
          2<span style={{ color: GOLD, fontSize: 50, fontWeight: 400, padding: '0 10px' }}>h</span>40<span style={{ color: GOLD, fontSize: 50, fontWeight: 400, padding: '0 0 0 10px' }}>m</span>
        </div>
        <div style={{ fontSize: 13, color: TEXT_DIM, marginTop: 14, fontStyle: 'italic' }}>
          Maghrib begins at 18:04 · sunset at 18:01
        </div>
        {/* Sunrise/sunset thin progress */}
        <div style={{ marginTop: 24, padding: '0 12px' }}>
          <div style={{ position: 'relative', height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: 2, width: '62%', background: `linear-gradient(90deg, ${GOLD}66, ${GOLD})`, borderRadius: 1 }} />
            <div style={{ position: 'absolute', left: '62%', top: -3, width: 8, height: 8, borderRadius: '50%', background: GOLD, transform: 'translateX(-50%)', boxShadow: `0 0 12px ${GOLD}` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, color: TEXT_DIM, fontWeight: 600, letterSpacing: 1 }}>
            <span>SUNRISE 06:58</span>
            <span>NOW 15:24</span>
            <span>SUNSET 18:01</span>
          </div>
        </div>
      </div>

      {/* ── Hairline divider with ornament ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '36px 60px 24px' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.2)' }} />
        <span style={{ color: GOLD, fontSize: 12, fontFamily: 'serif' }}>۞</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.2)' }} />
      </div>

      {/* ── Prayer ribbon — single column, scholarly ── */}
      <div style={{ padding: '0 20px' }}>
        {PRAYERS.map((p, i) => (
          <div
            key={p.en}
            style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              padding: '14px 4px',
              borderTop: i > 0 ? `1px solid rgba(31,58,48,0.7)` : 'none',
              opacity: p.sunrise ? 0.5 : 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flex: 1 }}>
              {p.state === 'now' && <div style={{ width: 4, height: 4, borderRadius: '50%', background: GOLD, transform: 'translateY(-2px)' }} />}
              {p.state !== 'now' && <div style={{ width: 4, height: 4 }} />}
              <span style={{
                fontSize: 16,
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontWeight: p.state === 'now' ? 700 : 500,
                color: p.state === 'now' ? GOLD : (p.state === 'past' ? TEXT_DIM : TEXT),
                fontStyle: p.sunrise ? 'italic' : 'normal',
                letterSpacing: 0.3,
              }}>{p.en}</span>
              <span style={{ fontSize: 14, color: TEXT_DIM, fontFamily: 'serif' }}>{p.ar}</span>
              {p.state === 'now' && (
                <span style={{
                  fontSize: 9, letterSpacing: 1.5, color: GOLD, fontWeight: 700,
                  border: `1px solid ${GOLD}`, padding: '2px 6px', borderRadius: 4, marginLeft: 4,
                }}>NOW</span>
              )}
              {p.state === 'next' && (
                <span style={{ fontSize: 10, color: TEXT_DIM, fontStyle: 'italic' }}>· next</span>
              )}
            </div>
            <span style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 17, fontWeight: 500,
              color: p.state === 'now' ? GOLD : (p.state === 'past' ? TEXT_DIM : TEXT),
              fontVariantNumeric: 'tabular-nums', letterSpacing: 0.5,
            }}>{p.time}</span>
          </div>
        ))}
      </div>

      {/* ── Hairline divider ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '32px 60px 24px' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.2)' }} />
        <span style={{ color: GOLD, fontSize: 12, fontFamily: 'serif' }}>۞</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.2)' }} />
      </div>

      {/* ── Featured Ayah parchment ── */}
      <div style={{ padding: '0 20px 30px' }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: TEXT_DIM, fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>
          TODAY'S REFLECTION
        </div>
        <div style={{
          background: SURFACE_2, border: `1px solid ${BORDER}`,
          borderRadius: 4, padding: '24px 22px',
          backgroundImage: 'linear-gradient(to bottom, rgba(212,160,23,0.04), transparent 30%)',
        }}>
          <div style={{
            fontFamily: '"Amiri Quran", serif',
            fontSize: 24, lineHeight: 2, textAlign: 'right', color: TEXT,
            direction: 'rtl' as const, marginBottom: 18,
          }}>
            وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: '#C5CFC8', fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', textAlign: 'center' }}>
            "And whoever fears Allah —<br />He will make for him a way out."
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: 10, letterSpacing: 2, color: GOLD, fontWeight: 600 }}>SŪRAH AṬ-ṬALĀQ · 65:2</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuietAlmanac;
