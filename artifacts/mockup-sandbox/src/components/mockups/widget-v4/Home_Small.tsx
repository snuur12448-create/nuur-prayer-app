import { HomeChrome, T, F, DATA, SkyBand, SunGlyph, GoldCornerGlow, arcPoint, getSkyHorizon } from './_shared';

export function Home_Small() {
  const d = DATA.day;
  const W = 158, SKY_H = 44, GLYPH = 20, ARC_T = 0.55;
  const pt = arcPoint(W, SKY_H, ARC_T);
  return (
    <HomeChrome skin="day" height={400}>
      <div style={{
        width: W, height: 158,
        backgroundColor: T.surface,
        borderRadius: 22,
        border: `0.5px solid ${T.border}`,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: F.sans,
        boxShadow: '0 8px 14px rgba(0,0,0,0.3)',
      }}>
        <SkyBand skin="day" state="normal" height={SKY_H} />
        <GoldCornerGlow size={120} />
        <div style={{ position: 'absolute', left: pt.x - GLYPH / 2, top: pt.y - GLYPH / 2, zIndex: 2, pointerEvents: 'none' }}>
          <SunGlyph size={GLYPH} />
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
