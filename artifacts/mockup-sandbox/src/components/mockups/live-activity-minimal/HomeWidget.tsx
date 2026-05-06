import { HomeScreenContext, tokens } from './_shared';

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
          fontFamily: tokens.fontEn,
          fontSize: 18,
          fontWeight: 500,
          color: tokens.textDim,
          marginBottom: 4,
          letterSpacing: '-0.01em',
        }}>
          Maghrib
        </div>
        
        <div style={{
          fontFamily: tokens.fontCountdown,
          fontFeatureSettings: '"tnum"',
          fontSize: 42,
          fontWeight: 500,
          color: tokens.text,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}>
          3h 22m
        </div>
        
        <div style={{
          fontFamily: tokens.fontAr,
          fontSize: 14,
          color: tokens.textMute,
          position: 'absolute',
          top: 24,
          right: 24,
        }}>
          المغرب
        </div>
      </div>
    </HomeScreenContext>
  );
}
