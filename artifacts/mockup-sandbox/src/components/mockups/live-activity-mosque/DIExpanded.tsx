import React from 'react';
import { COLORS, FONTS, DATA, PhoneFrame, Starfield, CrescentGraphic, RubElHizb } from './_shared';

export function DIExpanded() {
  return (
    <PhoneFrame type="notch" height={320}>
      <div style={{
        width: 390,
        height: 160,
        backgroundColor: COLORS.bg,
        borderRadius: 40,
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${COLORS.border}`,
        boxShadow: `inset 0 0 0 1px rgba(245,197,66,0.1), 0 16px 32px rgba(0,0,0,0.5)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        fontFamily: FONTS.sans
      }}>
        <Starfield />
        <RubElHizb opacity={0.12} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <CrescentGraphic color={COLORS.gold} size={24} opacity={0.8} />
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ color: COLORS.gold, fontSize: 40, fontWeight: 500, fontFamily: FONTS.countdown, fontFeatureSettings: '"tnum"', lineHeight: 1 }}>
              3h 22m
            </div>
            <div style={{ color: COLORS.textDim, fontSize: 14, fontWeight: 500 }}>
              to {DATA.prayerEn}
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ color: COLORS.text, fontSize: 20, fontWeight: 600 }}>{DATA.prayerEn}</span>
            <span style={{ color: COLORS.text, fontSize: 22, fontWeight: 600, fontFamily: FONTS.arabic }}>{DATA.prayerAr}</span>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
