import React from 'react';
import { COLORS, FONTS, PhoneFrame, MosqueOrnament } from './_shared';

export function DICompact() {
  return (
    <PhoneFrame type="notch" height={200}>
      <div style={{
        position: 'absolute',
        top: 12,
        left: 0,
        width: 460,
        display: 'flex',
        justifyContent: 'center',
        gap: 128,
        pointerEvents: 'none'
      }}>
        {/* Leading Pill */}
        <div style={{
          height: 36,
          padding: '0 12px',
          backgroundColor: '#000',
          borderRadius: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <MosqueOrnament color={COLORS.gold} size={16} opacity={0.9} />
        </div>
        
        {/* Trailing Pill */}
        <div style={{
          height: 36,
          padding: '0 12px',
          backgroundColor: '#000',
          borderRadius: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <span style={{ color: COLORS.gold, fontSize: 14, fontWeight: 500, fontFamily: FONTS.countdown, fontFeatureSettings: '"tnum"' }}>23m</span>
          <span style={{ color: COLORS.gold, fontSize: 14, opacity: 0.5 }}>·</span>
          <span style={{ color: COLORS.text, fontSize: 16, fontFamily: FONTS.arabic, lineHeight: 1, paddingBottom: 2 }}>م</span>
        </div>
      </div>
    </PhoneFrame>
  );
}
