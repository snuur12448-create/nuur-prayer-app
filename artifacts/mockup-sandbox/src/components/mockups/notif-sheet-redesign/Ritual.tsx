import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, BellOff, Bell, Volume2, Moon } from 'lucide-react';

export function Ritual() {
  const [selected, setSelected] = useState('adhan');

  return (
    <div className="min-h-screen w-full bg-[#0F0E14] flex items-center justify-center overflow-hidden font-sans">
      <div className="w-[390px] h-[844px] relative bg-[#0F0E14] flex flex-col shadow-2xl border border-white/[0.03]">
        {/* Candlelight Glow */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#C9933A] opacity-[0.04] blur-[80px] rounded-full pointer-events-none" />

        {/* Top Header Breadcrumb */}
        <div className="pt-16 pb-6 flex flex-col items-center relative z-10">
          <div className="flex items-center gap-4 opacity-80">
            <div className="w-10 h-[1px] bg-gradient-to-r from-transparent to-[#C9933A]/50" />
            <div className="flex items-center gap-2">
              <span className="text-[#C9933A] text-[10px] tracking-[0.2em] uppercase font-bold">Maghrib</span>
              <span className="text-[#C9933A]/60 text-xs">·</span>
              <span className="text-[#C9933A] font-['Amiri'] text-sm pb-0.5">المغرب</span>
            </div>
            <div className="w-10 h-[1px] bg-gradient-to-l from-transparent to-[#C9933A]/50" />
          </div>
          
          {/* Pagination Dots */}
          <div className="flex gap-2.5 mt-10">
            <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9933A] shadow-[0_0_8px_rgba(201,147,58,0.6)] ring-4 ring-[#C9933A]/10" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 flex flex-col relative z-10 justify-center pb-20">
          <div className="text-center mb-10">
             <div className="text-[#C9933A]/40 font-['Amiri'] text-3xl mb-5 select-none leading-none">✦</div>
             <h1 className="font-['Playfair_Display',serif] text-4xl text-white font-medium tracking-tight mb-4">
               How shall we call you?
             </h1>
             <p className="text-white/40 text-[13px] tracking-wide max-w-[240px] mx-auto leading-relaxed">
               Choose how you would like to be reminded for this prayer.
             </p>
          </div>

          <div className="flex flex-col gap-4 mt-2">
             <OptionCard 
               id="silent" 
               icon={<BellOff size={18} className="text-white/40" strokeWidth={2.5} />} 
               title="Silent" 
               desc="Listen with your heart" 
               selected={selected === 'silent'}
               onClick={() => setSelected('silent')}
             />
             <OptionCard 
               id="notification" 
               icon={<Bell size={18} className="text-white/60" strokeWidth={2.5} />} 
               title="Gentle Notification" 
               desc="A soft chime" 
               selected={selected === 'notification'}
               onClick={() => setSelected('notification')}
             />
             <OptionCard 
               id="adhan" 
               icon={<Volume2 size={18} className="text-[#C9933A]" strokeWidth={2.5} />} 
               title="Full Adhan" 
               desc="The full call to prayer" 
               selected={selected === 'adhan'}
               onClick={() => setSelected('adhan')}
             />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pb-12 pt-6 px-6 flex items-center justify-between relative z-10 border-t border-white/[0.04] bg-gradient-to-t from-[#0F0E14] to-transparent">
          <button className="text-white/40 hover:text-white/80 transition-colors flex items-center gap-2 text-sm font-medium w-24">
             <ArrowLeft size={16} /> Back
          </button>
          
          <span className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-medium">Step 2 of 3</span>
          
          <button className="bg-[#C9933A] text-[#0F0E14] hover:bg-[#D4A017] transition-all flex items-center justify-end gap-2 text-sm font-bold px-5 py-3 rounded-full shadow-[0_4px_20px_rgba(201,147,58,0.25)] hover:shadow-[0_4px_24px_rgba(201,147,58,0.4)] w-32">
             Continue <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

function OptionCard({ id, icon, title, desc, selected, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full text-left p-5 rounded-2xl flex items-center gap-5 transition-all duration-300 relative overflow-hidden group ${
        selected 
          ? 'bg-[#C9933A]/[0.06] border-[#C9933A]/40 shadow-[0_8px_32px_rgba(201,147,58,0.08)] scale-[1.02]' 
          : 'bg-[#1A1822]/40 border-white/[0.04] hover:bg-[#1A1822]/80 hover:border-white/10 scale-100'
      } border`}
    >
      {selected && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#C9933A]/[0.08] to-transparent" />
      )}
      
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors relative z-10 ${
        selected ? 'bg-[#C9933A]/20' : 'bg-white/[0.04] group-hover:bg-white/[0.08]'
      }`}>
        {icon}
      </div>
      
      <div className="flex-1 relative z-10">
        <h3 className={`text-[15px] font-semibold tracking-wide mb-1 transition-colors ${
          selected ? 'text-[#C9933A]' : 'text-white/90'
        }`}>{title}</h3>
        <p className={`text-[13px] font-['Playfair_Display',serif] italic transition-colors ${
          selected ? 'text-[#C9933A]/70' : 'text-white/40'
        }`}>{desc}</p>
      </div>

      {selected && (
        <div className="w-8 h-8 flex items-center justify-center animate-in fade-in zoom-in duration-500 relative z-10">
          <Moon size={18} fill="#C9933A" stroke="#C9933A" className="opacity-90" />
        </div>
      )}
    </button>
  );
}
