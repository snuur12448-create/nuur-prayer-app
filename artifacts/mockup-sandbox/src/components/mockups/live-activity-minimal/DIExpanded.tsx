import { NotchContext, tokens } from './_shared';

export function DIExpanded() {
  return (
    <NotchContext height={320}>
      <div style={{
        position: 'absolute',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 390,
        height: 100,
        backgroundColor: '#000',
        borderRadius: 40,
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
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
              fontSize: 22,
              fontWeight: 500,
              color: tokens.text,
              letterSpacing: '-0.01em',
            }}>Maghrib</span>
            <span style={{
              fontFamily: tokens.fontAr,
              fontSize: 18,
              color: tokens.text,
              paddingTop: 2,
            }}>المغرب</span>
            
            <div style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: tokens.gold,
              margin: '0 4px',
            }} />
            
            <span style={{
              fontFamily: tokens.fontCountdown,
              fontFeatureSettings: '"tnum"',
              fontSize: 24,
              fontWeight: 500,
              color: tokens.gold,
            }}>3h 22m</span>
          </div>

          <div style={{
            width: '100%',
            height: 3,
            backgroundColor: tokens.border,
            borderRadius: 1.5,
            marginTop: 16,
            overflow: 'hidden',
          }}>
            <div style={{
              width: '13%',
              height: '100%',
              backgroundColor: tokens.gold,
              borderRadius: 1.5,
            }} />
          </div>
        </div>
      </div>
    </NotchContext>
  );
}
