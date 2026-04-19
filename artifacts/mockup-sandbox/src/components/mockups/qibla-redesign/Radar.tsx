import React, { useEffect, useState } from "react";
import { MapPin, Crosshair, Navigation, Activity } from "lucide-react";

export function Radar() {
  const [sweepAngle, setSweepAngle] = useState(0);

  // Radar sweep animation
  useEffect(() => {
    let animationFrameId: number;
    let start = performance.now();

    const animate = (time: number) => {
      const elapsed = time - start;
      const newAngle = (elapsed / 25) % 360; 
      setSweepAngle(newAngle);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Fixed mockup data
  const targetBearing = 58;
  const currentHeading = 46; // 12 degrees off to the left, need to rotate right.
  const delta = Math.abs(targetBearing - currentHeading);
  const distanceKm = 8432;
  const distanceMi = Math.round(distanceKm * 0.621371);
  const userLat = "40°39'51\"N";
  const userLon = "73°56'19\"W";
  const targetLat = "21°25'21\"N";
  const targetLon = "39°49'34\"E";

  return (
    <div className="relative w-[390px] h-[844px] mx-auto overflow-hidden bg-[#0A1A0E] text-[#8C9C90] font-mono selection:bg-[#D4A017]/30 flex flex-col">
      {/* Background Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1A2F22 1px, transparent 1px),
            linear-gradient(to bottom, #1A2F22 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
          backgroundPosition: 'center center'
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0A1A0E_80%)] pointer-events-none" />

      {/* Top Bar */}
      <div className="pt-14 pb-4 px-6 flex items-start justify-between z-20 relative">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[#D4A017] mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold tracking-widest uppercase font-sans">Brooklyn, NY</span>
          </div>
          <span className="text-[10px] text-[#8C9C90]/70 tracking-wider">
            {userLat} {userLon}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 text-[#2ECC71] mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium tracking-wider">LOCKED</span>
          </div>
          <span className="text-[10px] text-[#8C9C90]/70 tracking-wider">
            CALIBRATED
          </span>
        </div>
      </div>

      {/* Top Arc Gauge for Heading */}
      <div className="relative mt-2 w-full h-[80px] flex justify-center overflow-hidden z-20">
        <div className="absolute bottom-[-150px] w-[300px] h-[300px] rounded-full border border-[#1A2F22]" />
        <div className="absolute bottom-[-150px] w-[280px] h-[300px] rounded-full border border-[#1A2F22]/40" />
        
        {/* Tick marks on arc */}
        {Array.from({ length: 41 }).map((_, i) => {
          const angle = (i - 20) * 3; 
          const isMajor = angle % 15 === 0;
          return (
            <div 
              key={i}
              className="absolute bottom-[-150px] left-1/2 w-[2px] origin-bottom -translate-x-1/2"
              style={{
                height: '150px',
                transform: `translateX(-50%) rotate(${angle}deg)`
              }}
            >
              <div className={`w-full ${isMajor ? 'h-3 bg-[#8C9C90]/60' : 'h-1.5 bg-[#8C9C90]/30'}`} />
            </div>
          );
        })}

        {/* Target Bearing Indicator on Arc */}
        <div 
          className="absolute bottom-[-150px] left-1/2 w-[2px] origin-bottom -translate-x-1/2"
          style={{
            height: '150px',
            transform: `translateX(-50%) rotate(${targetBearing - currentHeading}deg)`
          }}
        >
          <div className="w-[4px] -ml-[1px] h-4 bg-[#D4A017] rounded-full shadow-[0_0_8px_rgba(212,160,23,0.6)]" />
        </div>
        
        {/* Center notch (Current Heading) */}
        <div className="absolute top-[0px] left-1/2 -translate-x-1/2 w-[2px] h-5 bg-[#2ECC71] shadow-[0_0_8px_rgba(46,204,113,0.5)] z-10" />
        <div className="absolute top-[28px] left-1/2 -translate-x-1/2">
            <span className="text-2xl font-light text-white tracking-tight">{currentHeading}°</span>
        </div>
      </div>

      {/* Main Radar Area */}
      <div className="relative flex-1 w-full flex items-center justify-center mt-8 z-10">
        <div className="relative w-[340px] h-[340px]">
            {/* Radar Rings */}
            <div className="absolute inset-0 rounded-full border border-[#1A2F22] bg-[#0A1A0E]/80 backdrop-blur-md shadow-[inset_0_0_40px_rgba(26,47,34,0.3)]" />
            <div className="absolute inset-[40px] rounded-full border border-[#1A2F22]" />
            <div className="absolute inset-[80px] rounded-full border border-[#1A2F22]" />
            <div className="absolute inset-[120px] rounded-full border border-[#1A2F22] border-dashed" />
            
            {/* Distance Labels */}
            <div className="absolute top-[20px] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0A1A0E] px-1 text-[8px] text-[#8C9C90]/50 tracking-widest">
            8000 KM
            </div>
            <div className="absolute top-[60px] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0A1A0E] px-1 text-[8px] text-[#8C9C90]/50 tracking-widest">
            5000 KM
            </div>
            <div className="absolute top-[100px] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0A1A0E] px-1 text-[8px] text-[#8C9C90]/50 tracking-widest">
            2000 KM
            </div>

            {/* Crosshairs */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#1A2F22]/60 -translate-x-1/2" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-[#1A2F22]/60 -translate-y-1/2" />

            {/* The Kaaba (Center) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 z-20 flex items-center justify-center group">
                <div className="absolute inset-0 bg-[#D4A017] rounded-[2px] shadow-[0_0_20px_rgba(212,160,23,0.5)] transition-transform duration-1000" />
                <div className="absolute top-[3px] inset-x-[2px] h-[2px] bg-[#0A1A0E]/60" />
                <div className="absolute -inset-4 border border-[#D4A017]/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            </div>

            {/* The User (Perimeter Dot) */}
            {/* Rotated so device heading is top. User dot placed at angle: targetBearing - currentHeading + 180 */}
            <div 
            className="absolute top-1/2 left-1/2 w-[340px] h-px bg-transparent -translate-x-1/2 -translate-y-1/2 origin-center z-10 transition-transform duration-500 ease-out"
            style={{ transform: `translate(-50%, -50%) rotate(${currentHeading - targetBearing + 90}deg)` }}
            >
            {/* Connecting Line */}
            <div className="absolute left-[170px] right-3 top-0 h-px bg-gradient-to-r from-[#D4A017] to-[#D4A017]/10" />
            
            {/* User Dot */}
            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#2ECC71] shadow-[0_0_12px_rgba(46,204,113,0.8)] z-10">
                <div className="absolute inset-[-6px] rounded-full border border-[#2ECC71]/40" />
            </div>
            </div>

            {/* Radar Sweep */}
            <div 
            className="absolute top-1/2 left-1/2 w-[170px] h-[170px] origin-top-left overflow-hidden rounded-br-full pointer-events-none"
            style={{ transform: `rotate(${sweepAngle}deg)` }}
            >
            <div className="absolute inset-0 bg-gradient-to-br from-[#2ECC71]/20 via-[#2ECC71]/5 to-transparent mix-blend-screen" />
            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#2ECC71]/60 shadow-[0_-2px_10px_rgba(46,204,113,0.5)]" />
            </div>
        </div>
      </div>

      {/* Alignment Delta & Bearing */}
      <div className="mt-4 px-8 flex justify-between items-end border-b border-[#1A2F22]/50 pb-6 z-20 relative">
        <div>
          <span className="block text-[10px] text-[#8C9C90]/60 tracking-widest mb-1">TARGET BEARING</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl text-[#D4A017] tracking-tight">{targetBearing}°</span>
            <span className="text-sm text-[#D4A017]/70">NE</span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="block text-[10px] text-[#8C9C90]/60 tracking-widest mb-1">ALIGNMENT</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl text-white tracking-tight">+{delta}°</span>
            <div className="bg-[#1A2F22] rounded px-1.5 py-0.5 flex items-center justify-center">
                <Navigation className="w-4 h-4 text-[#8C9C90] rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Technical Data Bottom Panel */}
      <div className="h-[220px] bg-[#061008] px-8 py-6 z-20 relative flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-[#D4A017]/30 flex items-center justify-center bg-[#D4A017]/5 relative">
              <Crosshair className="w-5 h-5 text-[#D4A017]" />
              <div className="absolute inset-[-4px] border border-[#D4A017]/10 rounded-full border-dashed animate-spin-slow" style={{ animationDuration: '10s' }} />
            </div>
            <div>
              <span className="block text-[9px] text-[#D4A017] tracking-[0.2em] mb-1 uppercase">Distance to Kaaba</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl text-white tracking-tight">{distanceKm.toLocaleString()}</span>
                <span className="text-xs text-[#8C9C90]">KM</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="block text-xs text-[#8C9C90] mt-5 tracking-wider">{distanceMi.toLocaleString()} MI</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-auto">
          <div className="p-3 border border-[#1A2F22]/80 rounded-lg bg-[#0A1A0E]/50 flex flex-col justify-between">
            <span className="block text-[9px] text-[#8C9C90]/50 tracking-[0.1em] mb-1">KAABA LAT</span>
            <span className="text-xs text-[#8C9C90]">{targetLat}</span>
          </div>
          <div className="p-3 border border-[#1A2F22]/80 rounded-lg bg-[#0A1A0E]/50 flex flex-col justify-between">
            <span className="block text-[9px] text-[#8C9C90]/50 tracking-[0.1em] mb-1">KAABA LON</span>
            <span className="text-xs text-[#8C9C90]">{targetLon}</span>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
          <span className="font-['Amiri_Quran'] text-2xl text-[#D4A017]">القبلة</span>
        </div>
      </div>

    </div>
  );
}
