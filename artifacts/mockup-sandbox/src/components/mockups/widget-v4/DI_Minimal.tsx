import { NotchChrome, SunGlyph } from './_shared';

export function DI_Minimal() {
  return (
    <NotchChrome height={120}>
      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        width: 180, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        pointerEvents: 'none',
      }}>
        {/* notch */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: 124, height: 36, backgroundColor: '#000', borderRadius: 18 }} />
        {/* trailing micro pill — single sun glyph */}
        <div style={{ position: 'absolute', right: 0, width: 32, height: 32, backgroundColor: '#000', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SunGlyph size={16} />
        </div>
      </div>
    </NotchChrome>
  );
}
