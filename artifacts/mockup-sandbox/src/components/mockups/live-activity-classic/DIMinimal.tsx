import { colors, SunGlyph, IslandChrome } from './_tokens';

export function DIMinimal() {
  return (
    <IslandChrome>
      <div style={{ marginTop: 12, position: 'relative', width: 160, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: 120, height: 36, backgroundColor: '#000', borderRadius: 18, zIndex: 10 }} />
        <div style={{ position: 'absolute', right: -6, top: 4, width: 28, height: 28, backgroundColor: colors.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
          <SunGlyph color={colors.gold} size={14} />
        </div>
      </div>
    </IslandChrome>
  );
}
