import { colors, fonts, data, FontLink, Starfield, LockScreenChrome } from './_tokens';

export function LockT10() {
  return (
    <LockScreenChrome>
      <FontLink />
      <div
        style={{
          width: 390,
          height: 170,
          backgroundColor: '#1a150e', // Shifted slightly towards amber
          borderRadius: 32,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px',
          boxSizing: 'border-box',
          boxShadow: `0 0 40px rgba(245, 167, 66, 0.1) inset`
        }}
      >
        <Starfield opacity={0.6} />
        
        <svg width="16" height="16" viewBox="0 0 24 24" style={{ position: 'absolute', top: 20, right: 24, fill: colors.amber, opacity: 0.9 }}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>

        <div style={{
          fontFamily: fonts.fraunces,
          fontSize: 64,
          fontWeight: 500,
          color: colors.amber,
          fontFeatureSettings: '"tnum"',
          lineHeight: 1,
          marginBottom: 12,
          textShadow: `0 2px 10px rgba(245,167,66,0.3)`
        }}>
          10m
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontFamily: fonts.sans, fontSize: 20, fontWeight: 500, color: colors.text }}>{data.prayerEn}</span>
          <span style={{ fontFamily: fonts.arabic, fontSize: 22, color: colors.amber, opacity: 0.9 }}>{data.prayerAr}</span>
        </div>
      </div>
    </LockScreenChrome>
  );
}