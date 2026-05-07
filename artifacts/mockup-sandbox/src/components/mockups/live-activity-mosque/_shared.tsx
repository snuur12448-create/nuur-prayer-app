import React from 'react';

export const COLORS = {
  bg: '#0A1A2E',
  surface: '#152033',
  border: '#1F2D45',
  text: '#F4EAD4',
  textDim: 'rgba(244,234,212,0.7)',
  textMute: 'rgba(244,234,212,0.45)',
  gold: '#F5C542',
  amber: '#F5A742',
  alert: '#FFD24A',
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
  hijri: "18 Dhū al-Qa'dah 1446",
};

export function FontLink() {
  return (
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap" />
  );
}

export function PhoneFrame({ children, type = "lock", height = 420 }: { children: React.ReactNode, type?: "lock" | "notch" | "home", height?: number }) {
  if (type === "lock") {
    return (
      <div style={{ width: 460, height, backgroundColor: COLORS.black, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: FONTS.sans }}>
        <FontLink />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 100%, rgba(10,26,46,0.5) 0%, transparent 60%)' }} />
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
  
  if (type === "notch") {
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
  
  if (type === "home") {
    return (
      <div style={{ width: 460, height, backgroundColor: '#1e3a5f', backgroundImage: 'linear-gradient(to bottom right, #1e3a5f, #0d1e33)', position: 'relative', overflow: 'hidden', display: 'flex', padding: 24, fontFamily: FONTS.sans }}>
        <FontLink />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, width: '100%', alignContent: 'start' }}>
          <div style={{ width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14 }} />
          <div style={{ width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14 }} />
          <div style={{ width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14 }} />
          <div style={{ width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14 }} />
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
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: '15%', left: '10%', width: 2, height: 2, backgroundColor: '#fff', borderRadius: '50%', opacity: 0.3 }} />
      <div style={{ position: 'absolute', top: '25%', left: '85%', width: 1.5, height: 1.5, backgroundColor: '#fff', borderRadius: '50%', opacity: 0.2 }} />
      <div style={{ position: 'absolute', top: '65%', left: '15%', width: 2.5, height: 2.5, backgroundColor: '#fff', borderRadius: '50%', opacity: 0.4 }} />
      <div style={{ position: 'absolute', top: '75%', left: '75%', width: 1.5, height: 1.5, backgroundColor: '#fff', borderRadius: '50%', opacity: 0.25 }} />
      <div style={{ position: 'absolute', top: '40%', left: '50%', width: 2, height: 2, backgroundColor: '#fff', borderRadius: '50%', opacity: 0.15 }} />
      <div style={{ position: 'absolute', top: '80%', left: '40%', width: 2, height: 2, backgroundColor: '#fff', borderRadius: '50%', opacity: 0.35 }} />
      <div style={{ position: 'absolute', top: '10%', left: '60%', width: 1.5, height: 1.5, backgroundColor: '#fff', borderRadius: '50%', opacity: 0.2 }} />
      <div style={{ position: 'absolute', top: '50%', left: '90%', width: 2, height: 2, backgroundColor: '#fff', borderRadius: '50%', opacity: 0.3 }} />
    </div>
  );
}

export function MosqueOrnament({ color = COLORS.gold, opacity = 1, size = 16 }: { color?: string, opacity?: number, size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity }}>
      <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" fill={color} />
      <path d="M3.5 3.5L10.5 10.5L12 2L13.5 10.5L20.5 3.5L13.5 10.5L22 12L13.5 13.5L20.5 20.5L13.5 13.5L12 22L10.5 13.5L3.5 20.5L10.5 13.5L2 12L10.5 10.5L3.5 3.5Z" fill={color} opacity="0.5" />
    </svg>
  );
}

export function NuurHalo({ opacity = 0.14, size = 200, color = COLORS.gold }: { opacity?: number, size?: number, color?: string }) {
  const cx = 100;
  const cy = 100;
  const rays = Array.from({ length: 16 }, (_, i) => {
    const angle = (i * 360) / 16;
    const long = i % 2 === 0;
    const inner = 42;
    const outer = long ? 92 : 72;
    const rad = (angle * Math.PI) / 180;
    const x1 = cx + inner * Math.cos(rad);
    const y1 = cy + inner * Math.sin(rad);
    const x2 = cx + outer * Math.cos(rad);
    const y2 = cy + outer * Math.sin(rad);
    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={long ? 1.6 : 1}
        strokeLinecap="round"
        opacity={long ? 1 : 0.55}
      />
    );
  });

  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity, pointerEvents: 'none' }}>
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="nuurGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.55" />
            <stop offset="55%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r="90" fill="url(#nuurGlow)" />
        {rays}
        <circle cx={cx} cy={cy} r="38" stroke={color} strokeWidth="1.2" opacity="0.7" />
        <path
          d="M118 78c-3-2-7-3-11-3-13 0-23 10-23 23s10 23 23 23c4 0 8-1 11-3-9-2-16-10-16-20s7-18 16-20z"
          fill={color}
        />
      </svg>
    </div>
  );
}

export function CrescentGraphic({ color = COLORS.text, opacity = 0.8, size = 24 }: { color?: string, opacity?: number, size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity }}>
      <path d="M21.5 15.5C19.5 15.5 17.5 15 15.8 14C12.8 12.3 10.7 9.3 10.5 5.8C10.4 4.1 10.8 2.4 11.5 1C6.7 1.8 3 5.9 3 10.5C3 15.7 7.3 20 12.5 20C16.8 20 20.7 17 21.5 12.5C21.6 13.5 21.5 14.5 21.5 15.5Z" fill={color} />
    </svg>
  );
}
