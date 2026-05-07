import React from 'react';
import { COLORS, FONTS, DATA, PhoneFrame, Starfield, RubElHizb } from './_shared';

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
        
        <RubElHizb opacity={0.12} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ color: COLORS.gold, fontSize: 42, fontWeight: 500, fontFamily: FONTS.countdown, fontFeatureSettings: '"tnum"', lineHeight: 1 }}>
            3h 22m
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: COLORS.text, fontSize: 20, fontWeight: 600 }}>{DATA.prayerEn}</span>
            <span style={{ width: 1, height: 16, backgroundColor: COLORS.gold, opacity: 0.5 }}></span>
            <span style={{ color: COLORS.text, fontSize: 20, fontWeight: 600, fontFamily: FONTS.arabic, paddingTop: 4 }}>{DATA.prayerAr}</span>
          </div>
          <div style={{ color: COLORS.textDim, fontSize: 13, fontWeight: 500, marginTop: 4 }}>
            {DATA.time}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
