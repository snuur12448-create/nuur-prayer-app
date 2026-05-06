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
        height: 120,
        backgroundColor: '#000',
        borderRadius: 40,
        padding: '32px 32px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              fontFamily: tokens.fontEn,
              fontSize: 22,
              fontWeight: 500,
              color: tokens.text,
            }}>Maghrib</span>
            <span style={{
              fontFamily: tokens.fontAr,
              fontSize: 18,
              color: tokens.textDim,
              paddingTop: 2,
            }}>المغرب</span>
          </div>
          
          <span style={{
            fontFamily: tokens.fontCountdown,
            fontFeatureSettings: '"tnum"',
            fontSize: 26,
            fontWeight: 500,
            color: tokens.gold,
          }}>3h 22m</span>
        </div>
        
        <div style={{
          width: '100%',
          height: 2,
          backgroundColor: tokens.border,
          borderRadius: 1,
          overflow: 'hidden',
        }}>
          <div style={{
            width: '65%',
            height: '100%',
            backgroundColor: tokens.gold,
            borderRadius: 1,
          }} />
        </div>
      </div>
    </NotchContext>
  );
}
