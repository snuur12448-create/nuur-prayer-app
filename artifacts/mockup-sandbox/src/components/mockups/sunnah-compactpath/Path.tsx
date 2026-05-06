import React, { useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';

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

type NodeStatus = 'done' | 'missed' | 'current' | 'future';

type PathNode = {
  id: string;
  time: string;
  nameEn: string;
  nameAr: string;
  rakaat: string;
  statusType: 'Mu\'akkadah' | 'Ghayr Mu\'akkadah' | 'Recommended' | 'Sunnah' | 'Disputed';
  status: NodeStatus;
};

const PATH_DATA: PathNode[] = [
  { id: 'fajr', time: '05:30', nameEn: 'Before Fajr', nameAr: 'سنة الفجر', rakaat: '2 raka\'āt', statusType: 'Mu\'akkadah', status: 'done' },
  { id: 'dhuhr-before', time: '12:35', nameEn: 'Before Dhuhr', nameAr: 'قبل الظهر', rakaat: '2 or 4 raka\'āt', statusType: 'Mu\'akkadah', status: 'missed' },
  { id: 'dhuhr-after', time: '13:00', nameEn: 'After Dhuhr', nameAr: 'بعد الظهر', rakaat: '2 raka\'āt', statusType: 'Mu\'akkadah', status: 'missed' },
  { id: 'asr-before', time: '15:50', nameEn: 'Before ʿAṣr', nameAr: 'قبل العصر', rakaat: '4 raka\'āt', statusType: 'Ghayr Mu\'akkadah', status: 'current' },
  { id: 'maghrib-after', time: '19:35', nameEn: 'After Maghrib', nameAr: 'بعد المغرب', rakaat: '2 raka\'āt', statusType: 'Mu\'akkadah', status: 'future' },
  { id: 'isha-after', time: '21:10', nameEn: 'After ʿIshāʾ', nameAr: 'بعد العشاء', rakaat: '2 raka\'āt', statusType: 'Mu\'akkadah', status: 'future' },
  { id: 'witr', time: '21:30', nameEn: 'Witr', nameAr: 'الوتر', rakaat: '1, 3, 5...', statusType: 'Recommended', status: 'future' },
  { id: 'tahajjud', time: '04:00', nameEn: 'Tahajjud', nameAr: 'التهجد', rakaat: '2 by 2', statusType: 'Recommended', status: 'future' },
];

export function Path() {
  const [nodes, setNodes] = useState<PathNode[]>(PATH_DATA);

  const toggleDone = (id: string) => {
    setNodes(nodes.map(n => {
      if (n.id === id && (n.status === 'done' || n.status === 'missed' || n.status === 'current')) {
        return { ...n, status: n.status === 'done' ? (n.id === 'asr-before' ? 'current' : 'missed') : 'done' };
      }
      return n;
    }));
  };

  const renderBadge = (statusType: string, status: NodeStatus) => {
    const isFuture = status === 'future';
    const isMissed = status === 'missed';
    const dimmed = isFuture || isMissed;
    
    if (statusType === "Mu'akkadah") {
      return (
        <span style={{ 
          fontSize: 8, 
          fontWeight: 700, 
          letterSpacing: '0.1em', 
          backgroundColor: dimmed ? 'transparent' : GOLD, 
          color: dimmed ? TEXT_MUTE : BG, 
          border: dimmed ? `1px solid ${TEXT_MUTE}` : '1px solid transparent',
          padding: '2px 6px', 
          borderRadius: 4,
          opacity: isFuture ? 0.5 : 1
        }}>
          MU'AKKADAH
        </span>
      );
    }
    if (statusType === "Ghayr Mu'akkadah") {
      return (
        <span style={{ 
          fontSize: 8, 
          fontWeight: 700, 
          letterSpacing: '0.1em', 
          borderColor: dimmed ? TEXT_MUTE : GOLD, 
          borderWidth: 1, 
          borderStyle: 'solid', 
          color: dimmed ? TEXT_MUTE : GOLD, 
          padding: '1px 5px', 
          borderRadius: 4,
          opacity: isFuture ? 0.5 : 1
        }}>
          GHAYR MU'AKKADAH
        </span>
      );
    }
    return (
      <span style={{ 
        fontSize: 8, 
        fontWeight: 700, 
        letterSpacing: '0.1em', 
        borderColor: dimmed ? TEXT_MUTE : TEXT_DIM, 
        borderWidth: 1, 
        borderStyle: 'solid', 
        color: dimmed ? TEXT_MUTE : TEXT_DIM, 
        padding: '1px 5px', 
        borderRadius: 4,
        opacity: isFuture ? 0.5 : 1
      }}>
        {statusType.toUpperCase()}
      </span>
    );
  };

  return (
    <div
      className="w-full min-h-screen mx-auto relative overflow-hidden flex flex-col"
      style={{ backgroundColor: BG, color: TEXT, fontFamily: SANS, maxWidth: 390 }}
    >
      <div className="w-full h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <style>{`
          ::-webkit-scrollbar { display: none; }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 10px rgba(244,200,66,0.3); background-color: rgba(244,200,66,0.15); }
            50% { box-shadow: 0 0 20px rgba(244,200,66,0.6); background-color: rgba(244,200,66,0.3); }
          }
          .current-node { animation: glow 3s ease-in-out infinite; }
        `}</style>

        {/* TOP */}
        <div className="pt-12 pb-8 px-6 flex flex-col items-center">
          <svg width="16" height="16" viewBox="-12 -12 24 24" className="mb-4 opacity-70">
            <Floret x={0} y={0} />
          </svg>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: TEXT_MUTE, marginBottom: 2 }}>
            12 RAMAḌĀN 1446
          </span>
          <span style={{ fontSize: 10, color: TEXT_MUTE, letterSpacing: '0.1em' }}>
            MARCH 12, 2025
          </span>
        </div>

        {/* BODY - THE PATH */}
        <div className="relative px-6 pb-8">
          {/* Vertical gold hairline connecting nodes */}
          <div 
            style={{ 
              position: 'absolute', 
              left: 40, // Center of the timeline column
              top: 10, 
              bottom: 20, 
              width: 1, 
              background: `linear-gradient(to bottom, transparent, ${GOLD}33 5%, ${GOLD}33 95%, transparent)`,
              zIndex: 0
            }} 
          />

          <div className="flex flex-col gap-6 relative z-10">
            {nodes.map((node, index) => {
              const isPast = node.status === 'done' || node.status === 'missed';
              const isCurrent = node.status === 'current';
              const isFuture = node.status === 'future';
              const isDone = node.status === 'done';

              return (
                <div key={node.id} className="flex items-start gap-5 group">
                  {/* Timeline Node / Time */}
                  <div className="flex flex-col items-center mt-1" style={{ width: 32 }}>
                    <div 
                      className={`flex flex-col items-center justify-center w-8 h-8 rounded-full mb-1 cursor-pointer ${isCurrent ? 'current-node' : ''}`}
                      onClick={() => !isFuture && toggleDone(node.id)}
                      style={{
                        border: `1px solid ${isCurrent || isDone ? GOLD : TEXT_MUTE}`,
                        backgroundColor: isDone ? GOLD : (isCurrent ? 'transparent' : BG),
                        color: isDone ? BG : (isCurrent ? GOLD : TEXT_MUTE),
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {isDone ? (
                        <Check size={16} strokeWidth={3} />
                      ) : (
                        <div style={{ 
                          width: isCurrent ? 8 : 6, 
                          height: isCurrent ? 8 : 6, 
                          borderRadius: '50%', 
                          backgroundColor: isCurrent ? GOLD : 'transparent',
                          border: isCurrent ? 'none' : `1px solid ${TEXT_MUTE}`
                        }} />
                      )}
                    </div>
                    <span style={{ 
                      fontSize: 10, 
                      fontWeight: isCurrent ? 600 : 500, 
                      fontVariantNumeric: 'tabular-nums',
                      color: isCurrent ? GOLD_LIGHT : (isFuture ? TEXT_MUTE : TEXT_DIM),
                      opacity: isFuture ? 0.6 : 1
                    }}>
                      {node.time}
                    </span>
                  </div>

                  {/* Content */}
                  <div 
                    className="flex-1 flex flex-col"
                    style={{ 
                      paddingBottom: 8,
                      opacity: isFuture ? 0.5 : (node.status === 'missed' ? 0.6 : 1),
                      transition: 'opacity 0.3s'
                    }}
                  >
                    <div className="flex items-baseline justify-between mb-1">
                      <div className="flex items-baseline gap-2">
                        <span style={{ fontSize: 16, fontWeight: 500, color: isCurrent ? GOLD_LIGHT : TEXT }}>
                          {node.nameEn}
                        </span>
                      </div>
                      <span style={{ fontSize: 13, fontFamily: ARABIC, color: TEXT_DIM }}>
                        {node.nameAr}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{ fontSize: 12, color: TEXT_DIM }}>{node.rakaat}</span>
                      <span style={{ color: TEXT_MUTE, fontSize: 10 }}>•</span>
                      {renderBadge(node.statusType, node.status)}
                    </div>

                    {!isFuture && (
                      <div 
                        className="self-start text-xs font-medium cursor-pointer py-1"
                        style={{ color: isDone ? TEXT_MUTE : GOLD }}
                        onClick={() => toggleDone(node.id)}
                      >
                        {isDone ? 'Unmark' : 'Mark prayed'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM */}
        <div className="px-6 pb-20 pt-4 flex flex-col items-center text-center">
          <div 
            className="cursor-pointer group flex items-center gap-2 py-3 px-6 rounded-full"
            style={{ 
              border: `1px solid ${BORDER}`, 
              backgroundColor: SURFACE_HI,
              color: TEXT_DIM
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500 }}>Browse all sunnahs</span>
            <span style={{ color: TEXT_MUTE }}>·</span>
            <span style={{ fontSize: 13, fontFamily: ARABIC }}>الفهرس الكامل</span>
            <ChevronRight size={14} className="group-hover:text-white transition-colors" />
          </div>
          
          <svg width="16" height="16" viewBox="-12 -12 24 24" className="mt-12 opacity-50">
            <Floret x={0} y={0} />
          </svg>
        </div>
      </div>
    </div>
  );
}
