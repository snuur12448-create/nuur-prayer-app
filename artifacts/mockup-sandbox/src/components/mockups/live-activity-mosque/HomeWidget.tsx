import React from 'react';
import { COLORS, FONTS, DATA, PhoneFrame, Starfield } from './_shared';

export function HomeWidget() {
  return (
    <PhoneFrame type="home" height={320}>
      <div style={{
        width: 328,
        height: 155,
        backgroundColor: COLORS.bg,
        borderRadius: 22,
        padding: '16px 20px',
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${COLORS.border}`,
        boxShadow: `0 10px 20px rgba(0,0,0,0.3)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: FONTS.sans
      }}>
        <Starfield />
        
        {/* Qibla Medallion Corner Patterns */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: 64, height: 64, opacity: 0.15 }} viewBox="0 0 64 64">
          <path d="M0 0 L64 0 L64 4 L4 4 L4 64 L0 64 Z" fill={COLORS.gold} />
          <path d="M0 0 L32 32 L16 32 L0 16 Z" fill={COLORS.gold} />
        </svg>
        <svg style={{ position: 'absolute', top: 0, right: 0, width: 64, height: 64, opacity: 0.15 }} viewBox="0 0 64 64">
          <path d="M64 0 L0 0 L0 4 L60 4 L60 64 L64 64 Z" fill={COLORS.gold} />
          <path d="M64 0 L32 32 L48 32 L64 16 Z" fill={COLORS.gold} />
        </svg>
        <svg style={{ position: 'absolute', bottom: 0, left: 0, width: 64, height: 64, opacity: 0.15 }} viewBox="0 0 64 64">
          <path d="M0 64 L64 64 L64 60 L4 60 L4 0 L0 0 Z" fill={COLORS.gold} />
          <path d="M0 64 L32 32 L16 32 L0 48 Z" fill={COLORS.gold} />
        </svg>
        <svg style={{ position: 'absolute', bottom: 0, right: 0, width: 64, height: 64, opacity: 0.15 }} viewBox="0 0 64 64">
          <path d="M64 64 L0 64 L0 60 L60 60 L60 0 L64 0 Z" fill={COLORS.gold} />
          <path d="M64 64 L32 32 L48 32 L64 48 Z" fill={COLORS.gold} />
        </svg>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ color: COLORS.gold, fontSize: 42, fontWeight: 500, fontFamily: FONTS.countdown, fontFeatureSettings: '"tnum"', lineHeight: 1 }}>
            3h 22m
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ color: COLORS.text, fontSize: 18, fontWeight: 600 }}>{DATA.prayerEn}</span>
            <span style={{ color: COLORS.text, fontSize: 20, fontFamily: FONTS.arabic }}>{DATA.prayerAr}</span>
          </div>
          <div style={{ color: COLORS.textDim, fontSize: 13, fontWeight: 500, marginTop: 4 }}>
            {DATA.time}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
