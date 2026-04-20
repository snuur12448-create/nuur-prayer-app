import React, { useState } from "react";
import { Search, ChevronDown, ChevronUp, Copy, Share2, Bookmark, RefreshCw, X, Star, BookOpen, User, Book } from "lucide-react";

// Colors
const EMERALD_DARK = "#051A11";
const EMERALD = "#092E1F";
const EMERALD_LIGHT = "#124D35";
const BONE = "#F4F1EA";
const BONE_MUTED = "#DCD5C5";
const GOLD = "#C9A14B";
const GOLD_MUTED = "#C9A14B66";

// Sample Data
const TOPICS = ["Saved", "All", "Faith", "Prayer", "Charity", "Knowledge", "Patience", "Family", "Manners"];
const COLLECTIONS = ["All", "Bukhari", "Muslim", "Both Sahihs"];

const FEATURED_HADITH = {
  id: "featured-1",
  arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
  translation: "Actions are but by intentions, and each man will have but that which he intended.",
  narrator: "Umar bin Al-Khattab",
  source: "Sahih al-Bukhari · Book of Revelation · Hadith 1",
  topic: "Faith",
  collection: "Bukhari",
  chain: [
    "Al-Humaidi",
    "Sufyan",
    "Yahya bin Sa'id",
    "Muhammad bin Ibrahim",
    "'Alqamah bin Waqqas",
    "Umar bin Al-Khattab",
    "The Prophet ﷺ"
  ]
};

const HADITHS = [
  {
    id: "h1",
    arabic: "لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    translation: "None of you truly believes until he loves for his brother what he loves for himself.",
    narrator: "Anas bin Malik",
    source: "Sahih al-Bukhari · Book of Faith · Hadith 13",
    topic: "Faith",
    collection: "Bukhari & Muslim",
    chain: ["Musaddad", "Yahya", "Shu'bah", "Qatadah", "Anas bin Malik", "The Prophet ﷺ"]
  },
  {
    id: "h2",
    arabic: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ",
    translation: "The strong man is not the one who can wrestle, but it is the one who can control himself when he is angry.",
    narrator: "Abu Huraira",
    source: "Sahih al-Bukhari · Book of Good Manners · Hadith 6114",
    topic: "Manners",
    collection: "Bukhari",
    chain: ["Yahya bin Bukair", "Al-Laith", "'Uqail", "Ibn Shihab", "Sa'id bin Al-Musayyab", "Abu Huraira", "The Prophet ﷺ"]
  },
  {
    id: "h3",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    translation: "Whoever believes in Allah and the Last Day, let him speak good or remain silent.",
    narrator: "Abu Huraira",
    source: "Sahih Muslim · Book of Faith · Hadith 47",
    topic: "Manners",
    collection: "Muslim",
    chain: ["Zuhair bin Harb", "Jarir", "Suhail", "His Father", "Abu Huraira", "The Prophet ﷺ"]
  },
];

const Hairline = () => (
  <div className="w-full h-px bg-[#C9A14B]/30 my-3" />
);

export function ChainOfNarration() {
  const [search, setSearch] = useState("");
  const [activeTopic, setActiveTopic] = useState("All");
  const [activeCollection, setActiveCollection] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>("h1");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(["h1"]));

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="w-[390px] h-[844px] overflow-y-auto bg-[#051A11] text-[#F4F1EA] font-sans antialiased relative scrollbar-hide" style={{ fontFamily: "Inter, sans-serif" }}>
      
      {/* HEADER */}
      <div className="px-5 pt-12 pb-4 bg-[#092E1F] border-b border-[#C9A14B]/40 sticky top-0 z-20">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F4F1EA]">Sahih Hadiths</h1>
            <p className="text-[#C9A14B] font-['Amiri'] text-lg mt-1 tracking-wide">الأحاديث الصحيحة</p>
          </div>
          <div className="border border-[#C9A14B] px-2 py-1 flex items-center bg-[#C9A14B]/10 rounded-[2px]">
            <span className="text-[#C9A14B] text-[9px] font-bold tracking-[0.1em] uppercase">Sahih Only</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#DCD5C5]/60" />
          <input 
            type="text"
            placeholder="Search hadiths…"
            className="w-full bg-[#051A11] border border-[#C9A14B]/30 rounded-[2px] py-2.5 pl-9 pr-8 text-sm text-[#F4F1EA] placeholder:text-[#DCD5C5]/50 focus:outline-none focus:border-[#C9A14B]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#DCD5C5]/60 hover:text-[#DCD5C5]">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Collection Filter */}
        <div className="flex flex-wrap gap-2">
          {COLLECTIONS.map(c => (
            <button
              key={c}
              onClick={() => setActiveCollection(c)}
              className={`px-3 py-1 text-xs font-medium rounded-[2px] border ${
                activeCollection === c 
                  ? "bg-[#C9A14B]/20 border-[#C9A14B] text-[#C9A14B]" 
                  : "bg-transparent border-[#C9A14B]/20 text-[#DCD5C5]/70 hover:border-[#C9A14B]/50"
              } transition-colors`}
            >
              {c === "All" ? "All Collections" : c === "Both Sahihs" ? "Both Sahihs" : `Sahih ${c}`}
            </button>
          ))}
        </div>
      </div>

      <div className="py-4">
        {/* Topics Rail */}
        <div className="flex overflow-x-auto px-5 gap-2 pb-4 scrollbar-hide border-b border-[#C9A14B]/20">
          {TOPICS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTopic(t)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-[2px] border transition-colors ${
                activeTopic === t
                  ? "bg-[#F4F1EA] border-[#F4F1EA] text-[#051A11]"
                  : "bg-[#092E1F] border-[#C9A14B]/30 text-[#DCD5C5] hover:border-[#C9A14B]/60"
              }`}
            >
              {t === "Saved" && <Bookmark className="w-3 h-3" fill={activeTopic === t ? "#051A11" : "none"} />}
              {t}
            </button>
          ))}
        </div>

        <div className="px-5 pt-6 pb-20 space-y-6">
          
          {/* FEATURED HERO */}
          <div className="border border-[#C9A14B] bg-[#092E1F] rounded-[2px] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="40" stroke="#C9A14B" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="50" cy="50" r="20" stroke="#C9A14B" strokeWidth="1" />
                <path d="M50 0 L50 100 M0 50 L100 50" stroke="#C9A14B" strokeWidth="1" />
              </svg>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2 text-[#C9A14B]">
                  <Star className="w-3.5 h-3.5 fill-[#C9A14B]" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Featured Hadith</span>
                </div>
                <div className="flex gap-3 text-[#DCD5C5]">
                  <button className="hover:text-[#C9A14B] transition-colors"><RefreshCw className="w-4 h-4" /></button>
                  <button className="hover:text-[#C9A14B] transition-colors"><Bookmark className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="flex gap-4">
                {/* Visual Isnad Thread */}
                <div className="flex flex-col items-center pt-2 pb-1">
                  <div className="text-[#C9A14B] text-sm mb-1 font-['Amiri'] leading-none">ﷺ</div>
                  <div className="flex-1 w-px bg-gradient-to-b from-[#C9A14B] via-[#C9A14B]/50 to-transparent min-h-[60px] my-1 relative">
                    <div className="absolute top-1/4 -left-[2px] w-1.5 h-1.5 rounded-full bg-[#051A11] border border-[#C9A14B]" />
                    <div className="absolute top-2/4 -left-[2px] w-1.5 h-1.5 rounded-full bg-[#051A11] border border-[#C9A14B]" />
                    <div className="absolute top-3/4 -left-[2px] w-1.5 h-1.5 rounded-full bg-[#051A11] border border-[#C9A14B]" />
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C9A14B] mt-1" />
                </div>

                <div className="flex-1">
                  <p className="font-['Amiri'] text-xl leading-loose text-right mb-4" dir="rtl">
                    {FEATURED_HADITH.arabic}
                  </p>
                  
                  <div className="w-8 h-px bg-[#C9A14B]/50 mb-4" />
                  
                  <p className="text-sm text-[#F4F1EA] leading-relaxed mb-4">
                    "{FEATURED_HADITH.translation}"
                  </p>
                  
                  <div className="space-y-1">
                    <p className="text-[11px] text-[#C9A14B] uppercase tracking-wide font-medium flex items-center gap-1.5">
                      <User className="w-3 h-3" /> Narrated by {FEATURED_HADITH.narrator}
                    </p>
                    <p className="text-[11px] text-[#DCD5C5]/70 flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3" /> {FEATURED_HADITH.source}
                    </p>
                  </div>
                </div>
              </div>

              <Hairline />
              
              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] uppercase tracking-wider text-[#DCD5C5]/50 border border-[#DCD5C5]/20 px-2 py-0.5 rounded-[2px]">{FEATURED_HADITH.topic}</span>
                <div className="flex gap-4">
                  <button className="flex items-center gap-1.5 text-xs text-[#DCD5C5]/70 hover:text-[#C9A14B] transition-colors uppercase tracking-wider font-medium">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-[#DCD5C5]/70 hover:text-[#C9A14B] transition-colors uppercase tracking-wider font-medium">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center my-6">
            <span className="text-[10px] uppercase tracking-widest text-[#DCD5C5]/50 px-4 bg-[#051A11] z-10 relative">Curated Collection · {HADITHS.length} Hadiths</span>
            <div className="h-px bg-[#C9A14B]/20 w-full -mt-1.5"></div>
          </div>

          {/* LIST */}
          <div className="space-y-4">
            {HADITHS.map(hadith => {
              const isExpanded = expandedId === hadith.id;
              const isSaved = savedIds.has(hadith.id);
              
              return (
                <div 
                  key={hadith.id} 
                  className={`border ${isExpanded ? 'border-[#C9A14B]' : 'border-[#C9A14B]/30'} bg-[#092E1F] rounded-[2px] transition-all`}
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : hadith.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-2 items-center">
                        <span className="text-[9px] uppercase tracking-wider text-[#DCD5C5]/70 border border-[#DCD5C5]/20 px-1.5 py-0.5 rounded-[2px]">{hadith.topic}</span>
                        <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] border ${
                          hadith.collection === 'Bukhari' ? 'text-green-400 border-green-400/30 bg-green-400/10' :
                          hadith.collection === 'Muslim' ? 'text-blue-400 border-blue-400/30 bg-blue-400/10' :
                          'text-[#C9A14B] border-[#C9A14B]/30 bg-[#C9A14B]/10'
                        }`}>
                          {hadith.collection === 'Both Sahihs' || hadith.collection === 'Bukhari & Muslim' ? 'Bukhari & Muslim' : `Sahih ${hadith.collection}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={(e) => toggleSave(hadith.id, e)} className="text-[#DCD5C5]/70 hover:text-[#C9A14B]">
                          <Bookmark className="w-4 h-4" fill={isSaved ? "#C9A14B" : "none"} color={isSaved ? "#C9A14B" : "currentColor"} />
                        </button>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-[#C9A14B]" /> : <ChevronDown className="w-4 h-4 text-[#DCD5C5]/50" />}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {/* Isnad Thread */}
                      <div className="flex flex-col items-center pt-2 opacity-70">
                        <div className="text-[#C9A14B] text-[10px] mb-0.5 font-['Amiri'] leading-none">ﷺ</div>
                        <div className="flex-1 w-px bg-gradient-to-b from-[#C9A14B]/70 to-[#C9A14B]/20 min-h-[40px] my-1 relative">
                          <div className="absolute top-1/2 -left-[2px] w-1.5 h-1.5 rounded-full bg-[#051A11] border border-[#C9A14B]/60" />
                        </div>
                        <div className="w-1 h-1 rounded-full bg-[#C9A14B]/40 mt-0.5" />
                      </div>

                      <div className="flex-1">
                        <p className="font-['Amiri'] text-[17px] leading-loose text-right mb-3" dir="rtl">
                          {hadith.arabic}
                        </p>
                        
                        <p className="text-[13px] text-[#DCD5C5] leading-relaxed mb-3 line-clamp-3">
                          "{hadith.translation}"
                        </p>
                        
                        <div className="flex items-center justify-between">
                           <p className="text-[10px] text-[#C9A14B] uppercase tracking-wider font-medium truncate">
                            Narrated by {hadith.narrator}
                          </p>
                          <p className="text-[10px] text-[#DCD5C5]/50 truncate ml-2 text-right">
                            {hadith.source.split('·')[0].trim()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-[#C9A14B]/20 bg-[#0A281B]">
                      
                      {/* Detailed Isnad */}
                      <div className="mb-4">
                        <p className="text-[9px] uppercase tracking-widest text-[#C9A14B] mb-2 font-semibold">Chain of Narration (Isnad)</p>
                        <div className="pl-1 border-l border-[#C9A14B]/30 ml-1 space-y-2">
                          {[...hadith.chain].reverse().map((narrator, i) => (
                            <div key={i} className="flex items-center gap-2 relative">
                              <div className="absolute -left-[1.3rem] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#0A281B] border border-[#C9A14B]" />
                              <span className={`text-xs ${i === 0 ? 'text-[#C9A14B] font-medium' : 'text-[#DCD5C5]/70'}`}>
                                {narrator}
                              </span>
                              {i === 0 && <span className="text-[10px] font-['Amiri'] text-[#C9A14B]">ﷺ</span>}
                            </div>
                          ))}
                        </div>
                      </div>

                      <Hairline />

                      <p className="text-[11px] text-[#DCD5C5]/70 mb-4 leading-relaxed">
                        <span className="text-[#F4F1EA] font-medium">Source:</span> {hadith.source}
                      </p>

                      <div className="flex gap-4">
                        <button className="flex items-center gap-1.5 text-xs text-[#DCD5C5]/70 hover:text-[#C9A14B] transition-colors uppercase tracking-wider font-medium" onClick={(e) => { e.stopPropagation(); }}>
                          <Copy className="w-3.5 h-3.5" /> Copy Text
                        </button>
                        <button className="flex items-center gap-1.5 text-xs text-[#DCD5C5]/70 hover:text-[#C9A14B] transition-colors uppercase tracking-wider font-medium" onClick={(e) => { e.stopPropagation(); }}>
                          <Share2 className="w-3.5 h-3.5" /> Share Hadith
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChainOfNarration;
