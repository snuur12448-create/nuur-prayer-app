export const colors = {
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
  white: '#FFFFFF',
};

export const fonts = {
  fraunces: 'Fraunces, ui-serif, Georgia, serif',
  sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
  arabic: '"Amiri Quran", "Scheherazade New", "Noto Naskh Arabic", serif'
};

export const data = {
  prayerEn: 'Maghrib',
  prayerAr: 'المغرب',
  time: '18:42',
  location: 'London, UK',
  hijri: "18 Dhū al-Qa'dah 1446"
};

export const FontLink = () => (
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap" />
);

export function Starfield({ opacity = 1 }: { opacity?: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity }}>
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() > 0.5 ? 2 : 1.5,
            height: Math.random() > 0.5 ? 2 : 1.5,
            backgroundColor: '#FFF',
            borderRadius: '50%',
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            opacity: 0.15 + Math.random() * 0.25,
          }}
        />
      ))}
    </div>
  );
}

export function LockScreenChrome({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 460, height: 420, backgroundColor: colors.black, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Wallpaper hint */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', background: 'radial-gradient(circle at center bottom, rgba(30,50,90,0.3) 0%, transparent 80%)', pointerEvents: 'none' }} />
      
      {/* Time and Date */}
      <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', color: colors.white, opacity: 0.9 }}>
        <div style={{ fontSize: 16, fontWeight: 500, fontFamily: fonts.sans, marginBottom: 4 }}>Tuesday, May 6</div>
        <div style={{ fontSize: 64, fontWeight: 600, fontFamily: fonts.sans, letterSpacing: '-0.02em', lineHeight: 1 }}>9:41</div>
      </div>
      
      {/* Pill Container */}
      <div style={{ marginTop: 'auto', marginBottom: 30 }}>
        {children}
      </div>
    </div>
  );
}

export function IslandChrome({ children, height = 200 }: { children: React.ReactNode, height?: number }) {
  return (
    <div style={{ width: 460, height, backgroundColor: '#000', position: 'relative', display: 'flex', justifyContent: 'center' }}>
      {children}
    </div>
  );
}

export function HomeChrome({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 460, height: 320, backgroundColor: '#1A2B4C', position: 'relative', overflow: 'hidden' }}>
      {/* Wallpaper gradient */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #10203a 0%, #2a4066 100%)' }} />
      
      <div style={{ position: 'relative', padding: '24px 32px', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {children}
        {/* Ghost icons */}
        <div style={{ width: 60, height: 60, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <div style={{ width: 60, height: 60, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <div style={{ width: 60, height: 60, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)' }} />
      </div>
    </div>
  );
}