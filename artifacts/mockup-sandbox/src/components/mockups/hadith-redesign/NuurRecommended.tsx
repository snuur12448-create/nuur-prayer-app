import React, { useState } from "react";
import { Search, Bookmark, Copy, Share2, RefreshCw, ChevronDown, ChevronUp, Star, BookOpen, User } from "lucide-react";

// --- Mock Data ---

const TOPICS = ["Saved", "All", "Faith", "Prayer", "Charity", "Knowledge", "Patience", "Family", "Manners", "Repentance"];

const COLLECTIONS = ["All", "Sahih Bukhari", "Sahih Muslim", "Both Sahihs"];

const FEATURED_HADITH = {
  id: "featured-1",
  arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
  translation: "The best among you (Muslims) are those who learn the Qur'an and teach it.",
  narrator: "Narrated by 'Uthman bin 'Affan",
  source: "Sahih al-Bukhari · Book of Virtues of the Qur'an · Hadith 5027",
  topic: "Knowledge",
  collection: "Bukhari",
};

const HADITHS = [
  {
    id: "h1",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    translation: "Actions are but by intentions, and every man shall have but that which he intended.",
    narrator: "'Umar bin Al-Khattab",
    source: "Sahih al-Bukhari · HD 1",
    topic: "Faith",
    collection: "Bukhari",
    chain: ["Al-Humaidi", "Sufyan", "Yahya bin Sa'id", "Muhammad bin Ibrahim", "'Alqamah bin Waqqas", "'Umar bin Al-Khattab"],
  },
  {
    id: "h2",
    arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    translation: "None of you truly believes until he loves for his brother what he loves for himself.",
    narrator: "Anas bin Malik",
    source: "Muttafaq Alayh · HD 13",
    topic: "Manners",
    collection: "Both Sahihs",
    chain: ["Musaddad", "Yahya", "Shu'bah", "Qatadah", "Anas bin Malik"],
  },
  {
    id: "h3",
    arabic: "لَيْسَ الشَّدِيدُ بِالصُّرْعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ",
    translation: "The strong man is not the one who can wrestle, but it is the one who can control himself when he is angry.",
    narrator: "Abu Huraira",
    source: "Sahih Muslim · HD 2609",
    topic: "Patience",
    collection: "Muslim",
    chain: ["Zuhair bin Harb", "Jarir", "Suhail", "His Father", "Abu Huraira"],
  },
  {
    id: "h4",
    arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ",
    translation: "Smiling in the face of your brother is charity.",
    narrator: "Abu Dharr",
    source: "Sahih al-Bukhari · HD 133", // Simplified
    topic: "Charity",
    collection: "Bukhari",
    chain: ["Muhammad bin Bashar", "Yahya bin Sa'id", "Hushaim", "Abu Dharr"],
  },
];

// --- Subcomponents ---

const KhatamMedallion = () => (
  <svg viewBox="0 0 100 100" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 0 L60 35 L95 25 L75 55 L100 80 L65 75 L50 100 L35 75 L0 80 L25 55 L5 25 L40 35 Z" fill="#C9A14B" />
    <path d="M50 15 L55 40 L80 30 L65 50 L85 70 L60 65 L50 85 L40 65 L15 70 L35 50 L20 30 L45 40 Z" fill="none" stroke="#C9A14B" strokeWidth="1" />
  </svg>
);

const MushafBorder = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative p-5 ${className}`}>
    {/* Outer Double Border */}
    <div className="absolute inset-0 border-[1.5px] border-[#C9A14B]/30 m-1 pointer-events-none" />
    <div className="absolute inset-0 border border-[#C9A14B]/10 m-2.5 pointer-events-none" />
    
    {/* Corner Florets */}
    <div className="absolute top-0 left-0 w-5 h-5 border-r-[1.5px] border-b-[1.5px] border-[#C9A14B]/70 rounded-br-md pointer-events-none" />
    <div className="absolute top-0 right-0 w-5 h-5 border-l-[1.5px] border-b-[1.5px] border-[#C9A14B]/70 rounded-bl-md pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-5 h-5 border-r-[1.5px] border-t-[1.5px] border-[#C9A14B]/70 rounded-tr-md pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-5 h-5 border-l-[1.5px] border-t-[1.5px] border-[#C9A14B]/70 rounded-tl-md pointer-events-none" />

    <div className="relative z-10">{children}</div>
  </div>
);

// --- Main Component ---

export function NuurRecommended() {
  const [search, setSearch] = useState("");
  const [activeTopic, setActiveTopic] = useState("All");
  const [activeCollection, setActiveCollection] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>("h1");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(["h1", "featured-1"]));

  const toggleSave = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getCollectionColor = (col: string) => {
    if (col.includes("Bukhari") && col.includes("Muslim")) return "#C9A14B";
    if (col.includes("Bukhari")) return "#10B981"; // Emerald
    if (col.includes("Muslim")) return "#3B82F6"; // Sapphire
    return "#C9A14B";
  };

  return (
    <div className="w-[390px] h-[844px] overflow-y-auto bg-[#0F1424] text-[#F1E9D2] antialiased relative font-['Inter'] shadow-2xl flex flex-col">
      
      {/* Background Star Constellation Layer */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-screen"
        style={{
          backgroundImage: "radial-gradient(1px 1px at 20px 30px, #C9A14B, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, #C9A14B, rgba(0,0,0,0)), radial-gradient(2px 2px at 90px 40px, #C9A14B, rgba(0,0,0,0)), radial-gradient(1px 1px at 160px 120px, #C9A14B, rgba(0,0,0,0))",
          backgroundSize: "200px 200px"
        }}
      />

      {/* Dawn Glow Radial Behind Header */}
      <div className="absolute top-0 inset-x-0 h-64 bg-radial-gradient from-[#E8CB7B]/5 via-[#C9A14B]/[0.02] to-transparent pointer-events-none mix-blend-screen" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(201, 161, 75, 0.15) 0%, rgba(201, 161, 75, 0) 70%)' }} />

      {/* --- HEADER --- */}
      <div className="relative z-10 px-5 pt-12 pb-5 space-y-5">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F1E9D2]">Sahih Hadiths</h1>
            <p className="text-[#E8CB7B] font-['Amiri'] text-lg tracking-wider opacity-90 mt-0.5">الأحاديث الصحيحة</p>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-[3px] border border-[#C9A14B]/30 bg-[#C9A14B]/5 backdrop-blur-sm shadow-[0_0_12px_rgba(201,161,75,0.05)]">
            <span className="text-[#E8CB7B] text-[9px] font-bold tracking-[0.1em] uppercase">Sahih Only</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input 
            type="text"
            placeholder="Search hadiths…"
            className="w-full bg-transparent border-b border-[#C9A14B]/30 py-2.5 pl-8 pr-8 text-[15px] text-[#F1E9D2] placeholder:text-[#F1E9D2]/40 focus:outline-none focus:border-[#E8CB7B] transition-colors rounded-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A14B]/60" />
        </div>

        {/* Collection Filter */}
        <div className="flex gap-2">
          {COLLECTIONS.map(c => {
            const isActive = activeCollection === c;
            return (
              <button
                key={c}
                onClick={() => setActiveCollection(c)}
                className={`px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase transition-colors border ${
                  isActive 
                    ? "bg-[#C9A14B] border-[#C9A14B] text-[#0F1424]" 
                    : "bg-transparent border-[#C9A14B]/20 text-[#F1E9D2]/60 hover:border-[#C9A14B]/50"
                }`}
              >
                {c.replace("Sahih", "").trim() || "All"}
              </button>
            )
          })}
        </div>
      </div>

      {/* --- TOPIC RAIL --- */}
      <div className="w-full border-b border-[#C9A14B]/10 relative z-10 bg-[#0F1424]/80 backdrop-blur-md">
        <div className="flex overflow-x-auto px-5 py-3.5 gap-2.5 no-scrollbar items-center">
          {TOPICS.map(t => {
            const isActive = activeTopic === t;
            const isSaved = t === "Saved";
            return (
              <button
                key={t}
                onClick={() => setActiveTopic(t)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-1.5 border rounded-full transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-[#C9A14B] border-[#C9A14B] text-[#0F1424]'
                    : 'bg-transparent border-[#C9A14B]/30 text-[#F1E9D2]/70 hover:border-[#C9A14B]/60'
                }`}
              >
                {isSaved && <Bookmark className={`w-3.5 h-3.5 ${isActive ? 'text-[#0F1424]' : 'text-[#E8CB7B]'}`} fill={isActive ? 'currentColor' : 'none'} />}
                <span className="text-[11px] font-bold tracking-widest uppercase">{t}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-6 space-y-8 relative z-10 flex-1">
        
        {/* --- HERO: TODAY'S READING --- */}
        <MushafBorder className="bg-[#141A2E] shadow-xl">
          <KhatamMedallion />
          <div className="flex flex-col items-center relative">
            
            {/* Top Frame */}
            <div className="w-full flex justify-between items-center mb-6">
              <span className="text-[#C9A14B]/70 font-['Playfair_Display'] text-[10px] tracking-[0.2em] uppercase font-bold">14 Safar 1447</span>
              <div className="flex-1 mx-4 h-px bg-gradient-to-r from-transparent via-[#C9A14B]/40 to-transparent" />
              <div className="flex items-center gap-1.5 border border-[#C9A14B]/30 px-1.5 py-0.5 bg-[#C9A14B]/10 rounded-[2px]">
                <Star className="w-2.5 h-2.5 text-[#E8CB7B]" fill="currentColor" />
                <span className="text-[8px] tracking-[0.15em] font-bold text-[#E8CB7B]">FEATURED HADITH</span>
              </div>
            </div>

            <div className="font-['Amiri_Quran'] text-2xl text-[#E8CB7B] mb-4">﷽</div>

            {/* Arabic */}
            <div className="px-2 mb-6">
              <p className="font-['Amiri_Quran'] text-[26px] leading-[2.2] text-[#F1E9D2] text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" dir="rtl">
                {FEATURED_HADITH.arabic}
              </p>
            </div>

            {/* Translation */}
            <div className="px-4 relative mb-6">
              <span className="text-4xl font-['Playfair_Display'] text-[#C9A14B]/20 absolute -top-4 -left-1">"</span>
              <p className="font-['Playfair_Display'] text-[15px] italic leading-relaxed text-[#F1E9D2]/90 text-center relative z-10 px-2">
                {FEATURED_HADITH.translation}
              </p>
              <span className="text-4xl font-['Playfair_Display'] text-[#C9A14B]/20 absolute -bottom-7 -right-1">"</span>
            </div>

            {/* Source */}
            <div className="text-center w-full px-4 mb-6">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#C9A14B]/80 font-bold mb-1.5">{FEATURED_HADITH.narrator}</p>
              <p className="text-[9px] uppercase tracking-wider text-[#F1E9D2]/50 font-medium">{FEATURED_HADITH.source}</p>
            </div>

            {/* Action Row */}
            <div className="flex justify-between items-center w-full pt-4 border-t border-[#C9A14B]/20 px-2">
               <button onClick={(e) => toggleSave(FEATURED_HADITH.id, e)} className="p-2 text-[#C9A14B] hover:opacity-80 transition-opacity">
                <Bookmark className="w-4 h-4" fill={savedIds.has(FEATURED_HADITH.id) ? "currentColor" : "none"} />
               </button>
               <div className="flex gap-4">
                 <button className="p-2 text-[#C9A14B] hover:opacity-80 transition-opacity"><Copy className="w-4 h-4" /></button>
                 <button className="p-2 text-[#C9A14B] hover:opacity-80 transition-opacity"><Share2 className="w-4 h-4" /></button>
                 <button className="p-2 text-[#C9A14B] hover:opacity-80 transition-opacity"><RefreshCw className="w-4 h-4" /></button>
               </div>
            </div>

          </div>
        </MushafBorder>

        {/* Section Label */}
        <div className="flex items-center gap-3 py-2">
          <div className="h-px bg-gradient-to-r from-transparent to-[#C9A14B]/50 flex-1" />
          <span className="text-[9px] tracking-[0.25em] font-bold text-[#E8CB7B]">CURATED COLLECTION · 124 HADITHS</span>
          <div className="h-px bg-gradient-to-l from-transparent to-[#C9A14B]/50 flex-1" />
        </div>

        {/* --- LIST CARDS --- */}
        <div className="space-y-4 pb-12">
          {HADITHS.map(hadith => {
            const isExpanded = expandedId === hadith.id;
            const isSaved = savedIds.has(hadith.id);
            const colColor = getCollectionColor(hadith.collection);

            return (
              <div 
                key={hadith.id} 
                className="bg-[#141A2E] relative transition-all duration-300"
                onClick={() => setExpandedId(isExpanded ? null : hadith.id)}
              >
                {/* Top/Bottom Thin Rules with corner ticks */}
                <div className="absolute top-0 inset-x-0 h-px bg-[#C9A14B]/30" />
                <div className="absolute bottom-0 inset-x-0 h-px bg-[#C9A14B]/30" />
                <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#C9A14B]" />
                <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[#C9A14B]" />
                <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-[#C9A14B]" />
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[#C9A14B]" />

                <div className="p-4 cursor-pointer">
                  
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      {/* Collection Ink Stamp */}
                      <span 
                        className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 border"
                        style={{ color: colColor, borderColor: `${colColor}50`, backgroundColor: `${colColor}10` }}
                      >
                        {hadith.collection === "Both Sahihs" ? "Bukhari & Muslim" : hadith.collection}
                      </span>
                      {/* Topic */}
                      <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#F1E9D2]/50">
                        {hadith.topic}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button onClick={(e) => toggleSave(hadith.id, e)} className="text-[#C9A14B]">
                        <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
                      </button>
                      <button className="text-[#F1E9D2]/40">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {/* Chain Reveal Line (Only when expanded) */}
                    {isExpanded && (
                      <div className="flex flex-col items-center opacity-80 pt-2 shrink-0 w-8">
                        <div className="text-[#E8CB7B] text-[10px] mb-1 font-['Amiri'] leading-none">ﷺ</div>
                        <div className="flex-1 w-px bg-gradient-to-b from-[#C9A14B] to-[#C9A14B]/10 min-h-[40px] my-1 relative">
                           {/* Dots distributed along the line */}
                           {hadith.chain && hadith.chain.length > 0 && Array.from({length: Math.min(3, hadith.chain.length - 1)}).map((_, i) => (
                             <div key={i} className="absolute -left-[2.5px] w-1.5 h-1.5 rounded-full bg-[#141A2E] border border-[#C9A14B]" style={{ top: `${(i+1) * 25}%` }} />
                           ))}
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C9A14B]/40 mt-1" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {/* Arabic */}
                      <p 
                        className={`font-['Amiri'] text-xl leading-[1.8] text-[#F1E9D2] text-right mb-3 ${!isExpanded ? 'truncate' : ''}`}
                        dir="rtl"
                      >
                        {hadith.arabic}
                      </p>

                      {/* Translation */}
                      <p className={`font-['Playfair_Display'] text-[15px] italic text-[#F1E9D2]/90 leading-relaxed mb-4 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                        "{hadith.translation}"
                      </p>

                      {/* Footer Info (Collapsed vs Expanded) */}
                      {!isExpanded ? (
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A14B]/80">{hadith.narrator}</span>
                        </div>
                      ) : (
                        <div className="space-y-4 mt-2">
                           
                           {/* Detailed Chain View next to line */}
                           <div className="bg-[#0F1424] border border-[#C9A14B]/10 p-3 rounded-sm">
                             <p className="text-[9px] uppercase tracking-widest text-[#E8CB7B] font-bold mb-2">Chain of Narration</p>
                             <div className="space-y-1.5">
                               {[...hadith.chain].reverse().map((name, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-[#C9A14B]/50" />
                                    <span className={`text-[11px] ${idx === 0 ? 'text-[#E8CB7B] font-semibold' : 'text-[#F1E9D2]/60'}`}>{name}</span>
                                    {idx === 0 && <span className="text-[10px] text-[#E8CB7B] font-['Amiri'] ml-1">ﷺ</span>}
                                  </div>
                               ))}
                             </div>
                           </div>

                           <div className="flex justify-between items-center border-t border-[#C9A14B]/10 pt-3">
                             <div className="space-y-0.5">
                               <p className="text-[10px] font-bold uppercase tracking-wider text-[#C9A14B]/90">{hadith.narrator}</p>
                               <p className="text-[9px] uppercase tracking-wider text-[#F1E9D2]/50 font-medium">Sahih · Authenticated by {hadith.collection === "Both Sahihs" ? "Bukhari & Muslim" : hadith.collection}</p>
                             </div>
                             <div className="flex gap-4">
                               <button className="text-[#C9A14B] hover:text-[#E8CB7B]"><Copy className="w-4 h-4" /></button>
                               <button className="text-[#C9A14B] hover:text-[#E8CB7B]"><Share2 className="w-4 h-4" /></button>
                             </div>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default NuurRecommended;
