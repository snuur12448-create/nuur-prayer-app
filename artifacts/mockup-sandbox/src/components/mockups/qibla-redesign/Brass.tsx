import React, { useState, useEffect } from "react";
import { MapPin, Navigation, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brass() {
  // Placeholder data
  const city = "Brooklyn, NY";
  const bearing = 58; // Kaaba bearing
  const [heading, setHeading] = useState(46); // Current heading
  const distance = "10,239 km";
  const isAligned = Math.abs(heading - bearing) < 3;

  // Fake rotation for the mockup
  useEffect(() => {
    const interval = setInterval(() => {
      setHeading((h) => {
        // Slowly drift towards bearing for demonstration, or just wobble
        const diff = bearing - h;
        if (Math.abs(diff) < 1) return h + (Math.random() * 2 - 1);
        return h + diff * 0.05 + (Math.random() * 2 - 1);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [bearing]);

  const delta = bearing - heading;
  const deltaAbs = Math.abs(delta).toFixed(1);
  const direction = delta > 0 ? "right" : "left";

  return (
    <div className="relative w-[390px] h-[844px] mx-auto overflow-hidden bg-[#0a120c] font-serif text-[#D4A017] select-none flex flex-col">
      {/* Background Texture: Deep matte ink-green leather */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a120c] via-transparent to-[#040805] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-16 pb-4">
        <div className="flex flex-col">
          <span className="text-[#8e733b] text-xs uppercase tracking-[0.2em] font-sans mb-1">القبلة</span>
          <span className="text-[#E8D5A3] text-xl font-medium tracking-wide">Qibla</span>
        </div>
        <div className="flex items-center space-x-2 bg-[#122016]/80 px-3 py-1.5 rounded-sm border border-[#3a2e16]/50 backdrop-blur-md shadow-inner">
          <MapPin className="w-3.5 h-3.5 text-[#a88842]" />
          <span className="text-[#E8D5A3] text-sm font-sans tracking-wide">{city}</span>
        </div>
      </div>

      {/* Main Compass Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center -mt-8">
        
        {/* Alignment Hint */}
        <div className="absolute top-12 left-0 right-0 flex justify-center z-20">
          <div className={cn(
            "px-4 py-2 rounded-full border backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center space-x-2 transition-all duration-500",
            isAligned 
              ? "bg-[#D4A017]/20 border-[#D4A017]/50 shadow-[#D4A017]/20" 
              : "bg-[#122016]/80 border-[#3a2e16]/50"
          )}>
            {isAligned ? (
              <>
                <Lock className="w-4 h-4 text-[#E8D5A3]" />
                <span className="text-[#E8D5A3] text-sm tracking-widest uppercase font-sans">Aligned</span>
              </>
            ) : (
              <>
                <Navigation className={cn("w-4 h-4 text-[#8e733b] transition-transform duration-300", delta > 0 ? "rotate-90" : "-rotate-90")} />
                <span className="text-[#a88842] text-sm tracking-wider font-sans">Rotate {deltaAbs}° {direction}</span>
              </>
            )}
          </div>
        </div>

        {/* The Brass Compass */}
        <div className="relative w-[320px] h-[320px] flex items-center justify-center">
          
          {/* Outer Case / Drop Shadow */}
          <div className="absolute inset-[-20px] rounded-full bg-[#0a120c] shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.05)]" />

          {/* Outer Brass Bezel */}
          <div 
            className="absolute inset-0 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_4px_8px_rgba(255,255,255,0.3),inset_0_-4px_8px_rgba(0,0,0,0.6)]"
            style={{
              background: "conic-gradient(from 0deg, #5b461c, #d4a017, #8e733b, #ebd7a3, #5b461c, #d4a017, #8e733b, #5b461c)"
            }}
          >
            {/* Bezel Inner Edge */}
            <div className="absolute inset-[6px] rounded-full bg-[#122016] shadow-[inset_0_5px_15px_rgba(0,0,0,0.8)]" />
          </div>

          {/* Rotating Dial (Attached to heading) */}
          <div 
            className="absolute inset-[12px] rounded-full transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${-heading}deg)` }}
          >
            {/* Dial Background */}
            <div className="absolute inset-0 rounded-full bg-[#1a2b1f] shadow-[inset_0_0_40px_rgba(0,0,0,0.9)] overflow-hidden">
              {/* Subtle metallic radial gradient on the dial face */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,160,23,0.1)_0%,transparent_70%)]" />
              {/* Engraved noise texture */}
              <div 
                className="absolute inset-0 opacity-20 mix-blend-overlay"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
              />
            </div>

            {/* Engraved Degree Marks & Numbers */}
            {Array.from({ length: 72 }).map((_, i) => {
              const deg = i * 5;
              const isMajor = deg % 90 === 0;
              const isMinorMajor = deg % 30 === 0 && !isMajor;
              const rotation = deg;
              
              return (
                <div 
                  key={i}
                  className="absolute inset-0 flex justify-center pointer-events-none"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <div 
                    className={cn(
                      "w-[2px] bg-[#D4A017] origin-bottom shadow-[0_1px_1px_rgba(0,0,0,0.8)]",
                      isMajor ? "h-[14px] mt-1 opacity-90" : isMinorMajor ? "h-[10px] mt-[2px] opacity-70" : "h-[6px] mt-[4px] opacity-40 w-[1px]"
                    )}
                  />
                  {/* Numbers for every 30 degrees (except cardinals) */}
                  {isMinorMajor && (
                    <div 
                      className="absolute top-[18px] text-[10px] text-[#a88842] opacity-70 tracking-tighter"
                      style={{ transform: `rotate(${-rotation}deg)` }}
                    >
                      {deg}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Arabic Cardinal Directions */}
            {[
              { label: "شمال", deg: 0, color: "#e84a4a" }, // N (Red)
              { label: "شرق", deg: 90, color: "#D4A017" }, // E
              { label: "جنوب", deg: 180, color: "#D4A017" }, // S
              { label: "غرب", deg: 270, color: "#D4A017" }, // W
            ].map((cardinal) => (
              <div
                key={cardinal.label}
                className="absolute inset-0 flex justify-center pointer-events-none"
                style={{ transform: `rotate(${cardinal.deg}deg)` }}
              >
                <div 
                  className="absolute top-[20px] font-['Amiri_Quran'] text-xl tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,1)]"
                  style={{ color: cardinal.color }}
                >
                  {cardinal.label}
                </div>
              </div>
            ))}

            {/* Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-[1px] h-full bg-[#D4A017]" />
              <div className="w-full h-[1px] bg-[#D4A017] absolute" />
              <div className="w-[60%] h-[60%] rounded-full border border-[#D4A017]" />
            </div>

            {/* The Kaaba Marker on the Dial */}
            <div 
              className="absolute inset-0 flex justify-center pointer-events-none"
              style={{ transform: `rotate(${bearing}deg)` }}
            >
              <div className="absolute top-[8px] flex flex-col items-center">
                {/* Inlaid black square representing the Kaaba */}
                <div className="w-[12px] h-[12px] bg-[#000] border-[1px] border-[#D4A017] shadow-[0_2px_4px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center rounded-sm">
                  {/* Gold band (Kiswa) */}
                  <div className="w-full h-[2px] bg-[#D4A017] mt-[-2px] opacity-80" />
                </div>
                <div className="w-[1px] h-[10px] bg-[#D4A017] opacity-50 mt-1" />
              </div>
            </div>
          </div>

          {/* Glass glare effect */}
          <div className="absolute inset-[12px] rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />

          {/* Static Needle (Always points UP to device heading) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]">
            {/* Center Pivot */}
            <div className="absolute z-10 w-8 h-8 rounded-full bg-gradient-to-br from-[#ebd7a3] via-[#d4a017] to-[#5b461c] shadow-[0_4px_10px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.4)] flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#3a2e16] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />
            </div>
            
            {/* Needle Body */}
            <div className="absolute w-[8px] h-[220px] flex flex-col items-center">
              {/* North/Heading Pointer */}
              <div className="flex-1 w-full relative">
                {/* Left side illuminated, right side shadowed to simulate 3D ridge */}
                <div className="absolute top-0 bottom-0 left-0 right-[50%] bg-gradient-to-b from-[#ebd7a3] to-[#d4a017] origin-bottom skew-x-[2deg]" />
                <div className="absolute top-0 bottom-0 left-[50%] right-0 bg-gradient-to-b from-[#8e733b] to-[#5b461c] origin-bottom skew-x-[-2deg]" />
                {/* Garnet Tip inlay */}
                <div className="absolute top-[10px] left-[50%] -translate-x-[50%] w-[4px] h-[4px] rounded-full bg-[#8b0000] border-[0.5px] border-[#ebd7a3] shadow-[0_0_4px_rgba(139,0,0,0.8)] z-10" />
                {/* Pointy tip */}
                <div className="absolute -top-[10px] left-[50%] -translate-x-[50%] w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[10px] border-b-[#ebd7a3]" />
              </div>
              
              {/* South/Tail Pointer */}
              <div className="flex-1 w-full relative opacity-90">
                <div className="absolute top-0 bottom-[20px] left-0 right-[50%] bg-gradient-to-t from-[#2a2110] to-[#1a140a] origin-top skew-x-[-2deg]" />
                <div className="absolute top-0 bottom-[20px] left-[50%] right-0 bg-gradient-to-t from-[#1a140a] to-[#0a0804] origin-top skew-x-[2deg]" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Engraved Nameplate */}
      <div className="relative z-10 px-8 pb-12 flex flex-col items-center">
        <div className="w-full max-w-[280px] bg-[#122016]/60 backdrop-blur-md rounded-lg border border-[#3a2e16] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.02)] flex flex-col items-center">
          
          <div className="flex w-full justify-between items-center mb-6">
            <div className="flex flex-col items-center flex-1">
              <span className="text-[#8e733b] text-[10px] uppercase tracking-widest font-sans mb-1">Bearing</span>
              <span className="text-[#E8D5A3] text-2xl font-serif tracking-wide">{bearing}°</span>
            </div>
            
            <div className="w-[1px] h-10 bg-gradient-to-b from-transparent via-[#3a2e16] to-transparent" />
            
            <div className="flex flex-col items-center flex-1">
              <span className="text-[#8e733b] text-[10px] uppercase tracking-widest font-sans mb-1">Distance</span>
              <span className="text-[#E8D5A3] text-xl font-serif tracking-wide">{distance}</span>
            </div>
          </div>

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#3a2e16] to-transparent mb-4" />

          {/* Status Hint */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-[#a88842] text-xs font-sans tracking-wide uppercase">Calibrated • GPS Locked</span>
          </div>

        </div>
      </div>

      {/* Decorative Corner Screws/Rivets */}
      {[
        "top-4 left-4", "top-4 right-4",
        "bottom-4 left-4", "bottom-4 right-4"
      ].map((pos, i) => (
        <div key={i} className={cn("absolute w-3 h-3 rounded-full bg-gradient-to-br from-[#ebd7a3] to-[#5b461c] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.6)] flex items-center justify-center pointer-events-none", pos)}>
          <div className="w-full h-[1px] bg-[#3a2e16] rotate-45 opacity-50" />
        </div>
      ))}
      
    </div>
  );
}

export default Brass;