import React from 'react';
import { COLORS, FONTS, DATA, PhoneFrame, Starfield, CrescentGraphic, NuurHalo } from './_shared';

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
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 100% 100%, rgba(255,210,74,0.15) 0%, transparent 70%)' }} />
        <Starfield />
        <NuurHalo opacity={0.20} color={COLORS.alert} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CrescentGraphic color={COLORS.alert} size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ color: COLORS.textMute, fontSize: 13, fontWeight: 500 }}>{DATA.location}</span>
            <span style={{ color: COLORS.textMute, fontSize: 12 }}>{DATA.hijri}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ color: COLORS.alert, fontSize: 48, fontWeight: 500, fontFamily: FONTS.countdown, fontFeatureSettings: '"tnum"', lineHeight: 1 }}>
              30s
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: COLORS.text, fontSize: 24, fontWeight: 600 }}>{DATA.prayerEn}</span>
              <span style={{ width: 1, height: 20, backgroundColor: COLORS.alert, opacity: 0.5 }}></span>
              <span style={{ color: COLORS.text, fontSize: 24, fontWeight: 600, fontFamily: FONTS.arabic, paddingTop: 4 }}>{DATA.prayerAr}</span>
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
