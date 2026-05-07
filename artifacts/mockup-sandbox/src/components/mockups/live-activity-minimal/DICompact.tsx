import { NotchContext, tokens } from './_shared';

export function DICompact() {
  return (
    <NotchContext height={200}>
      <div style={{
        position: 'absolute',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 240,
        height: 35,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none',
      }}>
        {/* Leading */}
        <div style={{
          backgroundColor: '#000',
          height: 35,
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 14px',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: tokens.gold }} />
        </div>
        
        {/* Trailing */}
        <div style={{
          backgroundColor: '#000',
          height: 35,
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
        }}>
          <span style={{
            fontFamily: tokens.fontCountdown,
            fontFeatureSettings: '"tnum"',
            fontSize: 15,
            fontWeight: 500,
            color: tokens.gold,
          }}>3h</span>
        </div>
      </div>
    </NotchContext>
  );
}
