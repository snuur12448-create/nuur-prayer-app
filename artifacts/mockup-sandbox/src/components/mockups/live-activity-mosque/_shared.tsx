import React from 'react';

export const COLORS = {
  bg: '#152A1A',
  surface: '#172B1B',
  surfaceElevated: '#172B1B',
  border: '#1F3526',
  text: '#F0EDE5',
  textDim: 'rgba(240,237,229,0.7)',
  textMute: 'rgba(240,237,229,0.45)',
  cream: '#F0EDE5',
  tint: '#4ADE80',
  tintLight: '#2D6A4F',
  gold: '#F4C842',
  goldLight: '#F9D97A',
  amber: '#F4C842',
  alert: '#F9A641',
  red: '#E55555',
  black: '#000000',
};

export const FONTS = {
  countdown: 'Fraunces, ui-serif, Georgia, serif',
  sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
  arabic: '"Amiri Quran", "Scheherazade New", "Noto Naskh Arabic", serif',
};

export const DATA = {
  prayerEn: 'Maghrib',
  prayerAr: 'المغرب',
  time: '18:42',
  location: 'London, UK',
  hijri: '18 Dhū al-Qaʿdah 1446',
};

export function FontLink() {
  return (
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap" />
  );
}

export function PhoneFrame({ children, type = 'lock', height = 420 }: { children: React.ReactNode; type?: 'lock' | 'notch' | 'home'; height?: number }) {
  if (type === 'lock') {
    return (
      <div style={{ width: 460, height, backgroundColor: COLORS.black, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: FONTS.sans }}>
        <FontLink />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 100%, rgba(45,106,79,0.35) 0%, transparent 60%)' }} />
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff', zIndex: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 500, opacity: 0.8, marginBottom: 2 }}>Tuesday, May 6</div>
          <div style={{ fontSize: 64, fontWeight: 600, letterSpacing: -2, lineHeight: 1 }}>9:41</div>
        </div>
        <div style={{ marginTop: 32, zIndex: 10, width: '100%', display: 'flex', justifyContent: 'center' }}>
          {children}
        </div>
      </div>
    );
  }
  if (type === 'notch') {
    return (
      <div style={{ width: 460, height, backgroundColor: '#000', position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', fontFamily: FONTS.sans }}>
        <FontLink />
        <div style={{ position: 'absolute', top: 12, width: 120, height: 36, backgroundColor: '#000', borderRadius: 18, zIndex: 20 }} />
        <div style={{ position: 'absolute', top: 12, zIndex: 10, width: '100%', display: 'flex', justifyContent: 'center' }}>
          {children}
        </div>
      </div>
    );
  }
  if (type === 'home') {
    return (
      <div style={{ width: 460, height, backgroundColor: '#0A1A0E', backgroundImage: 'linear-gradient(to bottom right, #0A1A0E, #1F3526)', position: 'relative', overflow: 'hidden', display: 'flex', padding: 24, fontFamily: FONTS.sans }}>
        <FontLink />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, width: '100%', alignContent: 'start' }}>
          <div style={{ width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14 }} />
          <div style={{ width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14 }} />
          <div style={{ width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14 }} />
          <div style={{ width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14 }} />
          <div style={{ gridColumn: 'span 4', display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            {children}
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function Starfield() {
  return null;
}

export function MosqueOrnament(_props: { color?: string; opacity?: number; size?: number } = {}) {
  return null;
}

export function NuurHalo({ opacity = 0.16, size = 220, color = COLORS.gold }: { opacity?: number; size?: number; color?: string }) {
  const cx = 100, cy = 100;
  const rays = Array.from({ length: 16 }, (_, i) => {
    const angle = (i * 360) / 16;
    const long = i % 2 === 0;
    const inner = 42;
    const outer = long ? 92 : 72;
    const rad = (angle * Math.PI) / 180;
    return (
      <line key={i}
        x1={cx + inner * Math.cos(rad)} y1={cy + inner * Math.sin(rad)}
        x2={cx + outer * Math.cos(rad)} y2={cy + outer * Math.sin(rad)}
        stroke={color} strokeWidth={long ? 1.6 : 1} strokeLinecap="round"
        opacity={long ? 1 : 0.55}
      />
    );
  });
  return (
    <div style={{ position: 'absolute', top: '60%', left: '50%', transform: 'translate(-50%, -50%)', opacity, pointerEvents: 'none' }}>
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="nuurGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="55%" stopColor={color} stopOpacity="0.14" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M30 140 Q 100 40 170 140 Z" fill="none" stroke={color} strokeWidth="1.4" opacity="0.5" />
        <circle cx={cx} cy={cy} r="86" fill="url(#nuurGlow)" />
        {rays}
        <circle cx={cx} cy={cy} r="34" fill={color} opacity="0.85" />
      </svg>
    </div>
  );
}

export function CrescentGraphic({ color = COLORS.gold, opacity = 1, size = 20 }: { color?: string; opacity?: number; size?: number }) {
  const cx = 12, baseY = 15;
  const rays = [180, -150, -120, -90, -60, -30, 0].map((deg, i) => {
    const a = deg * Math.PI / 180;
    return (
      <line key={i}
        x1={cx + 5.5 * Math.cos(a)} y1={baseY + 5.5 * Math.sin(a)}
        x2={cx + 8.5 * Math.cos(a)} y2={baseY + 8.5 * Math.sin(a)}
        stroke={color} strokeWidth="1.3" strokeLinecap="round"
      />
    );
  });
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity, display: 'block' }}>
      <defs>
        <clipPath id={`mc-${size}`}><rect x="0" y="0" width="24" height={baseY + 0.5} /></clipPath>
      </defs>
      <g clipPath={`url(#mc-${size})`}>
        <circle cx={cx} cy={baseY} r="3.8" fill={color} />
        {rays}
      </g>
      <line x1="2.5" y1={baseY + 1} x2="21.5" y2={baseY + 1} stroke={color} strokeWidth="1.2" opacity="0.85" />
    </svg>
  );
}
