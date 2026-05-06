import { colors, fonts, FontLink, IslandChrome } from './_tokens';

export function DICompact() {
  return (
    <IslandChrome>
      <FontLink />
      <div style={{ marginTop: 12, position: 'relative', width: 220, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Hardware Notch */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: 120, height: 36, backgroundColor: '#000', borderRadius: 18, zIndex: 10 }} />
        
        {/* Leading Pill */}
        <div style={{ width: 44, height: 36, backgroundColor: colors.bg, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" style={{ fill: colors.gold }}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </div>
        
        {/* Trailing Pill */}
        <div style={{ height: 36, padding: '0 12px', backgroundColor: colors.bg, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
          <span style={{
            fontFamily: fonts.fraunces,
            fontSize: 16,
            fontWeight: 500,
            color: colors.gold,
            fontFeatureSettings: '"tnum"',
          }}>
            23m
          </span>
        </div>

      </div>
    </IslandChrome>
  );
}