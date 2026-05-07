import { HomeScreenContext, NuurMark, tokens } from './_shared';

export function HomeWidget() {
  return (
    <HomeScreenContext>
      <div style={{
        width: 328,
        height: 155,
        backgroundColor: tokens.bg,
        borderRadius: 22,
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        border: `1px solid ${tokens.border}`,
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 4,
          height: '100%',
          backgroundColor: tokens.gold,
        }} />

        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <span style={{
            fontFamily: tokens.fontEn,
            fontSize: 20,
            fontWeight: 500,
            color: tokens.text,
            letterSpacing: '-0.01em',
          }}>Maghrib</span>
          <span style={{
            fontFamily: tokens.fontAr,
            fontSize: 18,
            color: tokens.text,
          }}>المغرب</span>
          <span style={{
            color: tokens.gold,
            fontSize: 18,
            margin: '0 2px',
          }}>·</span>
          <span style={{
            fontFamily: tokens.fontCountdown,
            fontFeatureSettings: '"tnum"',
            fontSize: 32,
            fontWeight: 500,
            color: tokens.text,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>3h 22m</span>
        </div>

        <div style={{
          marginTop: 14,
          fontFamily: tokens.fontEn,
          fontSize: 13,
          color: tokens.textMute,
          display: 'flex',
          gap: 6,
          alignItems: 'center',
        }}>
          <span>London, UK</span>
          <span style={{ opacity: 0.5 }}>•</span>
          <span>18 Dhū al-Qaʿdah 1446</span>
        </div>

        <div style={{ position: 'absolute', top: 14, right: 16 }}>
          <NuurMark size={9} color={tokens.gold} opacity={0.55} />
        </div>
      </div>
    </HomeScreenContext>
  );
}
