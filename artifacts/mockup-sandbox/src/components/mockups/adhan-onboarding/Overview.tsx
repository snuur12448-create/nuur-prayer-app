import React, { useState } from "react";
import { Bell, BellOff, Volume2, Play, Square, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertChoice = "silent" | "notification" | "adhan";

const ALERT_OPTIONS = [
  { id: "silent", icon: BellOff, title: "Silent" },
  { id: "notification", icon: Bell, title: "Gentle" },
  { id: "adhan", icon: Volume2, title: "Full Adhan" },
] as const;

const RECITERS = [
  { id: "alafasy", name: "Sheikh Mishary Rashid Alafasy", location: "Kuwait" },
  { id: "sudais", name: "Sheikh Abdul Rahman Al-Sudais", location: "Makkah" },
  { id: "ghamdi", name: "Sheikh Saad Al-Ghamdi", location: "Saudi Arabia" },
  { id: "ozcan", name: "Hafiz Mustafa Özcan", location: "Istanbul" },
  { id: "husary", name: "Sheikh Mahmoud Khalil Al-Husary", location: "Cairo" },
];

export function Overview() {
  const [alert, setAlert] = useState<AlertChoice>("adhan");
  const [reciterId, setReciterId] = useState<string>("alafasy");
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const togglePreview = (id: string) => {
    if (previewingId === id) setPreviewingId(null);
    else setPreviewingId(id);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-[#0F0E14] text-[rgba(255,255,255,0.92)] font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[rgba(201,147,58,0.06)] blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 opacity-80">
          <div className="w-8 h-[1px] bg-[rgba(201,147,58,0.4)] opacity-60" />
          <div className="flex items-center gap-2">
            <span className="text-[#C9933A] text-[10px] tracking-[0.2em] font-bold">NUUR</span>
            <span className="text-[rgba(201,147,58,0.6)] text-xs">·</span>
            <span className="text-[#C9933A] font-['Playfair_Display'] text-sm">نور</span>
          </div>
          <div className="w-8 h-[1px] bg-[rgba(201,147,58,0.4)] opacity-60" />
        </div>
        <button className="text-[rgba(255,255,255,0.45)] text-sm font-medium hover:text-[rgba(255,255,255,0.92)] transition-colors">
          Skip
        </button>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-32 relative z-10">
        <div className="mb-10 mt-4">
          <h1 className="font-['Playfair_Display'] text-[32px] font-medium tracking-tight mb-3 text-white">
            Call to prayer
          </h1>
          <p className="text-[rgba(255,255,255,0.45)] text-[15px] leading-relaxed">
            Choose how you'd like to be reminded for the five daily prayers. You can fine-tune this later in settings.
          </p>
        </div>

        {/* Alert Type Segmented Control */}
        <div className="mb-10">
          <h2 className="text-[13px] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.45)] mb-4 font-semibold">
            Alert Type
          </h2>
          <div className="flex gap-3">
            {ALERT_OPTIONS.map((opt) => {
              const isSelected = alert === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setAlert(opt.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-3 py-5 rounded-2xl border transition-all duration-300",
                    isSelected
                      ? "bg-[rgba(201,147,58,0.08)] border-[rgba(201,147,58,0.4)] shadow-[0_0_20px_rgba(201,147,58,0.1)]"
                      : "bg-[rgba(26,24,34,0.55)] border-[rgba(255,255,255,0.05)] hover:bg-[rgba(26,24,34,0.8)]"
                  )}
                >
                  <opt.icon
                    size={24}
                    className={isSelected ? "text-[#C9933A]" : "text-[rgba(255,255,255,0.45)]"}
                    strokeWidth={1.5}
                  />
                  <span
                    className={cn(
                      "text-[13px] font-medium",
                      isSelected ? "text-[#C9933A]" : "text-[rgba(255,255,255,0.6)]"
                    )}
                  >
                    {opt.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reciter List (Only if Adhan) */}
        <div className={cn("transition-all duration-500", alert === "adhan" ? "opacity-100 block" : "opacity-50 pointer-events-none")}>
          <h2 className="text-[13px] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.45)] mb-4 font-semibold">
            Reciter
          </h2>
          <div className="flex flex-col gap-2">
            {RECITERS.map((r) => {
              const isSelected = reciterId === r.id;
              const isPreviewing = previewingId === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    if (alert === "adhan") setReciterId(r.id);
                  }}
                  className={cn(
                    "flex items-center w-full text-left p-4 rounded-xl border transition-all duration-200 group",
                    isSelected && alert === "adhan"
                      ? "bg-[rgba(201,147,58,0.06)] border-[rgba(201,147,58,0.3)]"
                      : "bg-[rgba(26,24,34,0.55)] border-[rgba(255,255,255,0.05)] hover:bg-[rgba(26,24,34,0.8)]"
                  )}
                >
                  <div className="flex-1 pr-4">
                    <div className={cn("text-[15px] font-medium mb-1", isSelected && alert === "adhan" ? "text-[#C9933A]" : "text-white")}>
                      {r.name}
                    </div>
                    <div className="text-[13px] text-[rgba(255,255,255,0.45)]">
                      {r.location}
                    </div>
                  </div>

                  {/* Preview Button */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePreview(r.id);
                    }}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center mr-3 border transition-colors",
                      isPreviewing
                        ? "bg-[rgba(201,147,58,0.18)] border-[rgba(201,147,58,0.4)]"
                        : "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)]"
                    )}
                  >
                    {isPreviewing ? (
                      <Square size={14} className="text-[#C9933A]" fill="currentColor" />
                    ) : (
                      <Play size={14} className="text-white ml-0.5" fill="currentColor" />
                    )}
                  </div>

                  {/* Selection Indicator */}
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center border transition-all",
                    isSelected && alert === "adhan"
                      ? "bg-[#C9933A] border-[#C9933A]"
                      : "border-[rgba(255,255,255,0.2)] bg-transparent"
                  )}>
                    {isSelected && alert === "adhan" && <Check size={14} className="text-[#0F0E14]" strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-[#0F0E14] via-[#0F0E14] to-transparent z-20">
        <button className="w-full bg-white text-[#0F0E14] flex items-center justify-center gap-2 py-4 rounded-full font-medium text-[16px] hover:bg-gray-100 transition-colors">
          <span>Enable Adhan reminders</span>
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
