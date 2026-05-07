import { HomeChrome, T, F, SkyBand, SunGlyph, MoonGlyph, GoldCornerGlow, arcPoint, glyphForState, accent, eyebrow, type State, type Skin } from './_shared';

type Prayer = {
  en: string;
  ar: string;
  time: string;
  t: number;
  glyph: 'sun' | 'moon';
};

export function Home_Large_Arc({ state = 'normal', skin = 'day' }: { state?: State; skin?: Skin } = {}) {
  const W = 338;
  const H = 338;
  const SKY_H = 200;
  const LABEL_BAND_H = 38;
  const g = glyphForState(state);
  const eyebrowColor = accent(state);
  const eyebrowText = eyebrow(state, skin);

  const prayers: Prayer[] = [
    { en: 'Fajr',    ar: 'الفجر',  time: '03:15', t: 0.04, glyph: 'moon' },
    { en: 'Sunrise', ar: 'الشروق', time: '05:30', t: 0.22, glyph: 'sun'  },
    { en: 'Dhuhr',   ar: 'الظهر',  time: '13:05', t: 0.50, glyph: 'sun'  },
    { en: 'Asr',     ar: 'العصر',  time: '16:34', t: 0.72, glyph: 'sun'  },
    { en: 'Maghrib', ar: 'المغرب', time: '18:42', t: 0.88, glyph: 'sun'  },
    { en: 'Isha',    ar: 'العشاء', time: '20:15', t: 0.99, glyph: 'moon' },
  ];

  const NEXT_INDEX = 3;
  const NOW_T = 0.56;
  const nextPrayer = prayers[NEXT_INDEX];
  const sunPt = arcPoint(W, SKY_H, NOW_T);
  const SUN_SIZE = 30 * g.intensity;

  return (
    <HomeChrome skin={skin} height={560}>
      <div style={{
        width: W, height: H,
        backgroundColor: T.surface,
        borderRadius: 22,
        border: `0.5px solid ${T.border}`,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: F.sans,
        boxShadow: '0 10px 18px rgba(0,0,0,0.35)',
      }}>
        <SkyBand skin={skin} state={state} height={SKY_H} />
        <GoldCornerGlow size={200} />

        {/* prayer glyphs riding the arc */}
        {prayers.map((p, i) => {
          const pt = arcPoint(W, SKY_H, p.t);
          const isPast = i < NEXT_INDEX;
          const isNext = i === NEXT_INDEX;
          const dotSize = isNext ? 10 : 7;
          const dotColor = isNext ? T.gold : (isPast ? T.textSecondary : T.text);
          const dotOpacity = isPast ? 0.5 : (isNext ? 1 : 0.85);
          return (
            <div key={p.en} style={{
              position: 'absolute',
              left: pt.x - dotSize / 2,
              top: pt.y - dotSize / 2,
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: dotColor,
              opacity: dotOpacity,
              zIndex: 2,
              boxShadow: isNext ? `0 0 8px ${T.gold}` : 'none',
              pointerEvents: 'none',
            }} />
          );
        })}

        {/* current sun position — larger, gold-glowing */}
        <div style={{
          position: 'absolute',
          left: sunPt.x - SUN_SIZE / 2,
          top: sunPt.y - SUN_SIZE / 2,
          zIndex: 3,
          pointerEvents: 'none',
        }}>
          {skin === 'day'
            ? <SunGlyph size={SUN_SIZE} intensity={g.intensity} />
            : <MoonGlyph size={SUN_SIZE} intensity={g.intensity} />}
        </div>

        {/* prayer labels — dark surface band immediately below sky, collision-clamped */}
        {(() => {
          const LABEL_W = 44;
          const PAD = 4;
          const minX = PAD + LABEL_W / 2;
          const maxX = W - PAD - LABEL_W / 2;
          const positions: number[] = prayers.map((p) =>
            Math.max(minX, Math.min(maxX, arcPoint(W, SKY_H, p.t).x))
          );
          // forward pass: push right to avoid overlap
          for (let i = 1; i < positions.length; i++) {
            const need = positions[i - 1] + LABEL_W + 1;
            if (positions[i] < need) positions[i] = need;
          }
          // backward pass: if last exceeds maxX, push neighbors left
          for (let i = positions.length - 1; i >= 0; i--) {
            if (positions[i] > maxX) positions[i] = maxX;
            if (i > 0) {
              const limit = positions[i] - LABEL_W - 1;
              if (positions[i - 1] > limit) positions[i - 1] = limit;
            }
          }
          return (
            <div style={{
              position: 'absolute',
              left: 0, right: 0,
              top: SKY_H,
              height: LABEL_BAND_H,
              zIndex: 4,
              pointerEvents: 'none',
            }}>
              {prayers.map((p, i) => {
                const isPast = i < NEXT_INDEX;
                const isNext = i === NEXT_INDEX;
                const labelColor = isNext ? T.gold : T.text;
                const labelOpacity = isPast ? 0.45 : (isNext ? 1 : 0.85);
                return (
                  <div key={p.en} style={{
                    position: 'absolute',
                    left: positions[i],
                    top: 4,
                    width: LABEL_W,
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    opacity: labelOpacity,
                    gap: 2,
                  }}>
                    <span style={{
                      fontSize: 8.5,
                      fontWeight: 700,
                      letterSpacing: 1.2,
                      color: labelColor,
                      whiteSpace: 'nowrap',
                    }}>{p.en.toUpperCase()}</span>
                    <span style={{
                      fontSize: 10,
                      fontFamily: F.sans,
                      fontFeatureSettings: '"tnum"',
                      fontWeight: 600,
                      color: labelColor,
                    }}>{p.time}</span>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* hero countdown — bottom of card, on dark surface */}
        <div style={{
          position: 'absolute',
          left: 0, right: 0,
          top: SKY_H + LABEL_BAND_H,
          bottom: 0,
          padding: '12px 18px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          zIndex: 3,
          borderTop: `0.5px solid ${T.border}`,
        }}>
          <div style={{ fontSize: 9, letterSpacing: 2, fontWeight: 700, color: eyebrowColor, marginBottom: 4 }}>
            {eyebrowText}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontFamily: F.serif, fontSize: 40, lineHeight: 1, color: T.text, letterSpacing: '-0.02em' }}>3</span>
            <span style={{ fontFamily: F.serif, fontSize: 24, color: T.gold, paddingLeft: 1, paddingRight: 4 }}>h</span>
            <span style={{ fontFamily: F.serif, fontSize: 40, lineHeight: 1, color: T.text, letterSpacing: '-0.02em' }}>22</span>
            <span style={{ fontFamily: F.serif, fontSize: 24, color: T.gold, paddingLeft: 2 }}>m</span>
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{nextPrayer.en}</span>
              <span style={{ fontSize: 13, color: T.gold, fontFamily: F.arabic }}>{nextPrayer.ar}</span>
            </span>
          </div>
        </div>
      </div>
    </HomeChrome>
  );
}
