import React from 'react';
import { Feather } from 'lucide-react';

const BG = '#F4EFE4';
const INK = '#2A251D';
const INK_FADE = '#7A6E5C';
const GOLD = '#B8860B';
const HAIR = '#C9BFA6';
const PAPER_LINE = '#E7DEC6';

type Prayer = { name: string; time: string; done: boolean };

const PRAYERS: Prayer[] = [
  { name: 'Fajr', time: '05:42', done: true },
  { name: 'Dhuhr', time: '12:48', done: true },
  { name: 'Asr', time: '16:14', done: true },
  { name: 'Maghrib', time: '19:31', done: false },
  { name: 'Isha', time: '21:02', done: false },
];

const MONTH_DAYS: number[] = [
  5, 5, 4, 5, 3, 2, 0,
  5, 4, 5, 5, 5, 3, 4,
  5, 5, 4, 3, 5, 5, 2,
  5, 5, 5, 4, 5, 5, 3,
];

const SERIF = `'Cochin', 'Iowan Old Style', 'Apple Garamond', Georgia, 'Times New Roman', serif`;

function InkSquare({ level }: { level: number }) {
  const fills = ['transparent', '25%', '50%', '75%', '90%', '100%'];
  const pct = fills[Math.min(level, 5)];
  return (
    <div
      className="relative cursor-pointer hover:opacity-80 transition-opacity"
      style={{
        width: 18,
        height: 18,
        border: `1.2px solid ${INK}`,
        borderRadius: 1,
        background: BG,
        boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.05)',
      }}
    >
      {level > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 1,
            right: 1,
            bottom: 1,
            height: pct,
            background: INK,
            opacity: 0.88,
          }}
        />
      )}
    </div>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div
      className="cursor-pointer hover:opacity-80 transition-opacity inline-flex items-center justify-center"
      style={{
        width: 22,
        height: 22,
        border: `1.4px solid ${INK}`,
        borderRadius: 2,
        background: BG,
        transform: 'rotate(-0.5deg)',
        boxShadow: '0.5px 0.5px 0 rgba(0,0,0,0.04)',
      }}
    >
      {checked && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M2.5 8.5 L6.5 12.5 L13.5 3.5"
            stroke={INK}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      )}
    </div>
  );
}

export default function Journal() {
  const paperTexture = `repeating-linear-gradient(0deg, ${PAPER_LINE}22 0px, ${PAPER_LINE}22 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, transparent 0px, transparent 60px, ${PAPER_LINE}11 60px, ${PAPER_LINE}11 61px)`;

  return (
    <div
      className="w-full min-h-[844px] max-h-[844px] max-w-[390px] mx-auto overflow-hidden"
      style={{ background: BG, color: INK, fontFamily: SERIF }}
    >
      <div
        className="w-full h-full overflow-y-auto"
        style={{ backgroundImage: paperTexture }}
      >
        {/* HEADER */}
        <div className="px-7 pt-10 pb-4" style={{ minHeight: 120 }}>
          <div className="flex items-start justify-between">
            <div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 38,
                  lineHeight: 1.0,
                  letterSpacing: '-0.01em',
                  fontWeight: 500,
                }}
              >
                Tuesday
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: 'italic',
                  fontSize: 15,
                  marginTop: 4,
                  color: INK_FADE,
                }}
              >
                the eleventh of November
              </div>
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 10.5,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: INK_FADE,
                textAlign: 'right',
                marginTop: 8,
                lineHeight: 1.5,
              }}
            >
              21 Jumādā<br />al-Ūlā 1447
            </div>
          </div>
          <div
            style={{
              marginTop: 18,
              height: 1,
              background: HAIR,
              opacity: 0.9,
            }}
          />
        </div>

        {/* TODAY'S ENTRIES */}
        <div className="px-7" style={{ minHeight: 340 }}>
          <div
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: GOLD,
              marginBottom: 18,
            }}
          >
            · today's entries ·
          </div>

          <div className="flex flex-col" style={{ gap: 18 }}>
            {PRAYERS.map((p) => {
              const faded = !p.done;
              return (
                <div
                  key={p.name}
                  className="flex items-center cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ opacity: faded ? 0.5 : 1 }}
                >
                  <Checkbox checked={p.done} />
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontStyle: 'italic',
                      fontSize: 22,
                      marginLeft: 14,
                      letterSpacing: '0.005em',
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    className="flex-1 mx-3"
                    style={{
                      borderBottom: `1.5px dotted ${INK}`,
                      opacity: 0.35,
                      marginTop: 8,
                    }}
                  />
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: 17,
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {p.time}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 22,
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontSize: 12.5,
              color: INK_FADE,
              textAlign: 'right',
            }}
          >
            three of five — kept faithfully.
          </div>
        </div>

        {/* STREAK RIBBON */}
        <div className="px-7 mt-6" style={{ minHeight: 80 }}>
          <div
            className="relative cursor-pointer hover:opacity-95 transition-opacity"
            style={{
              background: `linear-gradient(180deg, #EFE6CF 0%, #E8DEC0 50%, #DFD4B0 100%)`,
              border: `0.8px solid ${HAIR}`,
              padding: '12px 20px',
              boxShadow: 'inset 0 0 0 1px rgba(184,134,11,0.08), 0 1px 0 rgba(0,0,0,0.03)',
            }}
          >
            {/* ribbon notches */}
            <div
              style={{
                position: 'absolute',
                left: -1,
                top: 0,
                bottom: 0,
                width: 10,
                background: `linear-gradient(135deg, ${BG} 50%, transparent 50%) top left / 10px 10px no-repeat, linear-gradient(45deg, ${BG} 50%, transparent 50%) bottom left / 10px 10px no-repeat`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: -1,
                top: 0,
                bottom: 0,
                width: 10,
                background: `linear-gradient(225deg, ${BG} 50%, transparent 50%) top right / 10px 10px no-repeat, linear-gradient(315deg, ${BG} 50%, transparent 50%) bottom right / 10px 10px no-repeat`,
              }}
            />
            <div className="flex items-center justify-center" style={{ gap: 12 }}>
              <span style={{ color: GOLD, fontSize: 14, letterSpacing: '0.3em' }}>❦</span>
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: 'italic',
                  fontSize: 18,
                  color: INK,
                  letterSpacing: '0.01em',
                }}
              >
                fourteen consecutive days
              </div>
              <span style={{ color: GOLD, fontSize: 14, letterSpacing: '0.3em' }}>❦</span>
            </div>
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: SERIF,
              fontSize: 10.5,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: INK_FADE,
              textAlign: 'center',
            }}
          >
            next mark · thirty days · sixteen to go
          </div>
        </div>

        {/* THIS WEEK PARAGRAPH */}
        <div className="px-7 mt-7" style={{ minHeight: 120 }}>
          <div
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: GOLD,
              marginBottom: 10,
            }}
          >
            · this week ·
          </div>
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 15.5,
              lineHeight: 1.75,
              color: INK,
              letterSpacing: '0.005em',
            }}
          >
            This week you have prayed{' '}
            <span style={{ fontStyle: 'italic' }}>twenty-four</span> of{' '}
            <span style={{ fontStyle: 'italic' }}>thirty-five</span> appointed
            prayers — Monday and Tuesday were complete; Thursday and Friday too.
            Saturday and Sunday only the obligatory three.
          </p>
        </div>

        {/* MONTH */}
        <div className="px-7 mt-7 pb-10" style={{ minHeight: 140 }}>
          <div className="flex items-baseline justify-between mb-4">
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: 'italic',
                fontSize: 11,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: GOLD,
              }}
            >
              · the month ·
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 16,
                letterSpacing: '0.18em',
                color: INK,
              }}
            >
              XI · MMXXV
            </div>
          </div>

          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 8,
              justifyItems: 'center',
            }}
          >
            {MONTH_DAYS.map((c, i) => (
              <InkSquare key={i} level={c} />
            ))}
          </div>

          <div
            className="flex items-center justify-between mt-5"
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontSize: 11,
              color: INK_FADE,
            }}
          >
            <span>four weeks past</span>
            <span className="flex items-center gap-2">
              <span>less</span>
              <InkSquare level={0} />
              <InkSquare level={2} />
              <InkSquare level={4} />
              <InkSquare level={5} />
              <span>more</span>
            </span>
          </div>

          <div
            className="flex items-center justify-center gap-2 mt-8 cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontSize: 13,
              color: GOLD,
              letterSpacing: '0.05em',
            }}
          >
            <Feather size={14} />
            <span>open the journal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
