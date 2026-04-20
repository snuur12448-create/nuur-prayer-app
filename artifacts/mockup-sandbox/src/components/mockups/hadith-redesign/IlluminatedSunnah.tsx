import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Copy, Share2, Bookmark, RefreshCw, Star } from 'lucide-react';

const TOPICS = [
  "Saved", "All", "Faith", "Prayer", "Charity", "Knowledge", "Patience", "Family", "Manners", "Repentance"
];

const HADITHS = [
  {
    id: "h1",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    translation: "Actions are but by intentions, and every man shall have but that which he intended.",
    narrator: "Narrated by 'Umar bin Al-Khattab",
    source: "Sahih al-Bukhari · Book of Revelation · Hadith 1",
    topic: "Faith",
    collection: "Bukhari",
    bookmarked: true
  },
  {
    id: "h2",
    arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    translation: "None of you truly believes until he loves for his brother what he loves for himself.",
    narrator: "Narrated by Anas",
    source: "Sahih al-Bukhari · Book of Belief · Hadith 13",
    topic: "Manners",
    collection: "Bukhari & Muslim",
    bookmarked: false
  },
  {
    id: "h3",
    arabic: "لَيْسَ الشَّدِيدُ بِالصُّرْعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ",
    translation: "The strong man is not the one who can wrestle, but it is the one who can control himself when he is angry.",
    narrator: "Narrated by Abu Huraira",
    source: "Sahih al-Bukhari · Book of Good Manners · Hadith 137",
    topic: "Patience",
    collection: "Bukhari & Muslim",
    bookmarked: false
  },
  {
    id: "h4",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    translation: "Whoever believes in Allah and the Last Day, let him speak good or remain silent.",
    narrator: "Narrated by Abu Huraira",
    source: "Sahih Muslim · The Book of Faith · Hadith 74",
    topic: "Faith",
    collection: "Muslim",
    bookmarked: false
  }
];

const FeaturedHadith = {
  id: "hf",
  arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
  translation: "The best among you (Muslims) are those who learn the Qur'an and teach it.",
  narrator: "Narrated by 'Uthman bin 'Affan",
  source: "Sahih al-Bukhari · Book of Virtues of the Qur'an · Hadith 5027",
  topic: "Knowledge",
  collection: "Bukhari"
};

const BismillahSVG = () => (
  <svg viewBox="0 0 200 40" className="w-48 h-10 fill-[#C9A14B] opacity-80" xmlns="http://www.w3.org/2000/svg">
    {/* A stylized bismillah vector representation for mockup purposes */}
    <path d="M100 20 C110 10, 130 15, 140 20 C150 25, 160 15, 170 20 C180 25, 190 15, 195 20 C180 30, 160 30, 140 25 C120 20, 100 30, 80 25 C60 20, 40 30, 20 25 C30 15, 50 15, 60 20 C70 25, 80 15, 100 20 Z" />
    <circle cx="100" cy="10" r="2" />
    <circle cx="140" cy="12" r="2" />
    <circle cx="60" cy="12" r="2" />
  </svg>
);

const MushafBorder = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative p-6 ${className}`}>
    <div className="absolute inset-0 border-2 border-[#C9A14B]/30 m-2 pointer-events-none" />
    <div className="absolute inset-0 border border-[#C9A14B]/20 m-3 pointer-events-none" />
    
    {/* Corner Florets */}
    <div className="absolute top-0 left-0 w-6 h-6 border-r-2 border-b-2 border-[#C9A14B] rounded-br-lg pointer-events-none" />
    <div className="absolute top-0 right-0 w-6 h-6 border-l-2 border-b-2 border-[#C9A14B] rounded-bl-lg pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-6 h-6 border-r-2 border-t-2 border-[#C9A14B] rounded-tr-lg pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-6 h-6 border-l-2 border-t-2 border-[#C9A14B] rounded-tl-lg pointer-events-none" />

    {/* Center diamond motifs on borders */}
    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#0B1021] border border-[#C9A14B]" />
    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#0B1021] border border-[#C9A14B]" />
    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-[#0B1021] border border-[#C9A14B]" />
    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-[#0B1021] border border-[#C9A14B]" />

    <div className="relative z-10">{children}</div>
  </div>
);

const KhatamMedallion = () => (
  <svg viewBox="0 0 100 100" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 0 L60 35 L95 25 L75 55 L100 80 L65 75 L50 100 L35 75 L0 80 L25 55 L5 25 L40 35 Z" fill="#C9A14B" />
    <path d="M50 15 L55 40 L80 30 L65 50 L85 70 L60 65 L50 85 L40 65 L15 70 L35 50 L20 30 L45 40 Z" fill="none" stroke="#C9A14B" strokeWidth="1" />
  </svg>
);

export function IlluminatedSunnah() {
  const [search, setSearch] = useState("");
  const [activeTopic, setActiveTopic] = useState("All");
  const [activeCollection, setActiveCollection] = useState("all");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-[390px] h-[844px] overflow-y-auto bg-[#080B16] text-[#FDFBF7] font-serif shadow-2xl flex flex-col items-center">
      {/* Noise Texture */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      <div className="w-full px-4 pt-12 pb-6 border-b border-[#C9A14B]/20 bg-gradient-to-b from-[#C9A14B]/5 to-transparent relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-wide text-[#FDFBF7]">Sahih Hadiths</h1>
            <p className="text-sm font-['Amiri'] text-[#C9A14B] mt-1">الأحاديث الصحيحة</p>
          </div>
          <div className="px-2 py-1 border border-[#C9A14B]/40 bg-[#C9A14B]/10 rounded shadow-[0_0_10px_rgba(201,161,75,0.1)]">
            <span className="text-[10px] font-bold tracking-widest text-[#C9A14B]">SAHIH ONLY</span>
          </div>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-[#C9A14B]/60" />
          </div>
          <input
            type="text"
            placeholder="Search hadiths…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111729] border border-[#C9A14B]/30 rounded-sm py-3 pl-11 pr-4 text-sm text-[#FDFBF7] placeholder-[#FDFBF7]/40 focus:outline-none focus:border-[#C9A14B] transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {["All", "Sahih Bukhari", "Sahih Muslim", "Both Sahihs"].map(c => {
            const mapped = c === "All" ? "all" : c === "Both Sahihs" ? "Both" : c.split(' ')[1];
            const isActive = activeCollection === mapped;
            return (
              <button
                key={c}
                onClick={() => setActiveCollection(mapped)}
                className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                  isActive 
                    ? 'bg-[#C9A14B]/20 border-[#C9A14B] text-[#C9A14B]' 
                    : 'bg-transparent border-[#C9A14B]/20 text-[#FDFBF7]/60 hover:border-[#C9A14B]/40'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic Rail */}
      <div className="w-full border-b border-[#C9A14B]/10 relative z-10 bg-[#0B1021]">
        <div className="flex overflow-x-auto px-4 py-4 gap-3 no-scrollbar items-center">
          {TOPICS.map(t => {
            const isActive = activeTopic === t;
            const isSaved = t === "Saved";
            return (
              <button
                key={t}
                onClick={() => setActiveTopic(t)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 border transition-all ${
                  isActive
                    ? 'bg-[#C9A14B] border-[#C9A14B] text-[#080B16] shadow-[0_0_15px_rgba(201,161,75,0.3)]'
                    : 'bg-[#111729] border-[#C9A14B]/30 text-[#C9A14B] hover:border-[#C9A14B]/60'
                }`}
                style={{ borderRadius: '50% 50% 50% 50% / 15% 15% 15% 15%' }}
              >
                {isSaved && <Bookmark className={`w-3.5 h-3.5 ${isActive ? 'text-[#080B16]' : 'text-[#C9A14B]'}`} fill={isActive ? 'currentColor' : 'none'} />}
                <span className="text-xs uppercase tracking-widest font-bold">{t}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full px-4 py-8 space-y-8 relative z-10">
        {/* Featured Hero */}
        <MushafBorder className="bg-[#0B1021]">
          <KhatamMedallion />
          <div className="flex flex-col items-center text-center space-y-6 relative">
            <div className="w-full flex justify-between items-center px-2">
              <div className="flex items-center gap-2 px-2 py-1 border border-[#C9A14B]/30 bg-[#C9A14B]/5 rounded">
                <Star className="w-3 h-3 text-[#C9A14B]" fill="currentColor" />
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#C9A14B]">FEATURED HADITH</span>
              </div>
              <div className="flex gap-4">
                <button className="text-[#C9A14B]/60 hover:text-[#C9A14B]"><Bookmark className="w-4 h-4" /></button>
                <button className="text-[#C9A14B]/60 hover:text-[#C9A14B]"><RefreshCw className="w-4 h-4" /></button>
              </div>
            </div>

            <BismillahSVG />

            <div className="px-4">
              <p className="font-['Amiri_Quran'] text-3xl leading-[2.2] text-[#FDFBF7] text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" dir="rtl">
                {FeaturedHadith.arabic}
              </p>
            </div>

            <div className="px-6 relative">
              <span className="text-4xl font-serif text-[#C9A14B]/20 absolute -top-4 -left-2">"</span>
              <p className="text-sm italic leading-relaxed text-[#FDFBF7]/80">
                {FeaturedHadith.translation}
              </p>
              <span className="text-4xl font-serif text-[#C9A14B]/20 absolute -bottom-8 -right-2">"</span>
            </div>

            <div className="pt-4 border-t border-[#C9A14B]/20 w-3/4">
              <p className="text-xs text-[#C9A14B]/60 mb-1">{FeaturedHadith.narrator}</p>
              <p className="text-xs font-medium text-[#C9A14B]">{FeaturedHadith.source}</p>
            </div>

            <div className="flex w-full border-t border-[#C9A14B]/20 pt-4 px-2">
              <button className="flex-1 flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-[#C9A14B]/80 hover:text-[#C9A14B]">
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
              <div className="w-px bg-[#C9A14B]/20" />
              <button className="flex-1 flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-[#C9A14B]/80 hover:text-[#C9A14B]">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>
        </MushafBorder>

        <div className="flex items-center gap-4 py-4">
          <div className="h-px bg-gradient-to-r from-transparent to-[#C9A14B]/40 flex-1" />
          <span className="text-[10px] tracking-[0.2em] font-bold text-[#C9A14B]/60">CURATED COLLECTION</span>
          <div className="h-px bg-gradient-to-l from-transparent to-[#C9A14B]/40 flex-1" />
        </div>

        {/* List Cards */}
        <div className="space-y-6 pb-20">
          {HADITHS.map(h => {
            const isExpanded = expandedCards[h.id];
            return (
              <MushafBorder key={h.id} className="bg-[#0B1021] py-5 px-5">
                <div className="flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-[#C9A14B] border border-[#C9A14B]/40 px-2 py-0.5 rounded-sm bg-[#C9A14B]/5">
                        {h.topic}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-[#FDFBF7]/60 border border-[#FDFBF7]/20 px-2 py-0.5 rounded-sm">
                        {h.collection === "Both" ? "Bukhari & Muslim" : `Sahih ${h.collection}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="text-[#C9A14B]/60 hover:text-[#C9A14B]">
                        <Bookmark className="w-4 h-4" fill={h.bookmarked ? "currentColor" : "none"} />
                      </button>
                      <button onClick={() => toggleExpand(h.id)} className="text-[#C9A14B]/60 hover:text-[#C9A14B]">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="font-['Amiri_Quran'] text-2xl leading-loose text-[#FDFBF7] text-center mb-5" dir="rtl">
                    {h.arabic}
                  </p>

                  <p className={`text-sm italic leading-relaxed text-[#FDFBF7]/80 text-center px-4 ${!isExpanded ? 'line-clamp-3' : ''}`}>
                    "{h.translation}"
                  </p>

                  <div className="mt-5 pt-4 border-t border-[#C9A14B]/10 text-center">
                    <p className="text-xs text-[#C9A14B]/60 mb-0.5">{h.narrator}</p>
                    <p className="text-[11px] font-medium tracking-wide text-[#C9A14B]">{h.source}</p>
                  </div>

                  {isExpanded && (
                    <div className="flex border-t border-[#C9A14B]/10 mt-4 pt-4 px-2">
                      <button className="flex-1 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-[#C9A14B]/60 hover:text-[#C9A14B]">
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                      <div className="w-px bg-[#C9A14B]/10 mx-2" />
                      <button className="flex-1 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-[#C9A14B]/60 hover:text-[#C9A14B]">
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </button>
                    </div>
                  )}
                </div>
              </MushafBorder>
            )
          })}
        </div>
      </div>
    </div>
  );
}
