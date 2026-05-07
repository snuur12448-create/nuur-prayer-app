import { HomeChrome, T, F, DATA, SkyBand, SunGlyph, MoonGlyph, GoldCornerGlow, arcPoint, glyphForState, accent, eyebrow, type State, type Skin } from './_shared';

export function Home_Medium({ state = 'normal', skin = 'day' }: { state?: State; skin?: Skin } = {}) {
  const d = DATA[skin];
  const g = glyphForState(state);
  const W = 338, SKY_H = 46, GLYPH = 22;
  const pt = arcPoint(W, SKY_H, g.arcT);
  const eyebrowColor = accent(state);
  const eyebrowText = eyebrow(state, skin);
  return (
    <HomeChrome skin={skin} height={400}>
      <div style={{
        width: W, height: 158,
        backgroundColor: T.surface,
        borderRadius: 22,
        border: `0.5px solid ${T.border}`,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: F.sans,
        boxShadow: '0 8px 14px rgba(0,0,0,0.3)',
        display: 'flex',
      }}>
        <SkyBand skin={skin} state={state} height={SKY_H} />
        <GoldCornerGlow />
        <div style={{ position: 'absolute', left: pt.x - GLYPH / 2, top: pt.y - GLYPH / 2, zIndex: 2, pointerEvents: 'none' }}>
          {skin === 'day' ? <SunGlyph size={GLYPH} intensity={g.intensity} /> : <MoonGlyph size={GLYPH} intensity={g.intensity} />}
        </div>

        {/* Left: countdown */}
        <div style={{ flex: 1.1, padding: '14px 16px', position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ fontSize: 9, letterSpacing: 2, fontWeight: 700, color: eyebrowColor, marginBottom: 4 }}>
            {eyebrowText}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontFamily: F.serif, fontSize: 38, lineHeight: 1, color: T.text, letterSpacing: '-0.02em' }}>{d.countdownH}</span>
            <span style={{ fontFamily: F.serif, fontSize: 22, color: T.gold, paddingLeft: 1, paddingRight: 4 }}>h</span>
            <span style={{ fontFamily: F.serif, fontSize: 38, lineHeight: 1, color: T.text, letterSpacing: '-0.02em' }}>{d.countdownM}</span>
            <span style={{ fontFamily: F.serif, fontSize: 22, color: T.gold, paddingLeft: 2 }}>m</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: '-0.01em' }}>{d.prayerEn}</span>
            <span style={{ fontSize: 14, color: T.gold, fontFamily: F.arabic }}>{d.prayerAr}</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 0.5, backgroundColor: T.border, alignSelf: 'stretch', margin: '20px 0', zIndex: 3 }} />

        {/* Right: next 3 prayers */}
        <div style={{ flex: 1, padding: '14px 16px', position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 9 }}>
          {[
            { label: 'MAGHRIB', time: '18:42' },
            { label: 'ISHA', time: '20:15' },
            { label: 'SUNRISE', time: '05:30' },
          ].map((row) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: T.textSecondary }}>{row.label}</span>
              <span style={{ fontSize: 14, fontFamily: F.sans, fontWeight: 600, color: T.text, fontFeatureSettings: '"tnum"' }}>{row.time}</span>
            </div>
          ))}
        </div>
      </div>
    </HomeChrome>
  );
}
