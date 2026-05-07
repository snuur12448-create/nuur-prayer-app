import { colors, fonts, data, FontLink, SunHorizon, HorizonGlow, LockScreenChrome } from './_tokens';

export function LockT30() {
  return (
    <LockScreenChrome>
      <FontLink />
      <div
        style={{
          width: 390,
          height: 170,
          backgroundColor: colors.bg,
          borderRadius: 32,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px',
          boxSizing: 'border-box',
          border: `1px solid ${colors.amberHot}`,
          boxShadow: `inset 0 0 0 1px ${colors.amberHot}55, 0 0 24px ${colors.amberHot}30`,
        }}
      >
        <HorizonGlow color={colors.amberHot} opacity={0.40} />
        <div style={{ position: 'absolute', top: 18, right: 22 }}>
          <SunHorizon color={colors.amberHot} size={18} opacity={1} />
        </div>

        <div style={{
          fontFamily: fonts.fraunces,
          fontSize: 56,
          fontWeight: 400,
          color: colors.amberHot,
          fontFeatureSettings: '"tnum"',
          lineHeight: 1.1,
          marginBottom: 12,
          position: 'relative',
        }}>
          30s
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, position: 'relative' }}>
          <span style={{ fontFamily: fonts.sans, fontSize: 20, fontWeight: 500, color: colors.text }}>{data.prayerEn}</span>
          <span style={{ fontFamily: fonts.arabic, fontSize: 22, color: colors.amberHot, opacity: 0.95 }}>{data.prayerAr}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, opacity: 0.6, position: 'relative' }}>
          <span style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.text }}>{data.location}</span>
          <span style={{ color: colors.text }}>•</span>
          <span style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.text }}>{data.hijri}</span>
        </div>
      </div>
    </LockScreenChrome>
  );
}
