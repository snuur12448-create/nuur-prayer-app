import { colors, fonts, data, FontLink, HorizonGlow, IslandChrome } from './_tokens';

export function DIExpanded() {
  return (
    <IslandChrome height={320}>
      <FontLink />
      <div style={{ marginTop: 12, position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 390,
          height: 160,
          backgroundColor: colors.bg,
          borderRadius: 42,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '24px 24px 20px',
          boxSizing: 'border-box',
          border: `1px solid ${colors.border}`,
        }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 120, height: 36, backgroundColor: '#000', borderBottomLeftRadius: 18, borderBottomRightRadius: 18, zIndex: 10 }} />

          <HorizonGlow color={colors.goldLight} opacity={0.14} />

          <div style={{
            fontFamily: fonts.fraunces,
            fontSize: 48,
            fontWeight: 400,
            color: colors.cream,
            fontFeatureSettings: '"tnum"',
            lineHeight: 1,
            marginBottom: 8,
            textAlign: 'center',
            position: 'relative',
          }}>
            3h 22m
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 12, position: 'relative' }}>
            <span style={{ fontFamily: fonts.sans, fontSize: 18, fontWeight: 500, color: colors.text }}>{data.prayerEn}</span>
            <span style={{ fontFamily: fonts.arabic, fontSize: 20, color: colors.text, opacity: 0.95 }}>{data.prayerAr}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, opacity: 0.6, position: 'relative' }}>
            <span style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.text }}>{data.location}</span>
            <span style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.text }}>Isha {data.time}</span>
          </div>
        </div>
      </div>
    </IslandChrome>
  );
}
