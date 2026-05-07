import { HomeChrome, T, F, DATA, SkyBand, SunGlyph, GoldCornerGlow } from './_shared';

export function Home_Small() {
  const d = DATA.day;
  return (
    <HomeChrome skin="day" height={400}>
      <div style={{
        width: 158, height: 158,
        backgroundColor: T.surface,
        borderRadius: 22,
        border: `0.5px solid ${T.border}`,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: F.sans,
        boxShadow: '0 8px 14px rgba(0,0,0,0.3)',
      }}>
        <SkyBand skin="day" height={28} />
        <GoldCornerGlow size={120} />
        <div style={{ position: 'absolute', top: 5, right: 8, zIndex: 2 }}>
          <SunGlyph size={20} />
        </div>

        <div style={{ position: 'absolute', inset: 0, padding: '14px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 3 }}>
          <div style={{ fontSize: 8.5, letterSpacing: 1.8, fontWeight: 700, color: T.gold, marginBottom: 4 }}>
            {d.countdownLabel}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontFamily: F.serif, fontSize: 30, lineHeight: 1, color: T.text, letterSpacing: '-0.02em' }}>{d.countdownH}</span>
            <span style={{ fontFamily: F.serif, fontSize: 18, color: T.gold, paddingLeft: 1, paddingRight: 4 }}>h</span>
            <span style={{ fontFamily: F.serif, fontSize: 30, lineHeight: 1, color: T.text, letterSpacing: '-0.02em' }}>{d.countdownM}</span>
            <span style={{ fontFamily: F.serif, fontSize: 18, color: T.gold, paddingLeft: 2 }}>m</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: '-0.01em' }}>{d.prayerEn}</span>
            <span style={{ fontSize: 12, color: T.gold, fontFamily: F.arabic }}>{d.prayerAr}</span>
          </div>
        </div>
      </div>
    </HomeChrome>
  );
}
