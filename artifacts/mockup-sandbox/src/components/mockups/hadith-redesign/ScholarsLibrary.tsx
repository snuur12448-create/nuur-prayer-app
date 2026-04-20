import React, { useState } from "react";
import { Search, Bookmark, Share, Copy, ChevronDown, ChevronUp, RefreshCw, X, Library } from "lucide-react";

// Mock Data
const TOPICS = ["Saved", "All", "Faith", "Prayer", "Charity", "Knowledge", "Patience", "Family", "Manners", "Repentance"];

const HADITHS = [
  {
    id: "1",
    topic: "Faith",
    collection: "Bukhari",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى...",
    translation: "Actions are but by intentions, and every man shall have but that which he intended.",
    narrator: "Transmitted by 'Umar bin Al-Khattab",
    source: "SAHIH AL-BUKHARI · BK 1 · HD 1"
  },
  {
    id: "2",
    topic: "Faith",
    collection: "Bukhari & Muslim",
    arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    translation: "None of you truly believes until he loves for his brother what he loves for himself.",
    narrator: "Transmitted by Anas bin Malik",
    source: "MUTTAFAQ ALAYH · BK 1 · HD 13"
  },
  {
    id: "3",
    topic: "Patience",
    collection: "Muslim",
    arabic: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ",
    translation: "The strong man is not the one who can wrestle, but it is the one who can control himself when he is angry.",
    narrator: "Transmitted by Abu Huraira",
    source: "SAHIH MUSLIM · BK 45 · HD 136"
  },
  {
    id: "4",
    topic: "Manners",
    collection: "Bukhari & Muslim",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    translation: "Whoever believes in Allah and the Last Day, let him speak good or remain silent.",
    narrator: "Transmitted by Abu Huraira",
    source: "MUTTAFAQ ALAYH · BK 78 · HD 154"
  }
];

const LIVE_HADITH = {
  id: "live-1",
  topic: "Knowledge",
  collection: "Bukhari",
  arabic: "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ",
  translation: "If Allah wants to do good to a person, He makes him comprehend the religion.",
  narrator: "Transmitted by Mu'awiya",
  source: "SAHIH AL-BUKHARI · BK 3 · HD 71"
};

export function ScholarsLibrary() {
  const [activeTopic, setActiveTopic] = useState("All");
  const [activeCollection, setActiveCollection] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [savedCards, setSavedCards] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-[390px] h-[844px] overflow-y-auto bg-[#F7F5F0] text-[#3E1A1A] font-['Cormorant_Garamond'] selection:bg-[#C9A14B] selection:text-white relative pb-20">
      
      {/* Background Texture (subtle noise) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" 
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"
        }}
      />

      <div className="relative z-10 pt-12 px-5 pb-6 bg-[#F7F5F0] border-b border-[#3E1A1A]/10">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#C9A14B] font-bold">Sahih Only</span>
            </div>
            <h1 className="text-3xl font-semibold italic text-[#2A1212]">Scholar's Library</h1>
            <div className="font-['Amiri'] text-lg text-[#3E1A1A]/70 mt-1">الأحاديث الصحيحة</div>
          </div>
          <div className="text-[#8B2323] opacity-80">
            <Library size={24} strokeWidth={1.5} />
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3E1A1A]/40">
            <Search size={16} />
          </div>
          <input 
            type="text"
            placeholder="Search the catalogue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/60 border border-[#3E1A1A]/20 rounded-sm py-2.5 pl-11 pr-10 text-[15px] placeholder:text-[#3E1A1A]/40 focus:outline-none focus:border-[#C9A14B] focus:ring-1 focus:ring-[#C9A14B] transition-all font-sans"
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3E1A1A]/40 hover:text-[#3E1A1A]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Collection Spines */}
        <div className="flex gap-1 mb-6 h-12">
          {["All", "Sahih Bukhari", "Sahih Muslim", "Both Sahihs"].map(c => {
            const isActive = activeCollection === c;
            return (
              <button 
                key={c}
                onClick={() => setActiveCollection(c)}
                className={`flex-1 relative group overflow-hidden border transition-all ${
                  isActive 
                    ? "bg-[#8B2323] border-[#611818] text-[#F7F5F0]" 
                    : "bg-[#EAE5D9] border-[#3E1A1A]/10 text-[#3E1A1A]/70 hover:bg-[#E2DCCF]"
                } flex flex-col items-center justify-center`}
              >
                {isActive && (
                  <div className="absolute top-0 w-full h-[2px] bg-[#C9A14B]"></div>
                )}
                <div className={`font-sans text-[10px] uppercase tracking-wider ${isActive ? 'font-bold' : 'font-medium'} px-1 text-center leading-tight`}>
                  {c.replace('Sahih ', '').replace('Both ', 'Both\n')}
                </div>
                {isActive && (
                  <div className="absolute bottom-1 w-4 h-[1px] bg-[#C9A14B]/50"></div>
                )}
              </button>
            )
          })}
        </div>

        {/* Topics Rail */}
        <div className="flex overflow-x-auto gap-3 pb-2 -mx-5 px-5 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {TOPICS.map((topic) => {
            const isActive = activeTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => setActiveTopic(topic)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full border flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-[#3E1A1A] border-[#3E1A1A] text-[#F7F5F0]"
                    : "bg-transparent border-[#3E1A1A]/20 text-[#3E1A1A]/70 hover:border-[#3E1A1A]/40"
                }`}
              >
                {topic === "Saved" && <Bookmark size={12} className={isActive ? "text-[#C9A14B]" : ""} />}
                <span className="font-sans text-xs tracking-wide">{topic}</span>
              </button>
            )
          })}
        </div>

      </div>

      <div className="px-5 py-6 space-y-8 relative z-10">

        {/* Hero: Today's Reading */}
        <div className="relative bg-white border border-[#3E1A1A]/15 shadow-sm p-1 pt-1">
          <div className="border border-[#3E1A1A]/10 p-5 bg-[#FCFBF8]">
            <div className="flex justify-between items-start mb-4 border-b border-[#3E1A1A]/10 pb-3">
              <div className="font-sans text-[10px] uppercase tracking-[0.15em] text-[#8B2323] font-semibold">Today's Reading</div>
              <div className="font-sans text-[9px] uppercase tracking-wider text-[#3E1A1A]/50">14 Safar 1445</div>
            </div>
            
            <div className="text-center mb-6">
              <div className="font-['Amiri'] text-lg text-[#C9A14B] mb-2">﷽</div>
              <div className="font-sans text-[11px] tracking-widest uppercase text-[#3E1A1A]/60 mb-1">{LIVE_HADITH.topic}</div>
              <div className="w-12 h-[1px] bg-[#C9A14B]/40 mx-auto"></div>
            </div>

            <div className="font-['Amiri'] text-xl leading-loose text-center text-[#2A1212] mb-5" dir="rtl">
              {LIVE_HADITH.arabic}
            </div>

            <div className="text-[17px] leading-relaxed text-center mb-6 px-2 text-[#3E1A1A]">
              "{LIVE_HADITH.translation}"
            </div>

            <div className="text-center font-sans text-[11px] tracking-wider text-[#8B2323] mb-2 uppercase">
              {LIVE_HADITH.narrator}
            </div>
            <div className="text-center font-mono text-[10px] text-[#3E1A1A]/50 mb-6">
              {LIVE_HADITH.source}
            </div>

            <div className="flex justify-center items-center gap-6 border-t border-[#3E1A1A]/10 pt-4">
              <button onClick={(e) => toggleSave("live", e)} className={`p-2 transition-colors ${savedCards["live"] ? "text-[#C9A14B]" : "text-[#3E1A1A]/50 hover:text-[#3E1A1A]"}`}>
                <Bookmark size={16} fill={savedCards["live"] ? "currentColor" : "none"} />
              </button>
              <button className="p-2 text-[#3E1A1A]/50 hover:text-[#3E1A1A] transition-colors">
                <Copy size={16} />
              </button>
              <button className="p-2 text-[#3E1A1A]/50 hover:text-[#3E1A1A] transition-colors">
                <Share size={16} />
              </button>
              <button className="p-2 text-[#3E1A1A]/50 hover:text-[#3E1A1A] transition-colors ml-4">
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#3E1A1A]/50 font-semibold border-b border-[#3E1A1A]/20 pb-1 w-full">
            Catalogue Index
          </div>
        </div>

        {/* List Cards */}
        <div className="space-y-4">
          {HADITHS.map((hadith) => {
            const isExpanded = expandedCards[hadith.id];
            const isSaved = savedCards[hadith.id];

            return (
              <div 
                key={hadith.id}
                onClick={() => toggleExpand(hadith.id)}
                className="bg-white border border-[#3E1A1A]/20 shadow-sm relative overflow-hidden cursor-pointer group"
              >
                {/* Horizontal ruled lines background */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-5"
                  style={{
                    backgroundImage: "repeating-linear-gradient(transparent, transparent 23px, #3E1A1A 23px, #3E1A1A 24px)"
                  }}
                />

                <div className="p-4 relative z-10">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {/* Ink stamp style collection badge */}
                      <div className="border border-[#8B2323]/30 text-[#8B2323] px-1.5 py-0.5 font-sans text-[8px] uppercase tracking-widest rounded-sm bg-[#8B2323]/5">
                        {hadith.collection}
                      </div>
                      <div className="font-sans text-[9px] uppercase tracking-wider text-[#3E1A1A]/50">
                        {hadith.topic}
                      </div>
                    </div>
                    <button 
                      onClick={(e) => toggleSave(hadith.id, e)}
                      className={`p-1 -mr-1 transition-colors ${isSaved ? "text-[#C9A14B]" : "text-[#3E1A1A]/30 group-hover:text-[#3E1A1A]/50"}`}
                    >
                      <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} strokeWidth={isSaved ? 2 : 1.5} />
                    </button>
                  </div>

                  <div className={`font-['Amiri'] text-lg leading-relaxed text-[#2A1212] text-right mb-3 ${isExpanded ? '' : 'line-clamp-2'}`} dir="rtl">
                    {hadith.arabic}
                  </div>

                  <div className={`text-[16px] leading-snug text-[#3E1A1A]/90 ${isExpanded ? 'mb-4' : 'line-clamp-2 mb-2'}`}>
                    "{hadith.translation}"
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[#3E1A1A]/10">
                      <div className="font-sans text-[11px] tracking-wider text-[#8B2323] uppercase mb-1">
                        {hadith.narrator}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="font-mono text-[9px] text-[#3E1A1A]/50 uppercase tracking-widest">
                          {hadith.source}
                        </div>
                        <div className="flex items-center gap-3 text-[#3E1A1A]/40">
                          <button className="hover:text-[#3E1A1A] transition-colors p-1" onClick={(e) => e.stopPropagation()}>
                            <Copy size={14} />
                          </button>
                          <button className="hover:text-[#3E1A1A] transition-colors p-1" onClick={(e) => e.stopPropagation()}>
                            <Share size={14} />
                          </button>
                          <ChevronUp size={14} className="ml-1" />
                        </div>
                      </div>
                    </div>
                  )}

                  {!isExpanded && (
                    <div className="flex justify-between items-center mt-2">
                      <div className="font-sans text-[10px] tracking-wider text-[#8B2323] uppercase">
                        {hadith.narrator.replace('Transmitted by ', '')}
                      </div>
                      <ChevronDown size={14} className="text-[#3E1A1A]/30 group-hover:text-[#3E1A1A]/60" />
                    </div>
                  )}

                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  );
}
