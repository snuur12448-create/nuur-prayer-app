import { NotchChrome, T, F, SunGlyph, DATA } from './_shared';

export function DI_Compact() {
  const d = DATA.day;
  return (
    <NotchChrome height={120}>
      <div style={{
        position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
        width: 320, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* hardware notch shape (invisible against black bezel — correct rendering) */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: 124, height: 38, backgroundColor: '#000', borderRadius: 19, zIndex: 5 }} />

        {/* leading pill — sun glyph + hours */}
        <div style={{ height: 40, padding: '0 14px 0 8px', backgroundColor: '#000', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6, zIndex: 6 }}>
          <SunGlyph size={22} />
          <span style={{ fontFamily: F.serif, fontSize: 18, fontWeight: 600, color: T.gold, fontFeatureSettings: '"tnum"', lineHeight: 1 }}>
            {d.countdownH}h
          </span>
        </div>

        {/* trailing pill — minutes (single unit, never split) */}
        <div style={{ height: 40, padding: '0 16px', backgroundColor: '#000', borderRadius: 20, display: 'flex', alignItems: 'center', zIndex: 6 }}>
          <span style={{ fontFamily: F.serif, fontSize: 19, fontWeight: 600, color: T.text, fontFeatureSettings: '"tnum"', lineHeight: 1 }}>
            {d.countdownM}m
          </span>
        </div>
      </div>
    </NotchChrome>
  );
}
