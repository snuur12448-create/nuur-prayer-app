import { colors, fonts, FontLink, SunGlyph, IslandChrome } from './_tokens';

export function DICompact() {
  return (
    <IslandChrome>
      <FontLink />
      <div style={{ marginTop: 12, position: 'relative', width: 220, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: 120, height: 36, backgroundColor: '#000', borderRadius: 18, zIndex: 10 }} />

        <div style={{ width: 44, height: 36, backgroundColor: colors.bg, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
          <SunGlyph color={colors.gold} size={16} />
        </div>

        <div style={{ height: 36, padding: '0 12px', backgroundColor: colors.bg, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
          <span style={{
            fontFamily: fonts.fraunces,
            fontSize: 16,
            fontWeight: 500,
            color: colors.cream,
            fontFeatureSettings: '"tnum"',
          }}>
            23m
          </span>
        </div>
      </div>
    </IslandChrome>
  );
}
