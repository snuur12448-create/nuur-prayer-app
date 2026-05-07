import { LockScreenContext, NuurMark, tokens } from './_shared';

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
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 12, right: 16 }}>
          <NuurMark size={9} color={tokens.amber} opacity={0.6} />
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
            <span style={{
              fontFamily: tokens.fontEn,
              fontSize: 24,
              fontWeight: 500,
              color: tokens.text,
              letterSpacing: '-0.01em',
            }}>Maghrib</span>
            <span style={{
              fontFamily: tokens.fontAr,
              fontSize: 20,
              color: tokens.text,
              paddingTop: 2,
            }}>المغرب</span>
            
            <div style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: tokens.amber,
              margin: '0 4px',
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
            fontFamily: tokens.fontEn,
            fontSize: 14,
            color: tokens.textDim,
            display: 'flex',
            gap: 6,
            alignItems: 'center'
          }}>
            <span>London, UK</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span>18 Dhū al-Qaʿdah 1446</span>
          </div>
        </div>
      </div>
    </LockScreenContext>
  );
}
