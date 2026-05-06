import React, { useState } from "react";
import { Bell, BellOff, Volume2, Play, Check, Square, ChevronRight, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

const RECITERS = [
  { id: "1", name: "Sheikh Mishary Rashid Alafasy", location: "Kuwait" },
  { id: "2", name: "Sheikh Abdul Rahman Al-Sudais", location: "Makkah" },
  { id: "3", name: "Sheikh Saad Al-Ghamdi", location: "Saudi Arabia" },
  { id: "4", name: "Hafiz Mustafa Özcan", location: "Istanbul" },
  { id: "5", name: "Sheikh Mahmoud Khalil Al-Husary", location: "Cairo" },
];

type AlertType = "silent" | "gentle" | "adhan";

export function PreviewLed() {
  const [alertType, setAlertType] = useState<AlertType>("adhan");
  const [reciterId, setReciterId] = useState("1");
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const selectedReciter = RECITERS.find((r) => r.id === reciterId);

  const togglePreview = (id: string) => {
    if (previewingId === id) setPreviewingId(null);
    else setPreviewingId(id);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#0F0E14] text-white font-sans flex flex-col items-center justify-center overflow-hidden">
      {/* Optional iOS Status bar proxy */}
      
      {/* 390x844 Mobile Container */}
      <div className="relative w-full max-w-[390px] h-[844px] bg-[#0F0E14] flex flex-col shadow-2xl overflow-hidden border border-white/5">
        
        {/* Top Glow */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#C9933A] opacity-[0.05] blur-[60px] pointer-events-none" />

        {/* Header Breadcrumb */}
        <div className="flex flex-col items-center pt-14 pb-6 z-10">
          <div className="flex items-center gap-3 opacity-80">
            <div className="w-10 h-px bg-[#C9933A]/40" />
            <div className="flex items-center gap-2">
              <span className="text-[#C9933A] text-[10px] tracking-[0.2em] font-bold">NUUR</span>
              <span className="text-[#C9933A]/60 text-xs">·</span>
              <span className="text-[#C9933A] font-['Cormorant_Garamond'] text-sm mt-0.5">نور</span>
            </div>
            <div className="w-10 h-px bg-[#C9933A]/40" />
          </div>
        </div>

        <div className="px-6 flex flex-col flex-1 z-10 mt-2">
          {/* Title Area */}
          <div className="text-center mb-8">
            <h1 className="font-['Playfair_Display'] text-3xl font-medium tracking-tight mb-3 text-white/90">
              Notification Preview
            </h1>
            <p className="text-white/40 text-sm max-w-[280px] mx-auto leading-relaxed">
              Experience how Nuur will gently call you to prayer throughout the day.
            </p>
          </div>

          {/* iOS Notification Preview Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-xl mb-8 flex flex-col gap-3 relative overflow-hidden group">
            {/* Glossy top highlight */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded flex items-center justify-center bg-[#C9933A]/20 border border-[#C9933A]/30">
                  <span className="text-[#C9933A] font-['Cormorant_Garamond'] text-[10px] font-bold">N</span>
                </div>
                <span className="text-white/60 text-xs tracking-wide uppercase">NUUR</span>
              </div>
              <span className="text-white/40 text-[11px]">now</span>
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <h3 className="text-white/90 font-medium text-[15px]">Time for Maghrib</h3>
              <p className="text-white/60 text-[13px] leading-snug">
                {alertType === "silent" 
                  ? "Your silent reminder for Maghrib prayer." 
                  : alertType === "gentle" 
                  ? "Gentle chime for Maghrib prayer." 
                  : `Full Adhan by ${selectedReciter?.name}`}
              </p>
            </div>
          </div>

          {/* Alert Type Tabs */}
          <div className="flex flex-col mb-8">
            <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3 ml-1">Alert Style</h2>
            <div className="flex bg-[#1A1822] rounded-2xl p-1.5 border border-white/5">
              {[
                { id: "silent", label: "Silent", icon: BellOff },
                { id: "gentle", label: "Gentle", icon: Bell },
                { id: "adhan", label: "Full Adhan", icon: Volume2 },
              ].map((opt) => {
                const isActive = alertType === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setAlertType(opt.id as AlertType)}
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl gap-1.5 transition-all duration-200",
                      isActive 
                        ? "bg-[#C9933A]/10 shadow-sm border border-[#C9933A]/20" 
                        : "hover:bg-white/5 transparent border border-transparent"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? "text-[#C9933A]" : "text-white/40")} />
                    <span className={cn("text-[11px] font-medium", isActive ? "text-[#C9933A]" : "text-white/40")}>
                      {opt.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Reciter Carousel (Only if Adhan selected) */}
          <div className={cn(
            "flex flex-col transition-all duration-500 overflow-hidden",
            alertType === "adhan" ? "opacity-100 max-h-[300px]" : "opacity-30 max-h-[300px] pointer-events-none grayscale"
          )}>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider">Reciter</h2>
              {alertType === "adhan" && (
                <span className="text-[#C9933A] text-[10px] uppercase tracking-wider font-semibold">
                  {RECITERS.findIndex(r => r.id === reciterId) + 1} of {RECITERS.length}
                </span>
              )}
            </div>

            <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-3 pb-4 -mx-6 px-6">
              {RECITERS.map((reciter) => {
                const isSelected = reciterId === reciter.id;
                const isPreviewing = previewingId === reciter.id;
                
                return (
                  <div 
                    key={reciter.id}
                    onClick={() => { if (alertType === "adhan") setReciterId(reciter.id); }}
                    className={cn(
                      "snap-center shrink-0 w-[240px] flex flex-col p-4 rounded-2xl border transition-all duration-200 cursor-pointer",
                      isSelected 
                        ? "bg-[#1A1822] border-[#C9933A]/40 shadow-[0_0_20px_rgba(201,147,58,0.05)]" 
                        : "bg-[#131219] border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (alertType === "adhan") togglePreview(reciter.id);
                        }}
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                          isPreviewing 
                            ? "bg-[#C9933A]/20 text-[#C9933A]" 
                            : isSelected 
                              ? "bg-white/10 text-white/80 hover:bg-white/15 hover:text-white" 
                              : "bg-[#1A1822] text-white/40 hover:bg-white/10 hover:text-white/80"
                        )}
                      >
                        {isPreviewing ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
                      </div>

                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center border",
                        isSelected ? "bg-[#C9933A] border-[#C9933A]" : "border-white/10"
                      )}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#0F0E14]" strokeWidth={3} />}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <h3 className={cn("font-medium text-sm leading-tight line-clamp-2", isSelected ? "text-[#C9933A]" : "text-white/80")}>
                        {reciter.name}
                      </h3>
                      <span className="text-white/40 text-xs">{reciter.location}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="px-6 pb-12 pt-6 mt-auto bg-gradient-to-t from-[#0F0E14] via-[#0F0E14] to-transparent z-20">
          <button className="w-full bg-[#C9933A] text-[#0F0E14] font-semibold text-[15px] py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#D5A54D] active:scale-[0.98] transition-all">
            Set my reminders
          </button>
          <button className="w-full mt-4 text-white/40 text-sm font-medium hover:text-white/70 transition-colors">
            Not right now
          </button>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
