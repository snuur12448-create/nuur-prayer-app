import { NotchChrome, LiveActivityCard } from './_shared';

export function DI_Expanded() {
  return (
    <NotchChrome height={260}>
      {/* hardware notch */}
      <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 124, height: 36, backgroundColor: '#000', borderRadius: 18, zIndex: 20 }} />

      <div style={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
        <LiveActivityCard state="normal" skin="day" />
      </div>
    </NotchChrome>
  );
}
