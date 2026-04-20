import React, { useState } from 'react';
import { X, Moon, BellOff, Bell, Volume2, ChevronRight, Volume1 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const BRAND_GOLD = '#C9933A';
const SURFACE = '#1A1822';
const CARD_BG = '#23202C';
const BORDER = '#312D3D';
const TEXT_MUTED = '#8E8A9F';

export function Compose() {
  const [enabled, setEnabled] = useState(true);
  const [alertType, setAlertType] = useState<'silent' | 'notification' | 'adhan'>('adhan');
  const [adhanLength, setAdhanLength] = useState<'full' | 'short'>('full');
  
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const activeDays = [0, 1, 2, 3, 4, 5, 6];

  return (
    <div className="min-h-[844px] w-full bg-[#0F0E14] flex items-end justify-center overflow-hidden font-sans relative">
      {/* Implied background content */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#15131C] to-[#0F0E14] opacity-50" />

      {/* Sheet Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Sheet */}
      <div 
        className="relative w-full max-w-[390px] rounded-t-[28px] overflow-hidden shadow-2xl transition-transform duration-300"
        style={{ 
          backgroundColor: SURFACE,
          boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
          borderTop: `1px solid rgba(255,255,255,0.05)`
        }}
      >
        {/* Top edge highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9933A]/20 to-transparent" />

        {/* Drag handle area */}
        <div className="w-full flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>

        {/* Header - Dense */}
        <div className="flex items-center justify-between px-5 pb-4">
          <div className="flex items-center gap-2">
            <Moon size={14} color={BRAND_GOLD} className="rotate-[-20deg]" />
            <h2 className="text-white text-sm font-medium tracking-wide flex items-center gap-2">
              <span>Maghrib</span>
              <span className="text-[#C9933A]/60">·</span>
              <span className="font-['Amiri'] text-[15px] text-[#C9933A]">المغرب</span>
              <span className="text-[#C9933A]/60">·</span>
              <span className="text-white/70 font-mono text-[13px]">5:42 PM</span>
            </h2>
          </div>
          <button className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <X size={14} className="text-white/60" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-5 pb-8 flex flex-col gap-5">
          
          {/* The Single Grouped Card */}
          <div className="rounded-2xl flex flex-col overflow-hidden" style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}` }}>
            
            {/* ROW 1: Master Toggle & Days */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b" style={{ borderColor: BORDER }}>
              <div className="flex items-center gap-3">
                <Switch 
                  checked={enabled} 
                  onCheckedChange={setEnabled}
                  className="data-[state=checked]:bg-[#C9933A]"
                />
                <span className="text-white text-[15px] font-medium">Alerts</span>
              </div>
              
              <div className="flex gap-1.5">
                {days.map((d, i) => {
                  const isActive = activeDays.includes(i);
                  const isFriday = i === 5;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <button 
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all",
                          isActive 
                            ? "bg-[#C9933A] text-[#1A1822]" 
                            : "bg-white/5 text-white/40 hover:bg-white/10"
                        )}
                      >
                        {d}
                      </button>
                      {/* Subtle gold underline for Jumu'ah */}
                      {isFriday && isActive && (
                        <div className="w-2.5 h-[2px] rounded-full bg-[#C9933A]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ROW 2: Segmented Control for Alert Type */}
            <div className={cn(
              "px-4 py-3.5 transition-all duration-300", 
              alertType === 'adhan' ? "border-b" : ""
            )} style={{ borderColor: BORDER }}>
              <div className="flex bg-[#1A1822] p-1 rounded-xl border border-white/5 relative">
                {(['silent', 'notification', 'adhan'] as const).map((type) => {
                  const isSelected = alertType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setAlertType(type)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-medium transition-all relative z-10",
                        isSelected ? "text-white shadow-sm" : "text-[#8E8A9F] hover:text-white/70"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#2C2936] rounded-lg -z-10 shadow-[0_2px_8px_rgba(0,0,0,0.2)] border border-white/10" />
                      )}
                      {type === 'silent' && <BellOff size={14} />}
                      {type === 'notification' && <Bell size={14} />}
                      {type === 'adhan' && <Volume2 size={14} />}
                      <span className="capitalize">{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ROW 3 (Conditional): Adhan Settings */}
            {alertType === 'adhan' && (
              <div className="flex flex-col bg-[#1A1822]/40">
                {/* Reciter */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors">
                  <span className="text-[14px] text-white/80">Reciter</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] text-[#C9933A]">Mishary Alafasy <span className="text-[#C9933A]/50">· Mecca</span></span>
                    <ChevronRight size={14} className="text-white/30" />
                  </div>
                </div>
                
                {/* Length */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <span className="text-[14px] text-white/80">Length</span>
                  <div className="flex bg-[#1A1822] p-0.5 rounded-lg border border-white/5">
                    {(['full', 'short'] as const).map((len) => (
                      <button
                        key={len}
                        onClick={() => setAdhanLength(len)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-[12px] font-medium transition-all flex items-center gap-1.5",
                          adhanLength === len ? "bg-[#2C2936] text-white border border-white/5 shadow-sm" : "text-[#8E8A9F] hover:text-white/70"
                        )}
                      >
                        {len === 'full' ? <Volume2 size={12} /> : <Volume1 size={12} />}
                        <span className="capitalize">{len}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Inset Save Button */}
            <div className="p-3 bg-[#1A1822]/20">
              <button className="w-full py-3.5 rounded-xl bg-[#C9933A] hover:bg-[#DCA446] text-[#1A1822] text-[15px] font-bold shadow-[0_4px_14px_rgba(201,147,58,0.25)] transition-all hover:shadow-[0_4px_20px_rgba(201,147,58,0.4)] active:scale-[0.98]">
                Save Settings
              </button>
            </div>

          </div>
          
        </div>
      </div>
    </div>
  );
}
