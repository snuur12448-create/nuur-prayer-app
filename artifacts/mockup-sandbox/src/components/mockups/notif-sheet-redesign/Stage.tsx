import React, { useState } from 'react';
import { Volume2, VolumeX, Bell, BellOff, Play, Check, ChevronRight, Moon, Settings2, ShieldAlert } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const RECITERS = [
  { id: 'alafasy', name: 'Mishary Alafasy', location: 'Mecca', image: 'https://images.unsplash.com/photo-1590076215667-875d4ef01aa0?auto=format&fit=crop&w=100&q=80' },
  { id: 'basit', name: 'Abdul-Basit', location: 'Egypt', image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=100&q=80' },
  { id: 'shuraim', name: "Sa'ud Al-Shuraim", location: 'Mecca', image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=100&q=80' },
  { id: 'yusuf', name: 'Yusuf Islam', location: 'UK', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=100&q=80' },
  { id: 'ozcan', name: 'Hafiz Mustafa Özcan', location: 'Turkey', image: 'https://images.unsplash.com/photo-1564053489984-317bbd824340?auto=format&fit=crop&w=100&q=80' },
  { id: 'mulla', name: 'Ali Ahmed Mulla', location: 'Mecca', image: 'https://images.unsplash.com/photo-1551041777-ed277b8dd348?auto=format&fit=crop&w=100&q=80' },
];

const DAYS = [
  { id: 0, label: 'S' },
  { id: 1, label: 'M' },
  { id: 2, label: 'T' },
  { id: 3, label: 'W' },
  { id: 4, label: 'T' },
  { id: 5, label: 'F', isJummah: true },
  { id: 6, label: 'S' },
];

export function Stage() {
  const [enabled, setEnabled] = useState(true);
  const [type, setType] = useState<'silent' | 'notification' | 'adhan'>('adhan');
  const [reciter, setReciter] = useState(RECITERS[0]);
  const [length, setLength] = useState<'full' | 'short'>('full');
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const toggleDay = (id: number) => {
    if (days.includes(id)) {
      setDays(days.filter((d) => d !== id));
    } else {
      setDays([...days, id].sort());
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0F0E14] flex items-end justify-center overflow-hidden font-sans text-[#F4F4F5]">
      {/* Background Dim (implies app behind it) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F0E14]/40 to-[#0F0E14]/90 pointer-events-none" />

      {/* Bottom Sheet */}
      <div className="relative w-full max-w-[420px] bg-[#16141D] rounded-t-[32px] flex flex-col shadow-[0_-10px_60px_-15px_rgba(0,0,0,0.7)] border-t border-[#2A2635] pb-8 h-[90vh]">
        {/* Subtle top edge highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#C9933A]/40 to-transparent" />
        
        {/* Drag handle */}
        <div className="w-full flex justify-center py-4 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-[#2A2635]" />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
          {/* Stage Area: The Notification Preview */}
          <div className="px-6 pt-2 pb-8 shrink-0 flex flex-col items-center">
            <h2 className="font-serif text-2xl text-[#E8E6E1] mb-1">Maghrib</h2>
            <p className="text-[#C9933A] font-serif text-lg mb-8" style={{ fontFamily: 'Amiri, serif' }}>المغرب</p>
            
            {/* The Mock Notification */}
            <div 
              className={`w-full rounded-[24px] p-4 relative overflow-hidden transition-all duration-500
                ${enabled ? 'bg-[#1C1A24] border border-[#2A2635] shadow-lg' : 'bg-[#16141D] border border-[#2A2635]/50 opacity-50'}`}
            >
              {enabled && type === 'adhan' && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#C9933A]/5 to-transparent pointer-events-none" />
              )}
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="w-6 h-6 rounded bg-[#C9933A] flex items-center justify-center shadow-[0_2px_8px_rgba(201,147,58,0.4)]">
                  <Moon className="w-3.5 h-3.5 text-[#16141D] fill-current" />
                </div>
                <span className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">Nuur · now</span>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-[15px] font-semibold text-[#F4F4F5] mb-1">
                  Maghrib · Time to pray
                </h3>
                <p className="text-[13px] text-[#A1A1AA] leading-snug">
                  {type === 'silent' && "It's time for Maghrib prayer."}
                  {type === 'notification' && "It's time for Maghrib prayer."}
                  {type === 'adhan' && `${reciter.name} · ${reciter.location} · ${length === 'full' ? 'Full' : 'Short'} Adhan`}
                </p>
              </div>

              {/* Fake Audio Waveform for Adhan */}
              {enabled && type === 'adhan' && (
                <div className="mt-4 flex items-center gap-1.5 h-6 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-[#C9933A]/20 flex items-center justify-center mr-2">
                    <Volume2 className="w-3 h-3 text-[#C9933A]" />
                  </div>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-[#C9933A]/40 rounded-full animate-pulse" 
                      style={{ 
                        height: `${Math.max(20, Math.random() * 100)}%`,
                        animationDelay: `${i * 0.05}s`
                      }} 
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 flex flex-col gap-6 pb-24">
            {/* Master Toggle */}
            <div className="bg-[#1C1A24] rounded-2xl p-4 flex items-center justify-between border border-[#2A2635]">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#F4F4F5]">Notifications</span>
                <span className="text-xs text-[#A1A1AA] mt-0.5">Enable alerts for Maghrib</span>
              </div>
              <Switch 
                checked={enabled} 
                onCheckedChange={setEnabled}
                className="data-[state=checked]:bg-[#C9933A]"
              />
            </div>

            {/* Dials (only show if enabled) */}
            <div className={`flex flex-col gap-6 transition-all duration-500 ${enabled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              
              {/* Alert Type */}
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider pl-1">Alert Type</span>
                <div className="bg-[#1C1A24] p-1 rounded-[16px] flex border border-[#2A2635]">
                  {(['silent', 'notification', 'adhan'] as const).map((t) => {
                    const isSelected = type === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-[12px] transition-all
                          ${isSelected ? 'bg-[#2A2635] shadow-sm' : 'hover:bg-[#2A2635]/50 text-[#A1A1AA]'}`}
                      >
                        {t === 'silent' && <VolumeX className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-[#F4F4F5]' : ''}`} />}
                        {t === 'notification' && <Bell className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-[#F4F4F5]' : ''}`} />}
                        {t === 'adhan' && <Volume2 className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-[#C9933A]' : ''}`} />}
                        <span className={`text-[11px] font-medium capitalize ${isSelected ? (t === 'adhan' ? 'text-[#C9933A]' : 'text-[#F4F4F5]') : ''}`}>
                          {t}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Adhan Specific Dials */}
              {type === 'adhan' && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  {/* Reciter Carousel */}
                  <div className="flex flex-col gap-3 -mx-6">
                    <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider px-7">Reciter</span>
                    <div className="flex overflow-x-auto px-6 pb-2 gap-3 no-scrollbar snap-x">
                      {RECITERS.map((r) => {
                        const isSelected = reciter.id === r.id;
                        return (
                          <button
                            key={r.id}
                            onClick={() => setReciter(r)}
                            className={`snap-start shrink-0 w-[140px] rounded-2xl p-3 text-left relative overflow-hidden transition-all border
                              ${isSelected 
                                ? 'bg-[#1C1A24] border-[#C9933A]/40 ring-1 ring-[#C9933A]/20' 
                                : 'bg-[#1C1A24]/50 border-[#2A2635] hover:border-[#2A2635]/80'}`}
                          >
                            <div className="w-full aspect-square rounded-xl mb-3 overflow-hidden relative bg-[#2A2635]">
                              <img src={r.image} alt={r.name} className="w-full h-full object-cover opacity-80 mix-blend-luminosity grayscale" />
                              {isSelected && <div className="absolute inset-0 bg-[#C9933A]/20 mix-blend-color" />}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                  <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                                </div>
                              </div>
                            </div>
                            <h4 className={`text-[13px] font-semibold leading-tight mb-1 truncate ${isSelected ? 'text-[#C9933A]' : 'text-[#F4F4F5]'}`}>
                              {r.name}
                            </h4>
                            <p className="text-[11px] text-[#A1A1AA]">{r.location}</p>
                            {isSelected && (
                              <div className="absolute top-4 right-4 w-4 h-4 bg-[#C9933A] rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-[#16141D]" strokeWidth={3} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Adhan Length */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider pl-1">Length</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLength('full')}
                        className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all border
                          ${length === 'full' 
                            ? 'bg-[#C9933A]/10 text-[#C9933A] border-[#C9933A]/30' 
                            : 'bg-[#1C1A24] text-[#A1A1AA] border-[#2A2635] hover:bg-[#2A2635]/50'}`}
                      >
                        Full (~3–5 min)
                      </button>
                      <button
                        onClick={() => setLength('short')}
                        className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all border
                          ${length === 'short' 
                            ? 'bg-[#C9933A]/10 text-[#C9933A] border-[#C9933A]/30' 
                            : 'bg-[#1C1A24] text-[#A1A1AA] border-[#2A2635] hover:bg-[#2A2635]/50'}`}
                      >
                        Short (~2 min)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Repeat Days */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-end pl-1 pr-1">
                  <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Repeat</span>
                  <span className="text-[11px] text-[#C9933A]">
                    {days.length === 7 ? 'Everyday' : `${days.length} days`}
                  </span>
                </div>
                <div className="flex justify-between">
                  {DAYS.map((d) => {
                    const isSelected = days.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        onClick={() => toggleDay(d.id)}
                        className={`w-10 h-10 rounded-full flex flex-col items-center justify-center transition-all relative border
                          ${isSelected 
                            ? (d.isJummah ? 'bg-[#C9933A] border-[#C9933A] shadow-[0_0_12px_rgba(201,147,58,0.3)]' : 'bg-[#F4F4F5] border-[#F4F4F5] text-[#16141D]') 
                            : 'bg-[#1C1A24] border-[#2A2635] hover:border-[#A1A1AA] text-[#A1A1AA]'}`}
                      >
                        <span className={`text-[13px] font-bold ${isSelected && d.isJummah ? 'text-[#16141D]' : ''}`}>
                          {d.label}
                        </span>
                        {d.isJummah && !isSelected && (
                          <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#C9933A]" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Floating Save Button */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center px-6 pointer-events-none">
          <button className="pointer-events-auto bg-[#C9933A] text-[#16141D] h-14 rounded-full px-8 flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(201,147,58,0.4)] hover:bg-[#D4A017] transition-all hover:scale-105 active:scale-95 font-semibold tracking-wide">
            Save Settings
          </button>
        </div>

      </div>
    </div>
  );
}
