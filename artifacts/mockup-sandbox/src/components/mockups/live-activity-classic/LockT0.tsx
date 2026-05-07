import { colors, fonts, data, FontLink, SunHorizon, HorizonGlow, LockScreenChrome } from './_tokens';

export function LockT0() {
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
          border: `1px solid ${colors.gold}`,
          boxShadow: `inset 0 0 0 1px ${colors.gold}66, 0 0 30px ${colors.gold}40`,
        }}
      >
        <HorizonGlow color={colors.gold} opacity={0.45} height="80%" />
        <div style={{ position: 'absolute', top: 18, right: 22 }}>
          <SunHorizon color={colors.gold} size={20} opacity={1} />
        </div>

        <div style={{
          fontFamily: fonts.sans,
          fontSize: 26,
          fontWeight: 600,
          color: colors.gold,
          letterSpacing: '-0.01em',
          marginBottom: 6,
          position: 'relative',
        }}>
          Time for Maghrib
        </div>
        <div style={{
          fontFamily: fonts.arabic,
          fontSize: 22,
          color: colors.gold,
          marginBottom: 10,
          position: 'relative',
        }}>
          حان وقت المغرب
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.7, position: 'relative' }}>
          <span style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.text }}>{data.location}</span>
          <span style={{ color: colors.text }}>•</span>
          <span style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.text }}>{data.hijri}</span>
        </div>
      </div>
    </LockScreenChrome>
  );
}
