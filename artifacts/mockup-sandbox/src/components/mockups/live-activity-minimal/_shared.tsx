import React from 'react';

export const tokens = {
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
  amber: '#F9D97A',
  alert: '#F9A641',
  red: '#E55555',
  fontCountdown: 'Fraunces, ui-serif, Georgia, serif',
  fontEn: 'Inter, ui-sans-serif, system-ui, sans-serif',
  fontAr: '"Amiri Quran", "Scheherazade New", "Noto Naskh Arabic", serif',
};

export function FontLoader() {
  return (
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap" />
  );
}

export function NuurMark(_props: { size?: number; color?: string; opacity?: number; showWordmark?: boolean } = {}) {
  return null;
}

export function NuurGlyph({ size = 14, color = tokens.gold, opacity = 1 }: { size?: number; color?: string; opacity?: number }) {
  const cx = 12, cy = 12;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity, display: 'block' }}>
      <circle cx={cx} cy={cy} r="3.2" fill={color} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45) * Math.PI / 180;
        const r1 = 6, r2 = 9.5;
        return (
          <line key={i}
            x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)}
            x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)}
            stroke={color} strokeWidth="1.4" strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export function LockScreenContext({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 460, height: 420, backgroundColor: '#000', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: tokens.fontEn }}>
      <FontLoader />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 100%, rgba(45,106,79,0.3) 0%, #000 70%)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40, position: 'relative', zIndex: 10 }}>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 500, marginBottom: -5 }}>Tuesday, May 6</div>
        <div style={{ color: '#fff', fontSize: 72, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1 }}>9:41</div>
      </div>
      <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
}

export function NotchContext({ children, height = 200 }: { children: React.ReactNode; height?: number }) {
  return (
    <div style={{ width: 460, height, backgroundColor: '#000', position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
      <FontLoader />
      <div style={{ position: 'absolute', top: 12, width: 120, height: 35, backgroundColor: '#000', borderRadius: 20, zIndex: 20, left: '50%', transform: 'translateX(-50%)' }} />
      {children}
    </div>
  );
}

export function HomeScreenContext({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 460, height: 320, backgroundColor: '#0A1A0E', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 50 }}>
      <FontLoader />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #1F3526, #0A1A0E)' }} />
      <div style={{ position: 'absolute', top: 50, left: 30, display: 'flex', gap: 20 }}>
        <div style={{ width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14 }} />
      </div>
      <div style={{ position: 'absolute', top: 140, left: 30, display: 'flex', gap: 20 }}>
        <div style={{ width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14 }} />
        <div style={{ width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14 }} />
      </div>
      <div style={{ zIndex: 10, position: 'relative', marginLeft: 80 }}>{children}</div>
    </div>
  );
}
