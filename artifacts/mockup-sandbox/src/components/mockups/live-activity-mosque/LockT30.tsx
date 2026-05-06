import React from 'react';
import { COLORS, FONTS, DATA, PhoneFrame, Starfield, MosqueOrnament, CrescentGraphic } from './_shared';

export function LockT30() {
  return (
    <PhoneFrame type="lock">
      <div style={{
        width: 390,
        height: 170,
        backgroundColor: COLORS.bg,
        borderRadius: 32,
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${COLORS.border}`,
        boxShadow: `inset 0 0 0 1px rgba(255,210,74,0.2), 0 16px 32px rgba(0,0,0,0.5)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: FONTS.sans
      }}>
        <Starfield />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CrescentGraphic color={COLORS.alert} size={20} />
            <MosqueOrnament color={COLORS.alert} size={10} opacity={0.8} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ color: COLORS.textMute, fontSize: 13, fontWeight: 500 }}>{DATA.location}</span>
            <span style={{ color: COLORS.textMute, fontSize: 12 }}>{DATA.hijri}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ color: COLORS.alert, fontSize: 44, fontWeight: 500, fontFamily: FONTS.countdown, fontFeatureSettings: '"tnum"', lineHeight: 1 }}>
              0m 30s
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ color: COLORS.text, fontSize: 22, fontWeight: 600 }}>{DATA.prayerEn}</span>
              <span style={{ color: COLORS.text, fontSize: 24, fontFamily: FONTS.arabic }}>{DATA.prayerAr}</span>
            </div>
          </div>
          
          <div style={{ color: COLORS.textDim, fontSize: 18, fontWeight: 500 }}>
            {DATA.time}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
