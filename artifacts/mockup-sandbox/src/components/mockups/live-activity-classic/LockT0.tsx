import { colors, fonts, data, FontLink, Starfield, LockScreenChrome } from './_tokens';

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
        }}
      >
        <Starfield />
        
        {/* Crescent */}
        <svg width="16" height="16" viewBox="0 0 24 24" style={{ position: 'absolute', top: 20, right: 24, fill: colors.gold, opacity: 0.8 }}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 12, gap: 4 }}>
          <div style={{
            fontFamily: fonts.sans,
            fontSize: 24,
            fontWeight: 600,
            color: colors.gold,
            lineHeight: 1.1,
          }}>
            Time for Maghrib
          </div>
          <div style={{
            fontFamily: fonts.arabic,
            fontSize: 24,
            color: colors.gold,
            lineHeight: 1.1,
          }}>
            حان وقت المغرب
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontFamily: fonts.sans, fontSize: 20, fontWeight: 500, color: colors.text }}>{data.prayerEn}</span>
          <span style={{ fontFamily: fonts.arabic, fontSize: 22, color: colors.gold, opacity: 0.9 }}>{data.prayerAr}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, opacity: 0.6 }}>
          <span style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.text }}>{data.location}</span>
          <span style={{ color: colors.text }}>•</span>
          <span style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.text }}>{data.hijri}</span>
        </div>
      </div>
    </LockScreenChrome>
  );
}
