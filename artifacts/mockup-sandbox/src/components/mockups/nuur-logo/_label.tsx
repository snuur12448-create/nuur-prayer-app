import { GOLD, TEXT_DIM } from "./_shared";

export function ConceptLabel({ index, name }: { index: string; name: string }) {
  return (
    <div
      className="absolute top-12 left-0 right-0 flex flex-col items-center"
      style={{ pointerEvents: "none", zIndex: 50 }}
    >
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: 10,
          letterSpacing: 4,
          color: GOLD,
          opacity: 0.85,
        }}
      >
        CONCEPT {index}
      </div>
      <div
        style={{
          fontFamily: "'Amiri', serif",
          fontSize: 16,
          color: TEXT_DIM,
          marginTop: 4,
          opacity: 0.75,
        }}
      >
        {name}
      </div>
    </div>
  );
}

export function Wordmark({
  arSize = 44,
  enSize = 16,
  enLetter = 8,
  tagline,
  glow = true,
}: {
  arSize?: number;
  enSize?: number;
  enLetter?: number;
  tagline?: string;
  glow?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        style={{
          fontFamily: "'Amiri', serif",
          fontSize: arSize,
          color: "#E8B85C",
          lineHeight: 1,
          letterSpacing: 1,
          textShadow: glow ? "0 0 20px #E8B85C99, 0 0 50px #C9933A55" : "none",
        }}
      >
        نُور
      </div>
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 300,
          fontSize: enSize,
          letterSpacing: enLetter,
          color: "#E8B85C",
          marginTop: 14,
        }}
      >
        NUUR
      </div>
      {tagline && (
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: 11,
            letterSpacing: 3,
            color: "rgba(240,237,228,0.55)",
            marginTop: 14,
            textTransform: "uppercase",
          }}
        >
          {tagline}
        </div>
      )}
    </div>
  );
}
