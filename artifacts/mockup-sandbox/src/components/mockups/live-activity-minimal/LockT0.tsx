import { LockScreenContext, NuurMark, tokens } from './_shared';

export function LockT0() {
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
          <NuurMark size={9} color={tokens.gold} opacity={0.7} />
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          gap: 4,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: 10,
          }}>
            <span style={{
              fontFamily: tokens.fontEn,
              fontSize: 22,
              fontWeight: 600,
              color: tokens.gold,
              letterSpacing: '-0.01em',
            }}>Time for Maghrib</span>
            <span style={{
              fontFamily: tokens.fontAr,
              fontSize: 20,
              color: tokens.gold,
            }}>حان وقت المغرب</span>
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
