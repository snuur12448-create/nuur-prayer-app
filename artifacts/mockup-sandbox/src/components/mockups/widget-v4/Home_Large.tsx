import { HomeChrome, T, F, DATA, SkyBand, SunGlyph, MoonGlyph, GoldCornerGlow, arcPoint } from './_shared';

export function Home_Large() {
  const d = DATA.day;
  const W = 338, SKY_H = 60, GLYPH = 26, ARC_T = 0.55;
  const pt = arcPoint(W, SKY_H, ARC_T);
  const allPrayers = [
    { en: 'Fajr', ar: 'الفجر', time: '03:15', glyph: 'moon' as const, dim: true },
    { en: 'Sunrise', ar: 'الشروق', time: '05:30', glyph: 'sun' as const, dim: true },
    { en: 'Dhuhr', ar: 'الظهر', time: '13:05', glyph: 'sun' as const, dim: true },
    { en: 'Asr', ar: 'العصر', time: '16:34', glyph: 'sun' as const, dim: false, next: true },
    { en: 'Maghrib', ar: 'المغرب', time: '18:42', glyph: 'sun' as const, dim: false },
    { en: 'Isha', ar: 'العشاء', time: '20:15', glyph: 'moon' as const, dim: false },
  ];
  return (
    <HomeChrome skin="day" height={560}>
      <div style={{
        width: W, height: 338,
        backgroundColor: T.surface,
        borderRadius: 22,
        border: `0.5px solid ${T.border}`,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: F.sans,
        boxShadow: '0 10px 18px rgba(0,0,0,0.35)',
      }}>
        <SkyBand skin="day" state="normal" height={SKY_H} />
        <GoldCornerGlow size={180} />
        <div style={{ position: 'absolute', left: pt.x - GLYPH / 2, top: pt.y - GLYPH / 2, zIndex: 2, pointerEvents: 'none' }}>
          <SunGlyph size={GLYPH} />
        </div>

        {/* Hero: TO ASR / countdown */}
        <div style={{ position: 'relative', zIndex: 3, padding: '14px 18px 12px' }}>
          <div style={{ fontSize: 9, letterSpacing: 2, fontWeight: 700, color: T.gold, marginBottom: 4 }}>
            {d.countdownLabel}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontFamily: F.serif, fontSize: 40, lineHeight: 1, color: T.text, letterSpacing: '-0.02em' }}>{d.countdownH}</span>
            <span style={{ fontFamily: F.serif, fontSize: 24, color: T.gold, paddingLeft: 1, paddingRight: 4 }}>h</span>
            <span style={{ fontFamily: F.serif, fontSize: 40, lineHeight: 1, color: T.text, letterSpacing: '-0.02em' }}>{d.countdownM}</span>
            <span style={{ fontFamily: F.serif, fontSize: 24, color: T.gold, paddingLeft: 2 }}>m</span>
            <span style={{ marginLeft: 'auto', fontSize: 13, color: T.textSecondary, fontFamily: F.sans }}>at {d.nextAt}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: T.text }}>{d.prayerEn}</span>
            <span style={{ fontSize: 15, color: T.gold, fontFamily: F.arabic }}>{d.prayerAr}</span>
          </div>
        </div>

        {/* divider */}
        <div style={{ height: 0.5, backgroundColor: T.border, marginLeft: 18, marginRight: 18 }} />

        {/* All 6 prayer rows */}
        <div style={{ position: 'relative', zIndex: 3, padding: '6px 18px 14px', display: 'flex', flexDirection: 'column' }}>
          {allPrayers.map((p) => {
            const isNext = p.next;
            const txtColor = p.dim ? T.textSecondary : T.text;
            return (
              <div key={p.en} style={{
                display: 'flex', alignItems: 'center', gap: 10, paddingTop: 6, paddingBottom: 6,
                borderBottom: `0.5px dashed ${T.border}`,
              }}>
                <div style={{ width: 18, display: 'flex', justifyContent: 'center' }}>
                  {p.glyph === 'sun' ? <SunGlyph size={14} opacity={p.dim ? 0.5 : 1} /> : <MoonGlyph size={14} opacity={p.dim ? 0.5 : 1} />}
                </div>
                <span style={{ fontSize: 13, fontWeight: isNext ? 700 : 500, color: isNext ? T.gold : txtColor, letterSpacing: '-0.01em', minWidth: 60 }}>{p.en}</span>
                <span style={{ fontSize: 12, color: isNext ? T.gold : txtColor, fontFamily: F.arabic, opacity: p.dim ? 0.7 : 0.95 }}>{p.ar}</span>
                <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: isNext ? T.gold : txtColor, fontFamily: F.sans, fontFeatureSettings: '"tnum"' }}>{p.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </HomeChrome>
  );
}
