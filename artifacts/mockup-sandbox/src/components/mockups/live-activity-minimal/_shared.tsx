export const tokens = {
  bg: '#0A1A2E',
  surface: '#152033',
  border: '#1F2D45',
  text: '#F4EAD4',
  textDim: 'rgba(244,234,212,0.7)',
  textMute: 'rgba(244,234,212,0.45)',
  gold: '#F5C542',
  amber: '#F5A742',
  alert: '#FFD24A',
  fontCountdown: 'Fraunces, ui-serif, Georgia, serif',
  fontEn: 'Inter, ui-sans-serif, system-ui, sans-serif',
  fontAr: '"Amiri Quran", "Scheherazade New", "Noto Naskh Arabic", serif',
};

export function FontLoader() {
  return (
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap" />
  );
}

export function LockScreenContext({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 460, height: 420, backgroundColor: '#000', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'col', alignItems: 'center', fontFamily: tokens.fontEn }}>
      <FontLoader />
      {/* Fake wallpaper hint */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 50% 0%, #152033 0%, #000 70%)', opacity: 0.5 }} />
      
      {/* Top Lock Info */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40, position: 'relative', zIndex: 10 }}>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 500, marginBottom: -5 }}>Tuesday, May 6</div>
        <div style={{ color: '#fff', fontSize: 72, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1 }}>9:41</div>
      </div>
      
      {/* Widget Container */}
      <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
}

export function NotchContext({ children, height = 200 }: { children: React.ReactNode, height?: number }) {
  return (
    <div style={{ width: 460, height, backgroundColor: '#000', position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
      <FontLoader />
      {/* Hardware Notch */}
      <div style={{ position: 'absolute', top: 12, width: 120, height: 35, backgroundColor: '#000', borderRadius: 20, zIndex: 20, left: '50%', transform: 'translateX(-50%)' }} />
      {children}
    </div>
  );
}

export function HomeScreenContext({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 460, height: 320, backgroundColor: '#111', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 50 }}>
      <FontLoader />
      {/* Wallpaper */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, #152033, #0A1A2E)' }} />
      
      {/* App grid */}
      <div style={{ position: 'absolute', top: 50, left: 30, display: 'flex', gap: 20 }}>
        <div style={{ width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14 }} />
      </div>
      <div style={{ position: 'absolute', top: 140, left: 30, display: 'flex', gap: 20 }}>
        <div style={{ width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14 }} />
        <div style={{ width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14 }} />
      </div>

      <div style={{ zIndex: 10, position: 'relative', marginLeft: 80 }}>
        {children}
      </div>
    </div>
  );
}
