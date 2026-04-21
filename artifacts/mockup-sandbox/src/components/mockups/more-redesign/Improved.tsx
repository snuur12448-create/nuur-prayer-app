import "./_group.css";
import {
  ChevronRight, Flame, BookmarkCheck, Sun, Moon,
  Heart, Sparkles, HandHelping, BookOpen, MapPin, CalendarDays, Settings,
  Star, Share2, MessageSquare, Info,
} from "lucide-react";

type Item = {
  label: string;
  arabic: string;
  desc: string;
  color: string;
  Icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
};

const worship: Item[] = [
  { label: "Duas & Adhkar", arabic: "الأدعية والأذكار", desc: "Daily supplications, morning & evening adhkar", color: "#E8A87C", Icon: Heart },
  { label: "Tasbeeh & Dhikr", arabic: "التسبيح", desc: "Counter with preset phrases and post-prayer guide", color: "#80CBC4", Icon: HandHelping },
  { label: "99 Names of Allah", arabic: "أسماء الله الحسنى", desc: "Meanings, transliterations and reflections", color: "#B39DDB", Icon: Sparkles },
];
const knowledge: Item[] = [
  { label: "Sahih Hadiths", arabic: "الأحاديث الصحيحة", desc: "Bukhari & Muslim with live Sunnah.com content", color: "#A5D6A7", Icon: BookOpen },
  { label: "Islamic Calendar", arabic: "التقويم الإسلامي", desc: "Hijri dates, Eid, Ramadan, Laylatul Qadr", color: "#C9933A", Icon: CalendarDays },
];
const discover: Item[] = [
  { label: "Mosque Finder", arabic: "المساجد القريبة", desc: "Nearest mosques with directions, hours & contact", color: "#4DB6AC", Icon: MapPin },
];
const app: Item[] = [
  { label: "Settings", arabic: "الإعدادات", desc: "Calculation, adhan, theme, time format", color: "#90A4AE", Icon: Settings },
];

function Card({ it }: { it: Item }) {
  const Icon = it.Icon;
  return (
    <div className="nuur-surface flex items-center overflow-hidden" style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", paddingTop: 14, paddingBottom: 14, paddingRight: 12 }}>
      <div style={{ width: 3, alignSelf: "stretch", marginRight: 12, background: it.color }} />
      <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 12, marginRight: 12, background: it.color + "22" }}>
        <Icon size={20} style={{ color: it.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span style={{ fontSize: 15, fontWeight: 600, color: "#e9e3d3" }}>{it.label}</span>
          <span className="nuur-arabic" style={{ fontSize: 13, color: it.color }}>{it.arabic}</span>
        </div>
        <div style={{ fontSize: 11.5, color: "#8a8a96", lineHeight: "17px", marginTop: 3 }} className="line-clamp-1">
          {it.desc}
        </div>
      </div>
      <ChevronRight size={16} style={{ color: "#8a8a96", marginLeft: 4, flexShrink: 0 }} />
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mt-5 mb-2.5">
      <span className="font-bold" style={{ fontSize: 10.5, letterSpacing: 2, color: "#8a8a96" }}>{label}</span>
      <div className="flex-1" style={{ height: 1, background: "linear-gradient(90deg, rgba(255,255,255,0.08), transparent)" }} />
    </div>
  );
}

function FooterRow({ Icon, label, sub }: { Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <Icon size={16} style={{ color: "#8a8a96" }} />
      <span style={{ fontSize: 14, color: "#e9e3d3", flex: 1 }}>{label}</span>
      {sub && <span style={{ fontSize: 11, color: "#6a6a76" }}>{sub}</span>}
      <ChevronRight size={14} style={{ color: "#6a6a76" }} />
    </div>
  );
}

export function Improved() {
  return (
    <div className="nuur-bg nuur-sans min-h-screen w-full">
      <div className="mx-auto" style={{ maxWidth: 390 }}>
        <div style={{ height: 44 }} />

        <div className="px-5 pt-3">
          {/* Logo block with quick theme toggle */}
          <div className="flex items-center gap-4 pb-4 mb-4" style={{ borderBottom: "1px solid rgba(201,147,58,0.19)" }}>
            <div className="flex items-center justify-center" style={{ width: 48, height: 48 }}>
              <div className="relative" style={{ width: 40, height: 40 }}>
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
            {/* Quick theme toggle */}
            <button
              className="flex items-center justify-center"
              style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(201,147,58,0.10)", border: "1px solid rgba(201,147,58,0.25)" }}
              aria-label="Toggle theme"
            >
              <Moon size={16} style={{ color: "#c9933a" }} />
            </button>
          </div>

          {/* (1) TODAY snapshot */}
          <div className="nuur-surface-elev overflow-hidden" style={{ borderRadius: 16, border: "1px solid rgba(201,147,58,0.20)", padding: 14 }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 11, letterSpacing: 2, fontWeight: 700, color: "#c9933a" }}>TODAY · 12 RAJAB</span>
              <span style={{ fontSize: 11, color: "#8a8a96" }}>Tue · 21 Apr</span>
            </div>
            <div className="flex items-stretch gap-2">
              <div className="flex-1 nuur-surface" style={{ borderRadius: 12, padding: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Flame size={13} style={{ color: "#E8A87C" }} />
                  <span style={{ fontSize: 10, color: "#8a8a96", letterSpacing: 1 }}>STREAK</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#e9e3d3", lineHeight: 1 }}>5<span style={{ fontSize: 11, color: "#8a8a96", fontWeight: 400 }}> days</span></div>
              </div>
              <div className="flex-1 nuur-surface" style={{ borderRadius: 12, padding: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 10, color: "#8a8a96", letterSpacing: 1, marginBottom: 4 }}>PRAYED</div>
                <div className="flex items-baseline gap-1">
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#c9933a", lineHeight: 1 }}>4</div>
                  <div style={{ fontSize: 12, color: "#8a8a96" }}>/ 5</div>
                </div>
                <div className="flex gap-1 mt-2">
                  {[1,1,1,1,0].map((p,i) => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: p ? "#c9933a" : "rgba(255,255,255,0.10)" }} />
                  ))}
                </div>
              </div>
              <div className="flex-1 nuur-surface" style={{ borderRadius: 12, padding: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 10, color: "#8a8a96", letterSpacing: 1, marginBottom: 4 }}>NEXT</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e9e3d3" }}>Isha</div>
                <div style={{ fontSize: 11, color: "#8BAF8E", marginTop: 2 }}>in 1h 12m</div>
              </div>
            </div>
          </div>

          {/* (3) My Library — pinned saved entry */}
          <div className="nuur-surface mt-3 flex items-center overflow-hidden" style={{ borderRadius: 14, border: "1px solid rgba(201,147,58,0.30)", paddingTop: 14, paddingBottom: 14, paddingRight: 12 }}>
            <div style={{ width: 3, alignSelf: "stretch", marginRight: 12, background: "#c9933a" }} />
            <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 12, marginRight: 12, background: "rgba(201,147,58,0.18)" }}>
              <BookmarkCheck size={20} style={{ color: "#c9933a" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span style={{ fontSize: 15, fontWeight: 600, color: "#e9e3d3" }}>My Library</span>
                <span className="nuur-arabic" style={{ fontSize: 13, color: "#c9933a" }}>مكتبتي</span>
              </div>
              <div style={{ fontSize: 11.5, color: "#8a8a96", marginTop: 3 }}>
                12 saved · 4 hadiths, 3 duas, 2 names, 2 mosques, 1 ayah
              </div>
            </div>
            <ChevronRight size={16} style={{ color: "#8a8a96", marginLeft: 4 }} />
          </div>

          {/* (2) Sectioned menu */}
          <SectionHeader label="WORSHIP · العبادة" />
          <div className="space-y-2.5">{worship.map((it) => <Card key={it.label} it={it} />)}</div>

          <SectionHeader label="KNOWLEDGE · المعرفة" />
          <div className="space-y-2.5">{knowledge.map((it) => <Card key={it.label} it={it} />)}</div>

          <SectionHeader label="DISCOVER · اكتشف" />
          <div className="space-y-2.5">{discover.map((it) => <Card key={it.label} it={it} />)}</div>

          <SectionHeader label="APP · التطبيق" />
          <div className="space-y-2.5">{app.map((it) => <Card key={it.label} it={it} />)}</div>

          {/* (4) App footer block */}
          <div className="mt-6 nuur-surface" style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: "4px 14px" }}>
            <FooterRow Icon={Star} label="Rate Nuur" sub="App Store" />
            <FooterRow Icon={Share2} label="Share Nuur with a friend" />
            <FooterRow Icon={MessageSquare} label="Send feedback" />
            <FooterRow Icon={Info} label="About" sub="v1.0.0" />
          </div>

          <div className="text-center mt-4 mb-4">
            <div className="nuur-arabic" style={{ fontSize: 14, color: "#c9933a", opacity: 0.7 }}>﷽</div>
            <div style={{ fontSize: 10, color: "#6a6a76", marginTop: 4, letterSpacing: 1 }}>
              Made with care · Hadith data © sunnah.com
            </div>
          </div>

          <div style={{ height: 100 }} />
        </div>
      </div>
    </div>
  );
}
