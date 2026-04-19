import React, { useEffect, useState } from 'react';
import { MapPin, RotateCcw } from 'lucide-react';

export function Geometry() {
  const [heading, setHeading] = useState(46); // Device heading
  const targetBearing = 58; // Target Qibla bearing
  const delta = targetBearing - heading; // +12 means rotate right

  const isAligned = Math.abs(delta) < 3;

  // Colors
  const bg = '#0A1A0E';
  const gold = '#D4A017';
  const mutedGold = 'rgba(212, 160, 23, 0.4)';
  const dimGold = 'rgba(212, 160, 23, 0.15)';

  const renderGirihPattern = () => {
    // Generate an 8-point star girih pattern
    const cx = 150;
    const cy = 150;
    
    const lines = [];
    const radius = 110;
    
    // Star in the center
    const innerStarR1 = 20;
    const innerStarR2 = 45;
    let path = `M ${cx} ${cy - innerStarR2}`;
    for (let i = 1; i <= 16; i++) {
      const angle = (i * Math.PI) / 8;
      const r = i % 2 === 0 ? innerStarR2 : innerStarR1;
      path += ` L ${cx + r * Math.sin(angle)} ${cy - r * Math.cos(angle)}`;
    }
    
    // Intersecting squares (8-point star base)
    const renderSquare = (rot: number) => {
      const r = 85;
      const pts = [];
      for(let i=0; i<4; i++) {
        const a = rot + (i * Math.PI / 2);
        pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
      }
      return <polygon points={pts.join(' ')} fill="none" stroke={gold} strokeWidth="1.2" opacity="0.6" />;
    };

    return (
      <g>
        {renderSquare(Math.PI / 4)}
        {renderSquare(Math.PI / 4 + Math.PI / 8)}
        <path d={path} fill="none" stroke={gold} strokeWidth="1.5" opacity="0.8" />
        
        {/* Radiating lines to outer ring */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * Math.PI) / 8;
          const r1 = 85;
          const r2 = 130;
          return (
            <line 
              key={i}
              x1={cx + r1 * Math.cos(angle)} 
              y1={cy + r1 * Math.sin(angle)} 
              x2={cx + r2 * Math.cos(angle)} 
              y2={cy + r2 * Math.sin(angle)} 
              stroke={gold} 
              strokeWidth="1" 
              opacity="0.4"
            />
          );
        })}
      </g>
    );
  };

  return (
    <div className="w-[390px] h-[844px] mx-auto overflow-hidden relative flex flex-col items-center bg-[#0A1A0E] text-white font-sans select-none">
      
      {/* Background Texture (subtle pattern) */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z' fill='%23D4A017' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }}
      />

      {/* Header Strip */}
      <div className="w-full pt-16 pb-4 px-6 flex items-center justify-between z-10">
        <div className="flex flex-col">
          <span className="font-['Amiri_Quran'] text-2xl text-[#D4A017] opacity-90 leading-none">القبلة</span>
          <span className="text-white/50 text-xs tracking-widest uppercase mt-1 font-medium">Qibla</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
          <MapPin className="w-3.5 h-3.5 text-[#D4A017]" />
          <span className="text-sm text-white/90">Brooklyn, NY</span>
        </div>
      </div>

      {/* Compass Area */}
      <div className="flex-1 w-full flex items-center justify-center relative mt-8 z-10">
        
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-[#D4A017]/10 blur-[60px] rounded-full" />

        <div className="relative w-[300px] h-[300px]">
          {/* Static Center & Kaaba */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Inner Ring */}
            <div className="absolute w-[60px] h-[60px] rounded-full border-[1px] border-[#D4A017]/30" />
            <div className="absolute w-[44px] h-[44px] rounded-full border-[0.5px] border-[#D4A017]/20" />
            
            {/* Kaaba Symbol */}
            <div className="relative w-[14px] h-[14px] bg-[#D4A017] shadow-[0_0_15px_rgba(212,160,23,0.6)] transform rotate-45 flex items-center justify-center">
              <div className="w-[8px] h-[8px] border border-[#0A1A0E] opacity-50" />
            </div>
          </div>

          {/* Rotating Geometry (Device Heading) */}
          <div 
            className="absolute inset-0 transition-transform duration-500 ease-out"
            style={{ transform: `rotate(${-heading}deg)` }}
          >
            <svg width="300" height="300" viewBox="0 0 300 300">
              {/* Outer Ticks */}
              {Array.from({ length: 72 }).map((_, i) => {
                const angle = (i * 5 * Math.PI) / 180;
                const r1 = 142;
                const r2 = i % 9 === 0 ? 134 : 138;
                const cx = 150, cy = 150;
                return (
                  <line 
                    key={i}
                    x1={cx + r1 * Math.cos(angle)} y1={cy + r1 * Math.sin(angle)}
                    x2={cx + r2 * Math.cos(angle)} y2={cy + r2 * Math.sin(angle)}
                    stroke={gold}
                    strokeWidth={i % 9 === 0 ? 1.5 : 0.8}
                    opacity={i % 9 === 0 ? 0.7 : 0.3}
                  />
                );
              })}
              
              {/* Cardinal Labels */}
              {['N', 'E', 'S', 'W'].map((dir, i) => {
                const angle = (i * 90 - 90) * Math.PI / 180;
                const r = 122;
                return (
                  <text 
                    key={dir}
                    x={150 + r * Math.cos(angle)} 
                    y={150 + r * Math.sin(angle)}
                    fill={dir === 'N' ? '#D4A017' : 'rgba(255,255,255,0.4)'}
                    fontSize="12"
                    fontFamily="serif"
                    fontWeight={dir === 'N' ? 'bold' : 'normal'}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${heading}, ${150 + r * Math.cos(angle)}, ${150 + r * Math.sin(angle)})`}
                  >
                    {dir}
                  </text>
                );
              })}

              {/* Geometric Girih Pattern */}
              {renderGirihPattern()}
            </svg>
          </div>

          {/* Target Bearing Indicator (Fixed relative to compass, points to Kaaba) */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ transform: `rotate(${delta}deg)` }}
          >
            {/* Pointer / Needle pointing towards Kaaba */}
            <svg width="300" height="300" viewBox="0 0 300 300" className="absolute inset-0">
              <path 
                d="M 150 15 L 156 35 L 144 35 Z" 
                fill={isAligned ? '#FFF' : gold} 
                opacity="0.9"
              />
              <line x1="150" y1="35" x2="150" y2="120" stroke={gold} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info Block */}
      <div className="w-full px-8 pb-16 flex flex-col items-center z-10 relative">
        <div className="flex flex-col items-center gap-6 w-full max-w-[280px]">
          
          {/* Main Numbers */}
          <div className="flex flex-col items-center">
            <div className="text-6xl font-serif tracking-tight text-white mb-1 drop-shadow-md">
              58<span className="text-[#D4A017] text-4xl">°</span>
            </div>
            <div className="text-white/60 tracking-widest uppercase text-sm font-medium">
              North East
            </div>
          </div>

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4A017]/30 to-transparent" />

          {/* Delta & Distance */}
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col items-start">
              <span className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Status</span>
              <span className="text-[#D4A017] font-serif text-lg">12° Right</span>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div className="flex flex-col items-end">
              <span className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Distance</span>
              <span className="text-white font-serif text-lg">8,432 km</span>
            </div>
          </div>

          {/* Calibration / GPS Status */}
          <div className="mt-4 flex items-center justify-center gap-2 bg-[#D4A017]/10 border border-[#D4A017]/20 px-4 py-2 rounded-full">
            <RotateCcw className="w-3.5 h-3.5 text-[#D4A017] opacity-80" />
            <span className="text-[#D4A017] text-xs opacity-90 tracking-wide">Calibrated • GPS Locked</span>
          </div>

        </div>
      </div>
    </div>
  );
}
