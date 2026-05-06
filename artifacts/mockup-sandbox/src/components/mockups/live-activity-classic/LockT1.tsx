import { colors, fonts, data, FontLink, Starfield, LockScreenChrome } from './_tokens';

export function LockT1() {
  return (
    <LockScreenChrome>
      <FontLink />
      <div
        style={{
          width: 390,
          height: 170,
          backgroundColor: '#1f1605',
          borderRadius: 32,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px',
          boxSizing: 'border-box',
          boxShadow: `0 0 60px rgba(255, 210, 74, 0.15) inset`
        }}
      >
        <Starfield opacity={0.8} />
        
        <svg width="16" height="16" viewBox="0 0 24 24" style={{ position: 'absolute', top: 20, right: 24, fill: colors.alert, opacity: 1 }}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>

        <div style={{
          fontFamily: fonts.fraunces,
          fontSize: 72,
          fontWeight: 600,
          color: colors.alert,
          fontFeatureSettings: '"tnum"',
          lineHeight: 1,
          marginBottom: 10,
          textShadow: `0 2px 20px rgba(255,210,74,0.4)`
        }}>
          1m
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontFamily: fonts.sans, fontSize: 22, fontWeight: 600, color: colors.text }}>{data.prayerEn}</span>
          <span style={{ fontFamily: fonts.arabic, fontSize: 24, color: colors.alert, opacity: 1 }}>{data.prayerAr}</span>
        </div>
      </div>
    </LockScreenChrome>
  );
}