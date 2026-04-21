import "./_group.css";
import { Heart, Settings, ChevronRight } from "lucide-react";

const items = [
  { label: "Duas & Adhkar", arabic: "الأدعية والأذكار", desc: "Daily supplications, morning & evening adhkar, and rotating authentic hadith", color: "#E8A87C", icon: "♡" },
  { label: "99 Names of Allah", arabic: "أسماء الله الحسنى", desc: "The beautiful names of Allah with meanings, transliterations, and reflections", color: "#B39DDB", icon: "✦" },
  { label: "Tasbeeh & Dhikr Guide", arabic: "التسبيح وأذكار الصلاة", desc: "Dhikr counter with preset phrases, plus step-by-step post-prayer adhkār guide", color: "#80CBC4", icon: "🤲" },
  { label: "Sahih Hadiths", arabic: "الأحاديث الصحيحة", desc: "Browse authentic hadiths from Bukhari & Muslim with live Sunnah.com content", color: "#A5D6A7", icon: "📖" },
  { label: "Mosque Finder", arabic: "المساجد القريبة", desc: "Find the nearest mosques to you, sorted by distance with addresses", color: "#4DB6AC", icon: "🕌" },
  { label: "Islamic Calendar", arabic: "التقويم الإسلامي", desc: "Hijri & Gregorian dates, Islamic events, Eid, Ramadan, Laylatul Qadr nights", color: "#C9933A", icon: "📅" },
  { label: "Settings", arabic: "الإعدادات", desc: "Calculation method, adhan style, theme, time format, and app preferences", color: "#90A4AE", icon: "⚙" },
];

export function Current() {
  return (
    <div className="nuur-bg nuur-sans min-h-screen w-full">
      <div className="mx-auto" style={{ maxWidth: 390 }}>
        {/* Status bar spacer */}
        <div style={{ height: 44 }} />

        <div className="px-5 pt-3">
          {/* Logo block */}
          <div className="flex items-center gap-4 pb-4 mb-5" style={{ borderBottom: "1px solid rgba(201,147,58,0.19)" }}>
            <div className="flex items-center justify-center" style={{ width: 52, height: 52 }}>
              <div className="relative" style={{ width: 44, height: 44 }}>
                <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(201,147,58,0.35), transparent 65%)" }} />
                <div className="absolute inset-2 rounded-full" style={{ background: "#c9933a", boxShadow: "0 0 16px rgba(201,147,58,0.7)" }} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-baseline">
                <span className="nuur-arabic nuur-gold" style={{ fontSize: 22, letterSpacing: 1 }}>نُور</span>
                <span className="nuur-serif nuur-gold" style={{ fontSize: 13, letterSpacing: 5, marginLeft: 8 }}>NUUR</span>
              </div>
              <div className="nuur-serif italic" style={{ fontSize: 11, color: "#8BAF8E", letterSpacing: 1, marginTop: 2 }}>
                Light for your daily deen
              </div>
            </div>
          </div>

          {/* Section label */}
          <div className="font-bold mb-3.5" style={{ fontSize: 11, letterSpacing: 2, color: "#8a8a96" }}>
            MORE FEATURES
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.label} className="nuur-surface flex items-center overflow-hidden" style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", paddingTop: 18, paddingBottom: 18, paddingRight: 14 }}>
                <div style={{ width: 3, alignSelf: "stretch", marginRight: 14, background: it.color }} />
                <div className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 14, marginRight: 14, background: it.color + "22", color: it.color, fontSize: 24 }}>
                  {it.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span style={{ fontSize: 16, fontWeight: 600, color: "#e9e3d3" }}>{it.label}</span>
                    <span className="nuur-arabic" style={{ fontSize: 14, color: it.color }}>{it.arabic}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#8a8a96", lineHeight: "18px", marginTop: 4 }}>
                    {it.desc}
                  </div>
                </div>
                <ChevronRight size={18} style={{ color: "#8a8a96", marginLeft: 6, flexShrink: 0 }} />
              </div>
            ))}
          </div>
          <div style={{ height: 100 }} />
        </div>
      </div>
    </div>
  );
}
