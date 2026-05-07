import { NotchContext, NuurGlyph, tokens } from './_shared';

export function DIMinimal() {
  return (
    <NotchContext height={200}>
      <div style={{
        position: 'absolute',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 150,
        height: 35,
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        pointerEvents: 'none',
      }}>
        {/* Trailing attached to notch implicitly */}
        <div style={{
          backgroundColor: '#000',
          height: 35,
          width: 35,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: -10,
        }}>
          <NuurGlyph size={16} color={tokens.gold} />
        </div>
      </div>
    </NotchContext>
  );
}
