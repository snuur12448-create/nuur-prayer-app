import React from 'react';

export const colors = {
  bg: '#152A1A',
  surface: '#172B1B',
  border: '#1F3526',
  text: '#F0EDE5',
  textDim: 'rgba(240,237,229,0.7)',
  textMute: 'rgba(240,237,229,0.45)',
  cream: '#F0EDE5',
  tint: '#4ADE80',
  tintLight: '#2D6A4F',
  gold: '#F4C842',
  goldLight: '#F9D97A',
  warmGold: '#F9D97A',
  amber: '#F4C842',
  amberHot: '#F9A641',
  alert: '#E55555',
  black: '#000000',
  white: '#FFFFFF',
};

export const fonts = {
  fraunces: 'Fraunces, ui-serif, Georgia, serif',
  sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
  arabic: '"Amiri Quran", "Scheherazade New", "Noto Naskh Arabic", serif',
};

export const data = {
  prayerEn: 'Maghrib',
  prayerAr: 'المغرب',
  time: '18:42',
  location: 'London, UK',
  hijri: '18 Dhū al-Qaʿdah 1446',
};

export const FontLink = () => (
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap" />
);

export function Starfield(_props: { opacity?: number } = {}) {
  return null;
}

export function SunGlyph({ color = colors.gold, size = 16, opacity = 1 }: { color?: string; size?: number; opacity?: number }) {
  const cx = 12, cy = 12;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity, display: 'block' }}>
      <circle cx={cx} cy={cy} r="3.5" fill={color} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45) * Math.PI / 180;
        const r1 = 6.5, r2 = 9.5;
        return (
          <line
            key={i}
            x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)}
            x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)}
            stroke={color} strokeWidth="1.4" strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export function SunHorizon({ color = colors.gold, size = 18, opacity = 1 }: { color?: string; size?: number; opacity?: number }) {
  const cx = 12, baseY = 15;
  const rays = [180, -150, -120, -90, -60, -30, 0].map((deg, i) => {
    const a = deg * Math.PI / 180;
    return (
      <line key={i}
        x1={cx + 5.5 * Math.cos(a)} y1={baseY + 5.5 * Math.sin(a)}
        x2={cx + 8.5 * Math.cos(a)} y2={baseY + 8.5 * Math.sin(a)}
        stroke={color} strokeWidth="1.2" strokeLinecap="round"
      />
    );
  });
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity, display: 'block' }}>
      <defs>
        <clipPath id="cls-h"><rect x="0" y="0" width="24" height={baseY + 0.5} /></clipPath>
      </defs>
      <g clipPath="url(#cls-h)">
        <circle cx={cx} cy={baseY} r="3.6" fill={color} />
        {rays}
      </g>
      <line x1="2" y1={baseY + 1} x2="22" y2={baseY + 1} stroke={color} strokeWidth="1.1" opacity="0.85" />
    </svg>
  );
}

export function HorizonGlow({ color = colors.goldLight, height = '60%', opacity = 0.18 }: { color?: string; height?: string; opacity?: number }) {
  return (
    <div style={{
      position: 'absolute',
      left: 0, right: 0, bottom: 0,
      height,
      background: `linear-gradient(to top, ${color} 0%, transparent 100%)`,
      opacity,
      pointerEvents: 'none',
    }} />
  );
}

export function LockScreenChrome({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 460, height: 420, backgroundColor: colors.black, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', background: 'radial-gradient(circle at center bottom, rgba(45,106,79,0.28) 0%, transparent 80%)', pointerEvents: 'none' }} />
      <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', color: colors.white, opacity: 0.9 }}>
        <div style={{ fontSize: 16, fontWeight: 500, fontFamily: fonts.sans, marginBottom: 4 }}>Tuesday, May 6</div>
        <div style={{ fontSize: 64, fontWeight: 600, fontFamily: fonts.sans, letterSpacing: '-0.02em', lineHeight: 1 }}>9:41</div>
      </div>
      <div style={{ marginTop: 'auto', marginBottom: 30 }}>{children}</div>
    </div>
  );
}

export function IslandChrome({ children, height = 200 }: { children: React.ReactNode; height?: number }) {
  return (
    <div style={{ width: 460, height, backgroundColor: '#000', position: 'relative', display: 'flex', justifyContent: 'center' }}>
      {children}
    </div>
  );
}

export function HomeChrome({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 460, height: 320, backgroundColor: '#0A1A0E', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0A1A0E 0%, #1F3526 100%)' }} />
      <div style={{ position: 'relative', padding: '24px 32px', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {children}
        <div style={{ width: 60, height: 60, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <div style={{ width: 60, height: 60, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <div style={{ width: 60, height: 60, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)' }} />
      </div>
    </div>
  );
}
