import React from 'react';
import { MapPin, Bell, BookOpen, Share2, Moon, BookMarked, Sparkles, Check } from 'lucide-react';

const BG = '#0A1612';
const SURFACE = '#10231C';
const BORDER = '#1F3A30';
const GOLD = '#D4A017';
const GOLD_SOFT = 'rgba(212,160,23,0.14)';
const TEXT = '#E8EAE6';
const TEXT_DIM = '#8A9A91';

/* Night spans Maghrib (sunset 18:01) → Sunrise (06:58 next day) = 777 min */
const SUNSET_MIN  = 18 * 60 + 1;
const NEXT_SUNRISE_MIN = 24 * 60 + (6 * 60 + 58);   // 30:58 = 06:58 next day
const NIGHT_TOTAL = NEXT_SUNRISE_MIN - SUNSET_MIN;  // 777

const MAGHRIB_MIN     = 18 * 60 + 4;
const ISHA_MIN        = 19 * 60 + 32;
const LAST_THIRD_MIN  = 24 * 60 + (1 * 60 + 49);    // 25:49 → 01:49 next day
const FAJR_NEXT_MIN   = 24 * 60 + (5 * 60 + 42);    // 29:42 → 05:42 next day

/* Map an absolute "minutes from start of today" to night arc position 0..1.
   Night spans 18:01 today → 30:58 (06:58 tomorrow). Times before 18:01 are
   assumed to belong to the next day's early morning. */
function nightPct(min: number) {
  const m = min < SUNSET_MIN ? min + 24 * 60 : min;
  return Math.max(0, Math.min(1, (m - SUNSET_MIN) / NIGHT_TOTAL));
}

type Status = 'past' | 'now' | 'next' | 'upcoming';

export interface NightScene {
  key: 'isha' | 'fajr';
  nowAbsMin: number;         // minutes from start of today (use +24h for early morning)
  nowLabel: string;
  dateLabel: string;
  /* Statuses */
  ishaStatus: Status;
  fajrStatus: Status;
  /* Now / next card */
  nowPrayer: { en: string; ar: string; sub: string };
  next: { label: string; en: string; ar: string; at: string; h: number; m: number };
  /* Daytime prayer summary chip strip */
  dayDone: { fajr: boolean; dhuhr: boolean; asr: boolean; maghrib: boolean };
  /* Bar */
  bar: { left: string; right: string; centre: string; pct: number };
  /* Quick actions */
  quickActions: Array<{ label: string }>;
}

export const ISHA_NIGHT_SCENE: NightScene = {
  key: 'isha',
  nowAbsMin: 21 * 60 + 30,
  nowLabel: '21:30',
  dateLabel: '2 SHAWWĀL · 1447',
  ishaStatus: 'now',
  fajrStatus: 'upcoming',
  nowPrayer: { en: 'Isha', ar: 'العشاء', sub: 'started 19:32 · last 1/3 of night begins 01:49' },
  next: { label: 'UNTIL FAJR', en: 'Fajr', ar: 'الفجر', at: '05:42', h: 8, m: 12 },
  dayDone: { fajr: true, dhuhr: true, asr: true, maghrib: true },
  bar: { left: '18:01', right: '06:58', centre: 'NIGHT · 27% ELAPSED', pct: 0.27 },
  quickActions: [{ label: 'Tahajjud' }, { label: 'Quran' }, { label: 'Adhkar' }],
};

export const FAJR_NIGHT_SCENE: NightScene = {
  key: 'fajr',
  nowAbsMin: 24 * 60 + (5 * 60 + 55),    // 05:55 next day
  nowLabel: '05:55',
  dateLabel: '3 SHAWWĀL · 1447',
  ishaStatus: 'past',
  fajrStatus: 'now',
  nowPrayer: { en: 'Fajr', ar: 'الفجر', sub: 'started 05:42 · ends at sunrise 06:58' },
  next: { label: 'UNTIL SUNRISE', en: 'Sunrise', ar: 'الشروق', at: '06:58', h: 1, m: 3 },
  dayDone: { fajr: false, dhuhr: false, asr: false, maghrib: false },   // new day, nothing prayed yet (Isha was last night)
  bar: { left: '18:01', right: '06:58', centre: 'NIGHT · 91% · DAWN APPROACHING', pct: 0.91 },
  quickActions: [{ label: 'Qibla' }, { label: 'Quran' }, { label: 'Adhkar' }],
};

/* Arc anchor points along night dome */
const ARC_ANCHORS = [
  { id: 'maghrib',    pct: nightPct(MAGHRIB_MIN),     label: 'MAGHRIB',     time: '18:04', kind: 'gateway' as const, sub: 'sunset · night begins' },
  { id: 'isha',       pct: nightPct(ISHA_MIN),        label: 'ISHA',        time: '19:32', kind: 'prayer'  as const, ar: 'العشاء' },
  { id: 'lastThird',  pct: nightPct(LAST_THIRD_MIN),  label: 'LAST 1/3',    time: '01:49', kind: 'window'  as const, sub: 'tahajjud window' },
  { id: 'fajr',       pct: nightPct(FAJR_NEXT_MIN),   label: 'FAJR',        time: '05:42', kind: 'prayer'  as const, ar: 'الفجر' },
  { id: 'sunrise',    pct: 1,                         label: 'SUNRISE',     time: '06:58', kind: 'gateway' as const, sub: 'fajr ends' },
];

export function CelestialDomeNightScene({ scene }: { scene: NightScene }) {
  const W = 390;
  const HERO_H = 410;
  const cx = W / 2;
  const cy = 280;
  const R = 138;

  // Map pct to angle on the dome arc (left horizon = -180°, zenith = -90°, right horizon = 0°)
  const pctToDeg = (pct: number) => -180 + pct * 180;

  const moonPct = nightPct(scene.nowAbsMin);
  const moonDeg = pctToDeg(moonPct);
  const moonRad = (moonDeg * Math.PI) / 180;
  const moonX = cx + R * Math.cos(moonRad);
  const moonY = cy + R * Math.sin(moonRad);

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: 'Inter, system-ui, sans-serif' }} className="pb-12">

      {/* ────────  NIGHT DOME HERO  ──────── */}
      <div style={{ position: 'relative', height: HERO_H, overflow: 'hidden' }}>
        {/* Night sky — deep midnight; for Fajr hint of indigo→purple at the right (east) edge */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #02030E 0%, #060820 50%, #0A0E2A 90%, #101638 100%)' }} />
        {scene.key === 'fajr' && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(110deg, transparent 55%, rgba(74,42,62,0.55) 80%, rgba(180,90,80,0.35) 100%)',
            mixBlendMode: 'screen' as const,
          }} />
        )}

        {/* Dense star field */}
        {[...Array(60)].map((_, i) => {
          const left = ((i * 47) % W);
          const top = 10 + (i * 13.7) % (cy - 30);
          const size = (i % 7 === 0) ? 2.4 : (i % 3 === 0 ? 1.8 : 1.3);
          const opacity = 0.25 + ((i % 5) / 5) * 0.6;
          return (
            <div key={i} style={{
              position: 'absolute', top, left,
              width: size, height: size, borderRadius: '50%',
              background: `rgba(220,232,255,${opacity})`,
            }} />
          );
        })}

        {/* Top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '50px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(10px)' }}>
            <MapPin size={11} color="#C9D4F0" />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#C9D4F0', letterSpacing: 0.3 }}>Karachi</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: 'rgba(201,212,240,0.8)', fontWeight: 500, letterSpacing: 1 }}>{scene.dateLabel}</span>
            <button style={{ padding: 7, borderRadius: 999, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(10px)', border: 'none' }}>
              <Bell size={12} color="#C9D4F0" />
            </button>
          </div>
        </div>

        {/* Dome SVG */}
        <svg width={W} height={HERO_H} style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <linearGradient id="nightArcGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(201,212,240,0.18)" />
              <stop offset="50%" stopColor="rgba(201,212,240,0.5)" />
              <stop offset="100%" stopColor="rgba(201,212,240,0.18)" />
            </linearGradient>
            <radialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#E8EEFF" stopOpacity="0.6" />
              <stop offset="55%" stopColor="#A8B4DC" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#A8B4DC" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Dome arc */}
          <path
            d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
            fill="none" stroke="url(#nightArcGrad)" strokeWidth="1.4" strokeDasharray="2 5"
          />

          {/* Horizon */}
          <line x1={16} y1={cy} x2={W - 16} y2={cy} stroke="rgba(201,212,240,0.32)" strokeWidth="1" />

          {/* Arc anchors: Maghrib · Isha · Last 1/3 · Fajr · Sunrise */}
          {ARC_ANCHORS.map((a) => {
            const deg = pctToDeg(a.pct);
            const r = (deg * Math.PI) / 180;
            const x = cx + R * Math.cos(r);
            const y = cy + R * Math.sin(r);

            const isPrayer = a.kind === 'prayer';
            const status: Status =
              a.id === 'isha' ? scene.ishaStatus
              : a.id === 'fajr' ? scene.fajrStatus
              : a.id === 'maghrib' ? 'past'
              : a.id === 'sunrise' ? (scene.fajrStatus === 'now' ? 'next' : 'upcoming')
              : 'upcoming';
            const past = status === 'past';
            const now = status === 'now';
            const next = status === 'next';

            const moonOnMe = Math.abs(moonDeg - deg) < 8;
            const above = moonOnMe || (deg > -100 && deg < -80); // zenith-ish goes above
            const labelDy = above ? -22 : 22;
            const timeDy = above ? -10 : 33;
            const subDy = above ? -34 : 44;
            const anchor: 'start' | 'middle' | 'end' = deg <= -120 ? 'start' : (deg >= -10 ? 'end' : 'middle');
            const dx = anchor === 'start' ? 7 : (anchor === 'end' ? -7 : 0);

            const dim = !isPrayer ? 0.7 : 1;

            // Marker style
            const markerColor = isPrayer ? '#FFE4B5' : 'rgba(201,212,240,0.7)';
            const markerR = now ? 7 : (isPrayer ? 5 : 3);

            return (
              <g key={a.id} opacity={past ? 0.55 : dim}>
                <circle cx={x} cy={y} r={markerR}
                  fill={now ? markerColor : (past ? markerColor : 'transparent')}
                  stroke={markerColor} strokeWidth={now ? 2 : 1.5} />
                {past && isPrayer && <text x={x} y={y + 2.5} textAnchor="middle" fill="#0A0E2A" style={{ fontSize: 7, fontWeight: 900 }}>✓</text>}
                {now && <circle cx={x} cy={y} r="11" fill="none" stroke={markerColor} strokeWidth="1" opacity="0.45" />}
                {next && <circle cx={x} cy={y} r="9" fill="none" stroke={markerColor} strokeWidth="1" opacity="0.6" strokeDasharray="2 2" />}

                <text x={x + dx} y={y + labelDy} textAnchor={anchor}
                  fill={isPrayer ? 'rgba(255,228,181,0.95)' : 'rgba(201,212,240,0.85)'}
                  style={{ fontSize: isPrayer ? 9.5 : 8.5, fontWeight: 700, letterSpacing: 1.3 }}>
                  {a.label}
                </text>
                <text x={x + dx} y={y + timeDy} textAnchor={anchor}
                  fill={isPrayer ? 'rgba(255,228,181,0.7)' : 'rgba(201,212,240,0.6)'}
                  style={{ fontSize: 9, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                  {a.time}
                </text>
                {a.sub && (
                  <text x={x + dx} y={y + subDy} textAnchor={anchor} fill="rgba(201,212,240,0.42)"
                    style={{ fontSize: 7.5, fontWeight: 500, fontStyle: 'italic', letterSpacing: 0.4 }}>
                    {a.sub}
                  </text>
                )}
              </g>
            );
          })}

          {/* THE MOON — your position in the night */}
          <circle cx={moonX} cy={moonY} r="32" fill="url(#moonGlow)" />
          <circle cx={moonX} cy={moonY} r="13" fill="#E8EEFF" />
          {/* Crescent cut — slight, indicates phase (decorative, not astronomical) */}
          <circle cx={moonX + (scene.key === 'fajr' ? 5 : -4)} cy={moonY - 1.5} r="11" fill="#060820" />
          <text x={moonX + 22} y={moonY + 3} fill="#E8EEFF" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, fontVariantNumeric: 'tabular-nums' }}>
            {scene.nowLabel}
          </text>
        </svg>
      </div>

      {/* ────────  Night progress hairline  ──────── */}
      <div style={{ padding: '10px 22px 16px', background: 'linear-gradient(180deg, #101638 0%, rgba(10,22,18,0) 100%)' }}>
        <div style={{ position: 'relative', height: 2, background: 'rgba(201,212,240,0.16)', borderRadius: 1 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: 2, width: `${scene.bar.pct * 100}%`, background: 'linear-gradient(90deg, rgba(201,212,240,0.35), #C9D4F0)', borderRadius: 1 }} />
          <div style={{
            position: 'absolute', left: `${scene.bar.pct * 100}%`, top: -3, width: 8, height: 8, borderRadius: '50%',
            background: '#C9D4F0', transform: 'translateX(-50%)',
            boxShadow: '0 0 10px rgba(201,212,240,0.85)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, color: 'rgba(201,212,240,0.6)', fontWeight: 600, letterSpacing: 1 }}>
          <span>{scene.bar.left}</span>
          <span>{scene.bar.centre}</span>
          <span>{scene.bar.right}</span>
        </div>
      </div>

      {/* ────────  NOW / NEXT  ──────── */}
      <div style={{ padding: '6px 20px 14px' }}>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 22, padding: '16px 16px 14px', position: 'relative', overflow: 'hidden', boxShadow: '0 12px 28px rgba(0,0,0,0.4)' }}>
          <div style={{ position: 'absolute', right: -50, top: -50, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,160,23,0.13), transparent 70%)' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: GOLD, fontWeight: 700 }}>● NOW · IN PROGRESS</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: TEXT, letterSpacing: -0.3 }}>{scene.nowPrayer.en}</span>
                <span style={{ fontSize: 16, color: GOLD, fontFamily: 'serif' }}>{scene.nowPrayer.ar}</span>
              </div>
              <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 2 }}>{scene.nowPrayer.sub}</div>
            </div>
            <button style={{ padding: '8px 12px', borderRadius: 12, background: GOLD, border: 'none', display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 4px 12px rgba(212,160,23,0.3)' }}>
              <Check size={13} color="#0A1612" strokeWidth={3} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#0A1612', letterSpacing: 0.3 }}>Mark prayed</span>
            </button>
          </div>

          <div style={{ height: 1, background: BORDER, margin: '14px 0 12px' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: TEXT_DIM, fontWeight: 700 }}>{scene.next.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: 11, color: TEXT_DIM }}>at</span>
                <span style={{ fontSize: 14, color: TEXT, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{scene.next.at}</span>
                <span style={{ fontSize: 11, color: TEXT_DIM, fontFamily: 'serif' }}>· {scene.next.ar}</span>
              </div>
            </div>
            <div style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 38, fontWeight: 400, letterSpacing: -1,
              color: TEXT, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
            }}>
              {scene.next.h}<span style={{ color: GOLD, fontSize: 22, padding: '0 4px 0 2px' }}>h</span>{scene.next.m.toString().padStart(2, '0')}<span style={{ color: GOLD, fontSize: 22, padding: '0 0 0 2px' }}>m</span>
            </div>
          </div>
        </div>
      </div>

      {/* ────────  Earlier today chip strip — keeps Dhuhr/Asr/Maghrib accessible  ──────── */}
      <div style={{ padding: '0 20px 14px' }}>
        <div style={{
          background: 'rgba(16,35,28,0.55)', border: `1px solid ${BORDER}`, borderRadius: 14,
          padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 9, letterSpacing: 1.4, color: TEXT_DIM, fontWeight: 700, marginRight: 4 }}>
            {scene.key === 'fajr' ? 'TODAY · AHEAD' : 'EARLIER TODAY'}
          </span>
          {([
            ['fajr',    'Fajr',    '05:42'],
            ['dhuhr',   'Dhuhr',   '12:18'],
            ['asr',     'Asr',     '15:31'],
            ['maghrib', 'Maghrib', '18:04'],
          ] as const).map(([id, name, time]) => {
            const done = scene.dayDone[id as 'fajr' | 'dhuhr' | 'asr' | 'maghrib'];
            return (
              <div key={id} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '4px 2px', borderRadius: 10,
                background: done ? 'rgba(212,160,23,0.08)' : 'transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  {done ? (
                    <Check size={9} color={GOLD} strokeWidth={3} />
                  ) : (
                    <div style={{ width: 7, height: 7, borderRadius: '50%', border: `1px solid ${BORDER}` }} />
                  )}
                  <span style={{ fontSize: 10, fontWeight: 600, color: done ? TEXT : TEXT_DIM }}>{name}</span>
                </div>
                <span style={{ fontSize: 8.5, color: TEXT_DIM, fontVariantNumeric: 'tabular-nums', letterSpacing: 0.3 }}>{time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ────────  Verse of the day  ──────── */}
      <div style={{ padding: '0 20px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 10, letterSpacing: 2, color: TEXT_DIM, fontWeight: 700 }}>VERSE OF THE NIGHT</span>
          <span style={{ fontSize: 10, color: GOLD, fontFamily: 'serif' }}>آية الليلة</span>
        </div>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 22, padding: '20px 18px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(212,160,23,0.07), transparent 55%)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.25)' }} />
              <span style={{ color: GOLD, fontSize: 14, fontFamily: 'serif' }}>﷽</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.25)' }} />
            </div>
            <div style={{ fontFamily: '"Amiri Quran", serif', fontSize: 22, lineHeight: 2, textAlign: 'right', color: TEXT, marginBottom: 12, direction: 'rtl' as const }}>
              {scene.key === 'isha'
                ? 'يَا أَيُّهَا ٱلْمُزَّمِّلُ ۝ قُمِ ٱللَّيْلَ إِلَّا قَلِيلًا'
                : 'وَمَن يَتَّقِ ٱللَّهَ يَجْعَل لَّهُۥ مَخْرَجًا'}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: '#C5CFC8', fontStyle: 'italic', textAlign: 'center', marginBottom: 14, padding: '0 6px' }}>
              {scene.key === 'isha'
                ? '"O you who wraps himself [in clothing], arise [to pray] the night, except a little."'
                : '"And whoever fears Allah — He will make for him a way out."'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
              <span style={{ fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: 1 }}>
                {scene.key === 'isha' ? 'SŪRAH AL-MUZZAMMIL · 73:1-2' : 'SŪRAH AṬ-ṬALĀQ · 65:2'}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={{ padding: '6px 10px', borderRadius: 8, background: GOLD_SOFT, border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BookOpen size={11} color={GOLD} />
                  <span style={{ fontSize: 10, color: GOLD, fontWeight: 700 }}>Read</span>
                </button>
                <button style={{ padding: 7, borderRadius: 8, background: GOLD_SOFT, border: 'none' }}>
                  <Share2 size={11} color={GOLD} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ────────  Quick actions  ──────── */}
      <div style={{ padding: '0 20px 14px', display: 'flex', gap: 10 }}>
        {scene.quickActions.map(({ label }) => {
          const Icon = label === 'Tahajjud' ? Moon : label === 'Quran' ? BookMarked : label === 'Adhkar' ? Sparkles : Moon;
          return (
            <div key={label} style={{ flex: 1, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '13px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Icon size={18} color={GOLD} />
              <span style={{ fontSize: 11, color: TEXT, fontWeight: 600 }}>{label}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '8px 60px 14px' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.22)' }} />
        <span style={{ color: GOLD, fontSize: 13, fontFamily: 'serif' }}>۞</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(212,160,23,0.22)' }} />
      </div>
    </div>
  );
}

export function CelestialDomeNight() {
  return <CelestialDomeNightScene scene={ISHA_NIGHT_SCENE} />;
}

export default CelestialDomeNight;
