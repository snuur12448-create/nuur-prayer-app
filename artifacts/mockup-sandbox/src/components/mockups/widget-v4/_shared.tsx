import React from 'react';

export const T = {
  bg: '#0A1A0E',
  surface: '#111F14',
  surfaceElevated: '#172B1B',
  prayerCard: '#152A1A',
  border: '#1F3526',
  text: '#F0EDE5',
  textSecondary: '#8FA99A',
  textMute: 'rgba(240,237,229,0.45)',
  gold: '#F4C842',
  goldLight: '#F9D97A',
  goldGlow: 'rgba(244,200,66,0.13)',
  amber: '#F9A641',
  red: '#E55555',
  black: '#000000',
  white: '#FFFFFF',
};

export const F = {
  serif: 'Fraunces, "Cormorant Garamond", Georgia, ui-serif, serif',
  sans: 'Manrope, Inter, ui-sans-serif, system-ui, sans-serif',
  arabic: '"Amiri Quran", "KFGQPC Uthmanic Script HAFS", "Scheherazade New", serif',
};

export function FontLink() {
  return (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap"
    />
  );
}

export type Skin = 'day' | 'night';
export type State = 'normal' | 't10' | 't1' | 't30' | 't0';

export const DATA: Record<Skin, {
  prayerEn: string; prayerAr: string; nextAt: string;
  countdownH: string; countdownM: string; countdownLabel: string;
  location: string; hijri: string; lockClock: string; lockDate: string;
}> = {
  day: {
    prayerEn: 'Asr', prayerAr: 'العصر', nextAt: '16:34',
    countdownH: '3', countdownM: '22', countdownLabel: 'TO ASR',
    location: 'London, UK', hijri: '18 Dhū al-Qaʿdah 1446',
    lockClock: '1:00', lockDate: 'Tuesday, May 6',
  },
  night: {
    prayerEn: 'Fajr', prayerAr: 'الفجر', nextAt: '03:15',
    countdownH: '5', countdownM: '15', countdownLabel: 'TO FAJR',
    location: 'London, UK', hijri: '18 Dhū al-Qaʿdah 1446',
    lockClock: '10:00', lockDate: 'Tuesday, May 6',
  },
};

/** Sun glyph — replicates in-app CelestialDome: outer gold halo + warm-cream core. */
export function SunGlyph({ size = 22, opacity = 1, intensity = 1 }: { size?: number; opacity?: number; intensity?: number }) {
  const id = `sg-${size}-${Math.round(intensity * 100)}-${Math.random().toString(36).slice(2, 6)}`;
  const cx = 12, cy = 12;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', opacity }}>
      <defs>
        <radialGradient id={id} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE9A8" stopOpacity={Math.min(0.95 * intensity, 1)} />
          <stop offset="55%" stopColor={T.gold} stopOpacity={Math.min(0.5 * intensity, 0.9)} />
          <stop offset="100%" stopColor={T.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={11.5} fill={`url(#${id})`} />
      <circle cx={cx} cy={cy} r={5.8} fill="#FFF1C4" opacity={0.92} />
      <circle cx={cx} cy={cy} r={3.4} fill="#FFE9A8" />
    </svg>
  );
}

/** Moon glyph — replicates in-app CelestialDomeNight: cool halo + cream core + offset crescent cut. */
export function MoonGlyph({ size = 22, opacity = 1, cutColor = T.surface, intensity = 1 }: { size?: number; opacity?: number; cutColor?: string; intensity?: number }) {
  const id = `mg-${size}-${cutColor.replace('#', '')}-${Math.random().toString(36).slice(2, 6)}`;
  const cx = 12, cy = 12;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', opacity }}>
      <defs>
        <radialGradient id={id} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F0E9D8" stopOpacity={Math.min(0.92 * intensity, 1)} />
          <stop offset="55%" stopColor="#D8C7A0" stopOpacity={Math.min(0.32 * intensity, 0.8)} />
          <stop offset="100%" stopColor="#D8C7A0" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={11.5} fill={`url(#${id})`} />
      <circle cx={cx} cy={cy} r={5.8} fill="#F0E9D8" />
      <circle cx={cx - 2} cy={cy - 0.4} r={4.7} fill={cutColor} />
    </svg>
  );
}

/** Sky band — saturates with urgency. Day deepens toward sunset; night deepens toward dawn. */
const DAY_SKY: Record<State, string> = {
  normal: 'linear-gradient(180deg, #5BA8D6 0%, #8BBFD8 50%, #C49060 92%, transparent 100%)',
  t10:    'linear-gradient(180deg, #5994C2 0%, #B0916C 55%, #D89858 92%, transparent 100%)',
  t1:     'linear-gradient(180deg, #5A7AA6 0%, #C68250 55%, #E89C4A 92%, transparent 100%)',
  t30:    'linear-gradient(180deg, #6A4F7A 0%, #C46850 45%, #E8A040 92%, transparent 100%)',
  t0:     'linear-gradient(180deg, #5C3B6A 0%, #C25A48 40%, #E89040 75%, #F0B860 100%)',
};

const NIGHT_SKY: Record<State, string> = {
  normal: 'linear-gradient(180deg, #1B1F4D 0%, #2A2670 55%, #4A2A6A 92%, transparent 100%)',
  t10:    'linear-gradient(180deg, #1F1F50 0%, #45295E 55%, #6A3A5A 92%, transparent 100%)',
  t1:     'linear-gradient(180deg, #281E58 0%, #5C2C5C 50%, #8A4055 92%, transparent 100%)',
  t30:    'linear-gradient(180deg, #2A2055 0%, #6A3458 40%, #B25A50 92%, transparent 100%)',
  t0:     'linear-gradient(180deg, #2C2255 0%, #7B3A55 35%, #C26048 70%, #DC8A52 100%)',
};

export function SkyBand({ skin, state, height, radius = 22 }: { skin: Skin; state: State; height?: number; radius?: number }) {
  // intense states get a taller band so the celestial glyph can sit lower in it
  const h = height ?? (state === 't0' ? 56 : state === 't30' ? 48 : 30);
  const grad = (skin === 'day' ? DAY_SKY : NIGHT_SKY)[state];
  const showStars = skin === 'night' && (state === 'normal' || state === 't10');
  return (
    <div
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: h,
        background: grad,
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
        opacity: state === 't0' ? 0.95 : 0.88,
        pointerEvents: 'none',
      }}
    >
      {showStars && (
        <svg width="100%" height={h} viewBox="0 0 300 30" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="40" cy="8" r="0.8" fill="#fff" opacity="0.55" />
          <circle cx="80" cy="14" r="0.6" fill="#fff" opacity="0.4" />
          <circle cx="160" cy="6" r="0.7" fill="#fff" opacity="0.5" />
          <circle cx="220" cy="11" r="0.5" fill="#fff" opacity="0.35" />
          <circle cx="270" cy="9" r="0.6" fill="#fff" opacity="0.45" />
        </svg>
      )}
    </div>
  );
}

/** Soft gold corner glow — replicates NowNextCard's top-right corner blob. */
export function GoldCornerGlow({ size = 110, opacity = 0.4 }: { size?: number; opacity?: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        right: -size * 0.45,
        top: -size * 0.18,
        width: size,
        height: size,
        borderRadius: size,
        background: `radial-gradient(circle, ${T.gold} 0%, transparent 65%)`,
        opacity: opacity * 0.4,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
      }}
    />
  );
}

/** State→accent color (urgency ramp) */
export function accent(state: State): string {
  switch (state) {
    case 'normal': return T.gold;
    case 't10': return T.goldLight;
    case 't1': return T.gold;
    case 't30': return T.amber;
    case 't0': return T.gold;
  }
}

/** Eyebrow text per state (mirrors in-app NOW · IN PROGRESS / TO X label) */
export function eyebrow(state: State, skin: Skin): string {
  if (state === 't0') return '● NOW · TIME TO PRAY';
  return DATA[skin].countdownLabel;
}

/** Countdown render — drops "0m" for sub-1-min states, never splits a unit. */
export function CountdownText({ state, skin, size = 38, color }: { state: State; skin: Skin; size?: number; color?: string }) {
  const c = color ?? T.text;
  const goldUnit = T.gold;
  const unitSize = Math.round(size * 0.58);
  if (state === 't30') {
    return (
      <span style={{ fontFamily: F.serif, fontSize: size, lineHeight: 1, letterSpacing: '-0.02em' }}>
        <span style={{ color: c }}>30</span>
        <span style={{ color: goldUnit, fontSize: unitSize, paddingLeft: 2 }}>s</span>
      </span>
    );
  }
  if (state === 't1') {
    return (
      <span style={{ fontFamily: F.serif, fontSize: size, lineHeight: 1, letterSpacing: '-0.02em' }}>
        <span style={{ color: c }}>1</span>
        <span style={{ color: goldUnit, fontSize: unitSize, paddingLeft: 2 }}>m</span>
      </span>
    );
  }
  if (state === 't10') {
    return (
      <span style={{ fontFamily: F.serif, fontSize: size, lineHeight: 1, letterSpacing: '-0.02em' }}>
        <span style={{ color: c }}>10</span>
        <span style={{ color: goldUnit, fontSize: unitSize, paddingLeft: 2 }}>m</span>
      </span>
    );
  }
  if (state === 't0') {
    return null;
  }
  // normal
  const d = DATA[skin];
  return (
    <span style={{ fontFamily: F.serif, fontSize: size, lineHeight: 1, letterSpacing: '-0.02em' }}>
      <span style={{ color: c }}>{d.countdownH}</span>
      <span style={{ color: goldUnit, fontSize: unitSize, paddingLeft: 1, paddingRight: 4 }}>h</span>
      <span style={{ color: c }}>{d.countdownM}</span>
      <span style={{ color: goldUnit, fontSize: unitSize, paddingLeft: 2 }}>m</span>
    </span>
  );
}

/** Per-state glyph sizing/position — bigger and lower as urgency rises. */
function glyphForState(state: State): { size: number; top: number; right: number; intensity: number } {
  switch (state) {
    case 'normal': return { size: 22, top: 4,  right: 14, intensity: 1.0 };
    case 't10':    return { size: 24, top: 4,  right: 14, intensity: 1.05 };
    case 't1':     return { size: 26, top: 5,  right: 14, intensity: 1.15 };
    case 't30':    return { size: 32, top: 8,  right: 16, intensity: 1.25 };
    case 't0':     return { size: 38, top: 9,  right: 18, intensity: 1.35 };
  }
}

/** The actual Live Activity card body. Reused across LA + DI Expanded + Home Medium. */
export function LiveActivityCard({ state, skin, width = 358, height = 132 }: { state: State; skin: Skin; width?: number; height?: number }) {
  const d = DATA[skin];
  const accentColor = accent(state);
  // border glow ONLY on T-1 and T-30 per refinement brief
  const ringed = state === 't1' || state === 't30';
  const isT0 = state === 't0';
  // T-0 needs more vertical room for the ceremonial layout
  const h = isT0 ? Math.max(height, 156) : height;
  const g = glyphForState(state);

  return (
    <div
      style={{
        width,
        height: h,
        backgroundColor: T.surface,
        borderRadius: 22,
        border: `0.5px solid ${T.border}`,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: F.sans,
        boxShadow: ringed
          ? `0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px ${accentColor}55, 0 0 24px ${accentColor}33`
          : `0 8px 14px rgba(0,0,0,0.3)`,
      }}
    >
      <SkyBand skin={skin} state={state} />
      <GoldCornerGlow opacity={ringed ? 0.85 : 0.55} />

      {/* sky-band celestial icon — scales + drops with urgency */}
      <div style={{ position: 'absolute', top: g.top, right: g.right, zIndex: 2 }}>
        {skin === 'day'
          ? <SunGlyph size={g.size} intensity={g.intensity} />
          : <MoonGlyph size={g.size} intensity={g.intensity} cutColor={isT0 ? '#7B3A55' : '#1B1F4D'} />}
      </div>

      {/* content */}
      {isT0 ? (
        // ── Ceremonial T-0 layout: centered, no countdown, no AT-time, no location ──
        <div style={{
          position: 'absolute', inset: 0, paddingTop: 60, paddingBottom: 18,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', zIndex: 3,
        }}>
          <div style={{
            fontSize: 9, letterSpacing: 2, fontFamily: F.sans, fontWeight: 700,
            color: accentColor, marginBottom: 10, opacity: 0.95,
          }}>
            {eyebrow(state, skin)}
          </div>
          <div style={{
            fontFamily: F.serif, fontSize: 26, fontWeight: 500, fontStyle: 'italic',
            color: T.text, letterSpacing: '-0.005em', lineHeight: 1.1, marginBottom: 4,
          }}>
            Time for {d.prayerEn}
          </div>
          <div style={{ fontFamily: F.arabic, fontSize: 22, color: accentColor, lineHeight: 1.15 }}>
            حان وقت {d.prayerAr}
          </div>
        </div>
      ) : (
        // ── Standard countdown layout ──
        <div style={{ position: 'absolute', inset: 0, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 3 }}>
          <div style={{
            fontSize: 9, letterSpacing: 2, fontFamily: F.sans, fontWeight: 700,
            color: accentColor, marginBottom: 4,
          }}>
            {eyebrow(state, skin)}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <CountdownText state={state} skin={skin} size={38} color={ringed ? accentColor : T.text} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: F.sans, letterSpacing: '-0.01em' }}>{d.prayerEn}</span>
                <span style={{ fontSize: 15, color: accentColor, fontFamily: F.arabic }}>{d.prayerAr}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, paddingBottom: 4 }}>
              <span style={{ fontSize: 9, letterSpacing: 1.5, color: T.textSecondary, fontFamily: F.sans, fontWeight: 700 }}>AT</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: F.sans }}>{d.nextAt}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Lock-screen wallpaper context — phones 460×420 frame. */
export function LockChrome({ skin, children }: { skin: Skin; children: React.ReactNode }) {
  const wallpaper = skin === 'day'
    ? 'radial-gradient(ellipse at 50% 100%, rgba(91,168,214,0.18) 0%, transparent 70%)'
    : 'radial-gradient(ellipse at 50% 100%, rgba(74,42,106,0.28) 0%, transparent 70%)';
  return (
    <div style={{ width: 460, height: 460, backgroundColor: '#000', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <FontLink />
      <div style={{ position: 'absolute', inset: 0, background: wallpaper, pointerEvents: 'none' }} />
      <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff', zIndex: 5 }}>
        <div style={{ fontSize: 15, fontWeight: 500, fontFamily: F.sans, opacity: 0.85, marginBottom: 2 }}>{DATA[skin].lockDate}</div>
        <div style={{ fontSize: 60, fontWeight: 600, fontFamily: F.sans, letterSpacing: '-0.02em', lineHeight: 1 }}>{DATA[skin].lockClock}</div>
      </div>
      <div style={{ marginTop: 'auto', marginBottom: 32, zIndex: 5 }}>{children}</div>
    </div>
  );
}

/** Notch / Dynamic Island context. */
export function NotchChrome({ children, height = 220 }: { children: React.ReactNode; height?: number }) {
  return (
    <div style={{ width: 460, height, backgroundColor: '#000', position: 'relative', display: 'flex', justifyContent: 'center' }}>
      <FontLink />
      {children}
    </div>
  );
}

/** Home-screen wallpaper context for widget previews. */
export function HomeChrome({ skin = 'day', children, height = 420 }: { skin?: Skin; children: React.ReactNode; height?: number }) {
  const grad = skin === 'day'
    ? 'linear-gradient(160deg, #2A4D34 0%, #0A1A0E 60%)'
    : 'linear-gradient(160deg, #1B1F4D 0%, #0A1A0E 70%)';
  return (
    <div style={{ width: 460, height, background: grad, position: 'relative', overflow: 'hidden', padding: 24, boxSizing: 'border-box' }}>
      <FontLink />
      {/* faux app icons */}
      <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ width: 60, height: 60, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)' }} />
        ))}
      </div>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', paddingTop: 40 }}>{children}</div>
    </div>
  );
}
