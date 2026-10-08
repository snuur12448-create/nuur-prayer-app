import TrackPlayer, { Event } from "react-native-track-player";
import { isAudioMaintenanceActive, runTrackPlayerCommand } from "./audioFocus";

// Remote controls can arrive while the screen replaces the queue. Serialise
// them with those mutations and handle exhausted/empty queues without an
// unhandled promise rejection in the background service.
const command = (action: () => Promise<unknown>) => {
  void runTrackPlayerCommand(async () => {
    if (!isAudioMaintenanceActive()) await action();
  }).catch(() => undefined);
};

export async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    command(() => TrackPlayer.play());
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    command(() => TrackPlayer.pause());
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    command(() => TrackPlayer.stop());
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    command(() => TrackPlayer.skipToNext());
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    command(() => TrackPlayer.skipToPrevious());
  });

  TrackPlayer.addEventListener(Event.RemoteDuck, async ({ permanent, paused }: { permanent: boolean; paused: boolean }) => {
    // Use pause (not stop) even for permanent interruptions so the queue and
    // position are preserved. stop() destroys the queue and forces the user
    // to start the surah over; pause() lets them resume from the same verse.
    if (permanent || paused) {
      command(() => TrackPlayer.pause());
    }
    // Never resume automatically here. A user may have paused or started an
    // Adhan while interrupted. Explicit user Play remains available for paused
    // audio; setupPlayer also disables the equivalent native auto-resume path.
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }: { position: number }) => {
    command(() => TrackPlayer.seekTo(position));
  });
}
