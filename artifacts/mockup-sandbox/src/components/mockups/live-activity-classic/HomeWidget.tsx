import { colors, fonts, data, FontLink, SunHorizon, HorizonGlow, HomeChrome } from './_tokens';

export function HomeWidget() {
  return (
    <HomeChrome>
      <FontLink />
      <div
        style={{
          width: 328,
          height: 155,
          backgroundColor: colors.bg,
          borderRadius: 22,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          padding: '20px',
          boxSizing: 'border-box',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          border: `1px solid ${colors.border}`,
        }}
      >
        <HorizonGlow color={colors.goldLight} opacity={0.12} />

        <div style={{ position: 'absolute', top: 14, right: 14 }}>
          <SunHorizon color={colors.gold} size={16} opacity={0.85} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div>
            <div style={{
              fontFamily: fonts.fraunces,
              fontSize: 42,
              fontWeight: 400,
              color: colors.cream,
              fontFeatureSettings: '"tnum"',
              lineHeight: 1,
              marginBottom: 8,
            }}>
              3h 22m
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: fonts.sans, fontSize: 16, fontWeight: 500, color: colors.text }}>{data.prayerEn}</span>
              <span style={{ fontFamily: fonts.arabic, fontSize: 18, color: colors.text, opacity: 0.95 }}>{data.prayerAr}</span>
            </div>
          </div>

          <div style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.text, opacity: 0.5 }}>
            {data.location}
          </div>
        </div>

        <div style={{ width: 1, backgroundColor: colors.border, margin: '0 16px', opacity: 0.6 }} />

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, paddingRight: 8, position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.text, opacity: 0.5, letterSpacing: '0.06em' }}>ISHA</span>
            <span style={{ fontFamily: fonts.sans, fontSize: 13, fontWeight: 500, color: colors.text }}>19:50</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.text, opacity: 0.5, letterSpacing: '0.06em' }}>FAJR</span>
            <span style={{ fontFamily: fonts.sans, fontSize: 13, fontWeight: 500, color: colors.text }}>03:15</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.text, opacity: 0.5, letterSpacing: '0.06em' }}>SUNRISE</span>
            <span style={{ fontFamily: fonts.sans, fontSize: 13, fontWeight: 500, color: colors.text }}>05:30</span>
          </div>
        </div>
      </div>
    </HomeChrome>
  );
}
