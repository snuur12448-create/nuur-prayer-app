import React from 'react';
import { COLORS, PhoneFrame } from './_shared';

export function DIMinimal() {
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
        <div style={{
          height: 36,
          width: 36,
          backgroundColor: '#000',
          borderRadius: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.gold }} />
        </div>
        <div style={{ width: 36, height: 36 }} />
      </div>
    </PhoneFrame>
  );
}
