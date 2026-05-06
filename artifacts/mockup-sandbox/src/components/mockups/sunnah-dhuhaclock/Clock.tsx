import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Moon, Sun, Sunrise, Sunset, Circle } from 'lucide-react';
import './_hypothesis.css';

const BG = '#0A1A0E';
const SURFACE = '#111F14';
const SURFACE_HI = '#172B1B';
const BORDER = '#1F3526';
const TEXT = '#F0EDE5';
const TEXT_DIM = '#8FA99A';
const TEXT_MUTE = '#5C7264';
const GOLD = '#F4C842';
const GOLD_LIGHT = '#F9D97A';
const GOLD_DARK = '#C99A2A';

const SANS = 'Inter, ui-sans-serif, system-ui, sans-serif';
const SERIF = 'ui-serif, Georgia, "Iowan Old Style", serif';
const ARABIC = '"Amiri Quran", "Scheherazade New", "Noto Naskh Arabic", serif';

function Floret({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} stroke={GOLD} strokeWidth="0.8" fill="none" opacity="0.7">
      <circle cx="0" cy="0" r="2.2" fill={GOLD} opacity="0.9" />
      <path d="M0 -8 Q 3 -3 0 0 Q -3 -3 0 -8 Z" fill={GOLD} opacity="0.5" />
      <path d="M0 8 Q 3 3 0 0 Q -3 3 0 8 Z" fill={GOLD} opacity="0.5" />
      <path d="M-8 0 Q -3 3 0 0 Q -3 -3 -8 0 Z" fill={GOLD} opacity="0.5" />
      <path d="M8 0 Q 3 3 0 0 Q 3 -3 8 0 Z" fill={GOLD} opacity="0.5" />
    </g>
  );
}

const timelineData = [
  { id: 'tahajjud', time: '03:00', type: 'sunnah', nameEn: 'Tahajjud', nameAr: 'التهجد', status: 'Recommended', rakaat: '2 by 2', reward: 'The most virtuous prayer after the obligatory.' },
  { id: 'fajr_sunnah', time: '05:35', type: 'sunnah', nameEn: 'Before Fajr', nameAr: 'سنة الفجر', status: "Mu'akkadah", rakaat: '2', reward: 'Better than the world and all that is in it.' },
  { id: 'fajr', time: '05:42', type: 'fard', name: 'Fajr', icon: Sunrise },
  { id: 'duha', time: '09:00', type: 'sunnah', nameEn: 'Ṣalāt al-Ḍuḥā', nameAr: 'صلاة الضحى', status: 'Recommended', rakaat: '2 to 8', reward: 'Suffices as charity for every joint in the body each morning.' },
  { id: 'dhuhr_before', time: '12:35', type: 'sunnah', nameEn: 'Before Dhuhr', nameAr: 'قبل الظهر', status: "Mu'akkadah", rakaat: '2 or 4', reward: 'Allah builds for them a house in Paradise.' },
  { id: 'dhuhr', time: '12:48', type: 'fard', name: 'Dhuhr', icon: Sun },
  { id: 'dhuhr_after', time: '13:10', type: 'sunnah', nameEn: 'After Dhuhr', nameAr: 'بعد الظهر', status: "Mu'akkadah", rakaat: '2', reward: 'Counted within the 12 sunnah rakʿahs.' },
  { id: 'asr_before', time: '16:00', type: 'sunnah', nameEn: 'Before ʿAṣr', nameAr: 'قبل العصر', status: "Ghayr Mu'akkadah", rakaat: '4', reward: 'May Allah have mercy on the one who prays four before ʿAṣr.' },
  { id: 'asr', time: '16:14', type: 'fard', name: 'Asr', icon: Sun },
  { id: 'maghrib', time: '19:31', type: 'fard', name: 'Maghrib', icon: Sunset },
  { id: 'maghrib_after', time: '19:50', type: 'sunnah', nameEn: 'After Maghrib', nameAr: 'بعد المغرب', status: "Mu'akkadah", rakaat: '2', reward: 'Part of the 12 rawātib of Paradise.' },
  { id: 'isha', time: '21:02', type: 'fard', name: 'Isha', icon: Moon },
  { id: 'isha_after', time: '21:20', type: 'sunnah', nameEn: 'After ʿIshāʾ', nameAr: 'بعد العشاء', status: "Mu'akkadah", rakaat: '2', reward: 'Completes the 12 rawātib.' },
  { id: 'witr', time: '22:00', type: 'sunnah', nameEn: 'Witr', nameAr: 'الوتر', status: 'Recommended', rakaat: '1, 3, 5...', reward: 'Allah is Witr (One) and loves the witr.' },
  { id: 'tarawih', time: '22:30', type: 'sunnah', nameEn: 'Tarāwīḥ', nameAr: 'التراويح', status: 'Recommended', rakaat: '8 or 20', reward: 'His past sins are forgiven.', note: 'Ramaḍān only' },
];

const occasionSunnahs = [
  { id: 'tahiyyat', nameEn: 'Taḥiyyat al-Masjid', nameAr: 'تحية المسجد', rakaat: '2' },
  { id: 'wudu', nameEn: 'After Wuḍūʾ', nameAr: 'ركعتا الوضوء', rakaat: '2' },
  { id: 'istikhara', nameEn: 'Istikhāra', nameAr: 'صلاة الاستخارة', rakaat: '2' },
  { id: 'tawbah', nameEn: 'Tawbah', nameAr: 'صلاة التوبة', rakaat: '2' },
  { id: 'eid', nameEn: 'ʿĪdayn', nameAr: 'صلاة العيدين', rakaat: '2' },
  { id: 'kusuf', nameEn: 'Kusūf / Eclipse', nameAr: 'صلاة الكسوف', rakaat: '2' },
  { id: 'istisqa', nameEn: 'Istisqāʾ / Rain', nameAr: 'صلاة الاستسقاء', rakaat: '2' },
];

export function Clock() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const renderBadge = (status: string) => {
    if (status === "Mu'akkadah") {
      return (
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', backgroundColor: GOLD, color: BG, padding: '2px 6px', borderRadius: 4 }}>
          MU'AKKADAH
        </span>
      );
    }
    if (status === "Ghayr Mu'akkadah") {
      return (
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', borderColor: GOLD, borderWidth: 1, borderStyle: 'solid', color: GOLD, padding: '1px 5px', borderRadius: 4 }}>
          GHAYR MU'AKKADAH
        </span>
      );
    }
    return (
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', borderColor: TEXT_DIM, borderWidth: 1, borderStyle: 'solid', color: TEXT_DIM, padding: '1px 5px', borderRadius: 4 }}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="w-full min-h-screen mx-auto relative overflow-hidden" style={{ backgroundColor: BG, color: TEXT, fontFamily: SANS, maxWidth: 390 }}>
      <div className="w-full h-full overflow-y-auto no-scroll pb-24">
        
        {/* HEADER */}
        <div className="pt-12 pb-6 px-6 text-center relative">
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', color: GOLD_DARK, marginBottom: 8, display: 'block' }}>
            12 RAMAḌĀN 1446
          </span>
          <h1 style={{ fontSize: 28, fontFamily: SERIF, color: TEXT, marginBottom: 4 }}>
            Sunnah Prayers
          </h1>
          <p style={{ fontSize: 14, color: TEXT_DIM }}>
            The celestial rhythm of voluntary worship
          </p>
        </div>

        {/* TIMELINE */}
        <div className="relative px-4 py-8">
          {/* Timeline axis line */}
          <div className="absolute top-0 bottom-0 left-12 w-[2px]" style={{
            background: 'linear-gradient(to bottom, #1E293B, ' + GOLD_DARK + ' 30%, ' + GOLD_LIGHT + ' 50%, ' + TEXT_DIM + ' 70%, #1E293B)',
            opacity: 0.3
          }} />

          {/* Current Time Indicator (Now) */}
          <div className="absolute left-4 right-4 flex items-center z-20 pointer-events-none" style={{ top: '48%' }}>
            <div style={{ width: 44, textAlign: 'right', paddingRight: 10, fontSize: 12, fontWeight: 600, color: GOLD_LIGHT, fontFamily: SANS }}>14:30</div>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: GOLD, position: 'absolute', left: 27, top: '50%', transform: 'translateY(-50%)', animation: 'glow-now 2s infinite' }} />
            <div className="flex-1 h-[1px]" style={{ backgroundColor: GOLD, opacity: 0.5, boxShadow: '0 0 8px rgba(244,200,66,0.8)' }} />
          </div>

          <div className="flex flex-col gap-6 relative z-10">
            {timelineData.map((item, i) => {
              const isFard = item.type === 'fard';
              const isExpanded = expandedId === item.id;
              
              if (isFard) {
                const Icon = item.icon || Circle;
                return (
                  <div key={item.id} className="flex items-center gap-4 py-2">
                    <div style={{ width: 44, textAlign: 'right', fontSize: 14, fontWeight: 600, color: TEXT, fontVariantNumeric: 'tabular-nums' }}>
                      {item.time}
                    </div>
                    <div className="relative flex justify-center w-4">
                      <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: SURFACE_HI, border: '2px solid ' + GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                        <Icon size={10} color={GOLD} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <span style={{ fontSize: 18, fontFamily: SERIF, color: TEXT }}>{item.name}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.id} className="flex gap-4">
                  <div style={{ width: 44, textAlign: 'right', paddingTop: 10, fontSize: 13, color: TEXT_DIM, fontVariantNumeric: 'tabular-nums' }}>
                    {item.time}
                  </div>
                  <div className="relative flex justify-center w-4 pt-3">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: SURFACE, border: '1.5px solid ' + BORDER, zIndex: 10 }} />
                  </div>
                  <div className="flex-1">
                    <div 
                      className="cursor-pointer group flex flex-col transition-all duration-300"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 12,
                        backgroundColor: isExpanded ? SURFACE_HI : SURFACE,
                        border: '1px solid ' + (isExpanded ? GOLD_DARK + '66' : BORDER),
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                          <span style={{ fontSize: 15, fontWeight: 500, color: TEXT, fontFamily: SANS }}>{item.nameEn}</span>
                          <span style={{ fontSize: 12, color: GOLD, fontWeight: 500 }}>{item.rakaat} raka'āt</span>
                        </div>
                        <span style={{ fontSize: 16, color: TEXT_DIM, fontFamily: ARABIC }}>{item.nameAr}</span>
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-4 pt-3" style={{ borderTop: '1px solid ' + BORDER }}>
                          <div className="flex items-center gap-2 mb-2">
                            {renderBadge(item.status || 'Recommended')}
                            {item.note && <span style={{ fontSize: 9, color: TEXT_DIM }}>{item.note}</span>}
                          </div>
                          <p style={{ fontSize: 13, color: TEXT_DIM, lineHeight: 1.4 }}>
                            {item.reward}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-center py-6 w-full" style={{ gap: 16 }}>
          <div style={{ height: 1, flex: 1, background: 'linear-gradient(to left, ' + GOLD + '33, transparent)' }} />
          <svg width="16" height="16" viewBox="-12 -12 24 24">
            <Floret x={0} y={0} />
          </svg>
          <div style={{ height: 1, flex: 1, background: 'linear-gradient(to right, ' + GOLD + '33, transparent)' }} />
        </div>

        {/* OCCASION SUNNAHS */}
        <div className="px-6 mb-8">
          <h2 style={{ fontSize: 16, fontFamily: SERIF, color: GOLD_LIGHT, marginBottom: 4, textAlign: 'center' }}>Occasional Sunnahs</h2>
          <p style={{ fontSize: 12, color: TEXT_DIM, textAlign: 'center', marginBottom: 16 }}>Prayers for specific moments</p>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {occasionSunnahs.map((item) => (
              <div 
                key={item.id}
                className="flex items-center gap-2"
                style={{
                  padding: '8px 12px',
                  borderRadius: 20,
                  backgroundColor: SURFACE,
                  border: '1px solid ' + BORDER
                }}
              >
                <span style={{ fontSize: 13, color: TEXT, fontWeight: 500 }}>{item.nameEn}</span>
                <span style={{ fontSize: 11, color: GOLD }}>{item.rakaat}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
