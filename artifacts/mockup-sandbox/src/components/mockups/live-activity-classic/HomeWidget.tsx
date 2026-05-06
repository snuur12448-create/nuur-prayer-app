import { colors, fonts, data, FontLink, Starfield, HomeChrome } from './_tokens';

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
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}
      >
        <Starfield />

        <svg width="16" height="16" viewBox="0 0 24 24" style={{ position: 'absolute', top: 16, right: 16, fill: colors.gold, opacity: 0.8 }}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{
              fontFamily: fonts.fraunces,
              fontSize: 42,
              fontWeight: 400,
              color: colors.gold,
              fontFeatureSettings: '"tnum"',
              lineHeight: 1,
              marginBottom: 8
            }}>
              3h 22m
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: fonts.sans, fontSize: 16, fontWeight: 500, color: colors.text }}>{data.prayerEn}</span>
              <span style={{ fontFamily: fonts.arabic, fontSize: 18, color: colors.gold, opacity: 0.9 }}>{data.prayerAr}</span>
            </div>
          </div>
          
          <div style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.text, opacity: 0.5 }}>
            {data.location}
          </div>
        </div>

        <div style={{ width: 1, backgroundColor: colors.border, margin: '0 16px', opacity: 0.5 }} />

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, paddingRight: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.text, opacity: 0.5 }}>Isha</span>
            <span style={{ fontFamily: fonts.sans, fontSize: 13, fontWeight: 500, color: colors.text }}>19:50</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.text, opacity: 0.5 }}>Fajr</span>
            <span style={{ fontFamily: fonts.sans, fontSize: 13, fontWeight: 500, color: colors.text }}>03:15</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.text, opacity: 0.5 }}>Shuruq</span>
            <span style={{ fontFamily: fonts.sans, fontSize: 13, fontWeight: 500, color: colors.text }}>05:30</span>
          </div>
        </div>
      </div>
    </HomeChrome>
  );
}