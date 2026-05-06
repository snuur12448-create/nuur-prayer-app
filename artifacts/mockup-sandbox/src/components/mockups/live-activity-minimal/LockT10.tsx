import { LockScreenContext, tokens } from './_shared';

export function LockT10() {
  return (
    <LockScreenContext>
      <div style={{
        width: 390,
        backgroundColor: tokens.bg,
        borderRadius: 32,
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${tokens.border}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{
            fontFamily: tokens.fontEn,
            fontSize: 24,
            fontWeight: 500,
            color: tokens.text,
            letterSpacing: '-0.01em',
          }}>Maghrib</span>
          
          <div style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: tokens.amber,
          }} />
          
          <span style={{
            fontFamily: tokens.fontCountdown,
            fontFeatureSettings: '"tnum"',
            fontSize: 28,
            fontWeight: 500,
            color: tokens.amber,
          }}>10m</span>
        </div>
        
        <div style={{
          marginTop: 6,
          fontFamily: tokens.fontAr,
          fontSize: 16,
          color: tokens.textDim,
          opacity: 0.8,
        }}>
          المغرب
        </div>
      </div>
    </LockScreenContext>
  );
}
