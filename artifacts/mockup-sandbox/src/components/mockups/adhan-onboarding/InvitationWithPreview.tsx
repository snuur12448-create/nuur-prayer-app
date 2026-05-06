import React, { useState } from "react";
import { BellOff, Bell, Volume2, Play, Square, Check, ChevronLeft } from "lucide-react";
import "./_group.css";

type AlertType = "silent" | "notification" | "adhan";

const RECITERS = [
  { id: "alafasy", name: "Sheikh Mishary Rashid Alafasy", location: "Kuwait" },
  { id: "sudais", name: "Sheikh Abdul Rahman Al-Sudais", location: "Makkah" },
  { id: "ghamdi", name: "Sheikh Saad Al-Ghamdi", location: "Saudi Arabia" },
  { id: "ozcan", name: "Hafiz Mustafa Özcan", location: "Istanbul" },
  { id: "husary", name: "Sheikh Mahmoud Khalil Al-Husary", location: "Cairo" },
];

export function InvitationWithPreview() {
  const [alertType, setAlertType] = useState<AlertType>("adhan");
  const [reciterId, setReciterId] = useState("alafasy");
  const [sheetOpen, setSheetOpen] = useState(true);
  const [previewing, setPreviewing] = useState<string | null>(null);

  const handleSelectAlert = (type: AlertType) => {
    setAlertType(type);
    if (type === "adhan") {
      setSheetOpen(true);
    } else {
      setSheetOpen(false);
    }
  };

  const togglePreview = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (previewing === id) {
      setPreviewing(null);
    } else {
      setPreviewing(id);
      setTimeout(() => {
        setPreviewing(null);
      }, 3000);
    }
  };

  const selectedReciter = RECITERS.find(r => r.id === reciterId);

  return (
    <div className="min-h-[100dvh] w-full max-w-[390px] mx-auto overflow-hidden relative text-white bg-[#050508] font-sans flex flex-col items-center">
      {/* Background Nocturnal Scene */}
      <div className="absolute top-0 left-0 w-full h-[50vh] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#141b36] via-[#090b14] to-[#050508] opacity-80" />
        
        {/* Moon / Glow */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-64 h-64 bg-[#C9933A] rounded-full blur-[100px] opacity-20 animate-pulse-glow" />
        
        {/* Stars */}
        <div className="absolute top-[15%] left-[20%] w-1 h-1 bg-white rounded-full opacity-60 animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-[25%] right-[25%] w-1.5 h-1.5 bg-white rounded-full opacity-40 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[35%] left-[30%] w-1 h-1 bg-white rounded-full opacity-50 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[10%] right-[15%] w-0.5 h-0.5 bg-white rounded-full opacity-80 animate-float" style={{ animationDelay: '0.5s' }} />
        
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050508] to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col w-full h-full min-h-[100dvh] px-6 pt-14 pb-8">
        
        {/* Header */}
        <div className="flex justify-center items-center gap-3 opacity-70 mb-10">
          <div className="w-8 h-[1px] bg-[#C9933A] opacity-40" />
          <div className="flex items-center gap-2">
            <span className="text-[#C9933A] text-[10px] tracking-[0.2em] font-semibold">NUUR</span>
            <span className="text-[#C9933A] opacity-60 text-xs">·</span>
            <span className="text-[#C9933A] font-serif text-sm">نور</span>
          </div>
          <div className="w-8 h-[1px] bg-[#C9933A] opacity-40" />
        </div>

        {/* Titles */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-[34px] font-medium tracking-tight mb-4 leading-tight text-white/90">
            Let your prayers<br/>find you
          </h1>
          <p className="text-white/50 text-sm font-light leading-relaxed px-4">
            How would you like to be gently reminded<br/>when it is time to pray?
          </p>
        </div>

        {/* Notification Preview Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl mb-8 flex flex-col gap-3 relative overflow-hidden group w-full mx-auto">
          {/* Glossy top highlight */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded flex items-center justify-center bg-[#C9933A]/20 border border-[#C9933A]/30">
                <span className="text-[#C9933A] font-['Cormorant_Garamond'] text-[10px] font-bold">N</span>
              </div>
              <span className="text-white/60 text-[10px] tracking-wide uppercase">NUUR</span>
            </div>
            <span className="text-white/40 text-[10px]">now</span>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <h3 className="text-white/90 font-medium text-sm">Time for Maghrib</h3>
            <p className="text-white/60 text-[13px] leading-snug">
              {alertType === "silent" 
                ? "Your silent reminder for Maghrib prayer." 
                : alertType === "notification" 
                ? "Gentle chime for Maghrib prayer." 
                : `Full Adhan by ${selectedReciter?.name}`}
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-3 gap-3 mb-auto">
          {/* Silent */}
          <button 
            onClick={() => handleSelectAlert("silent")}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
              alertType === "silent" 
                ? "bg-[#1A1612] border-[#C9933A]/40 shadow-[0_0_20px_rgba(201,147,58,0.1)]" 
                : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${
              alertType === "silent" ? "bg-[#C9933A]/20" : "bg-white/5"
            }`}>
              <BellOff className={`w-4 h-4 ${alertType === "silent" ? "text-[#C9933A]" : "text-white/40"}`} />
            </div>
            <span className={`text-xs font-medium ${alertType === "silent" ? "text-[#C9933A]" : "text-white/70"}`}>Silent</span>
          </button>

          {/* Gentle */}
          <button 
            onClick={() => handleSelectAlert("notification")}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
              alertType === "notification" 
                ? "bg-[#1A1612] border-[#C9933A]/40 shadow-[0_0_20px_rgba(201,147,58,0.1)]" 
                : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${
              alertType === "notification" ? "bg-[#C9933A]/20" : "bg-white/5"
            }`}>
              <Bell className={`w-4 h-4 ${alertType === "notification" ? "text-[#C9933A]" : "text-white/40"}`} />
            </div>
            <span className={`text-xs font-medium text-center leading-tight ${alertType === "notification" ? "text-[#C9933A]" : "text-white/70"}`}>Gentle<br/>Chime</span>
          </button>

          {/* Adhan */}
          <button 
            onClick={() => handleSelectAlert("adhan")}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
              alertType === "adhan" 
                ? "bg-[#1A1612] border-[#C9933A]/40 shadow-[0_0_20px_rgba(201,147,58,0.1)]" 
                : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${
              alertType === "adhan" ? "bg-[#C9933A]/20" : "bg-white/5"
            }`}>
              <Volume2 className={`w-4 h-4 ${alertType === "adhan" ? "text-[#C9933A]" : "text-white/40"}`} />
            </div>
            <span className={`text-xs font-medium text-center leading-tight ${alertType === "adhan" ? "text-[#C9933A]" : "text-white/70"}`}>Full<br/>Adhan</span>
          </button>
        </div>

        {/* Selected Reciter Hint (when adhan selected but sheet closed) */}
        {alertType === "adhan" && !sheetOpen && (
          <div 
            onClick={() => setSheetOpen(true)}
            className="flex items-center justify-between px-5 py-4 mt-6 bg-white/[0.03] border border-white/5 rounded-xl cursor-pointer hover:bg-white/[0.05] transition-colors"
          >
            <div className="flex flex-col">
              <span className="text-[11px] text-[#C9933A] uppercase tracking-wider mb-1 font-semibold">Selected Reciter</span>
              <span className="text-sm text-white/90 truncate max-w-[200px]">
                {selectedReciter?.name}
              </span>
            </div>
            <div className="text-white/30 text-sm flex items-center gap-1">
              Change
            </div>
          </div>
        )}

        <div className="flex-1" />

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 mt-8 w-full transition-all duration-500 transform translate-y-0"
             style={{ opacity: alertType ? 1 : 0.4, pointerEvents: alertType ? 'auto' : 'none' }}>
          <button className="w-full h-14 rounded-xl bg-gradient-to-r from-[#C9933A] to-[#B37B24] text-black font-semibold text-sm tracking-wide shadow-[0_4px_20px_rgba(201,147,58,0.25)] active:scale-[0.98] transition-transform">
            Allow Notifications
          </button>
          <button className="text-white/30 hover:text-white/50 text-[13px] font-medium transition-colors">
            Not right now
          </button>
        </div>

      </div>

      {/* Reciter Bottom Sheet */}
      <div 
        className={`absolute top-0 left-0 w-full h-full z-50 transition-opacity duration-300 ${sheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setSheetOpen(false)}
        />
        <div 
          className={`absolute bottom-0 left-0 w-full bg-[#0a0a0f] border-t border-white/10 rounded-t-[32px] pt-2 pb-10 px-6 transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${
            sheetOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-8" />
          
          <div className="flex items-center mb-6">
            <button onClick={() => setSheetOpen(false)} className="p-2 -ml-2 mr-2 opacity-50 hover:opacity-100">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-serif text-2xl text-white/90">Choose a reciter</h2>
              <p className="text-white/40 text-xs mt-1">The voice that will call you to prayer.</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pb-4">
            {RECITERS.map((r) => {
              const isSelected = reciterId === r.id;
              const isPlaying = previewing === r.id;

              return (
                <div 
                  key={r.id}
                  onClick={() => setReciterId(r.id)}
                  className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-[#1A1612] border-[#C9933A]/30" 
                      : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                  }`}
                >
                  <button 
                    onClick={(e) => togglePreview(e, r.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 border transition-colors ${
                      isPlaying 
                        ? "bg-[#C9933A]/20 border-[#C9933A]/50 text-[#C9933A]" 
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
                  </button>

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className={`text-[15px] font-medium truncate ${isSelected ? "text-[#C9933A]" : "text-white/80"}`}>
                      {r.name}
                    </span>
                    <span className="text-[12px] text-white/40 mt-0.5">
                      {r.location}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#C9933A] flex items-center justify-center ml-2">
                      <Check className="w-3.5 h-3.5 text-[#050508]" strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => setSheetOpen(false)}
            className="w-full mt-4 h-14 rounded-xl bg-white/10 text-white/90 font-medium text-sm hover:bg-white/15 transition-colors"
          >
            Confirm
          </button>

        </div>
      </div>

    </div>
  );
}
