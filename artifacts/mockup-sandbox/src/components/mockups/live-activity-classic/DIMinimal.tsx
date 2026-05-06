import { colors, IslandChrome } from './_tokens';

export function DIMinimal() {
  return (
    <IslandChrome>
      <div style={{ marginTop: 12, position: 'relative', width: 160, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Hardware Notch */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: 120, height: 36, backgroundColor: '#000', borderRadius: 18, zIndex: 10 }} />
        
        {/* Minimal trailing circle */}
        <div style={{ position: 'absolute', right: -6, top: 4, width: 28, height: 28, backgroundColor: colors.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" style={{ fill: colors.gold }}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </div>
      </div>
    </IslandChrome>
  );
}