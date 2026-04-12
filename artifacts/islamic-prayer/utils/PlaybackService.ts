import TrackPlayer, { Event } from "react-native-track-player";

export async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.stop();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    TrackPlayer.skipToNext();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    TrackPlayer.skipToPrevious();
  });

  TrackPlayer.addEventListener(Event.RemoteDuck, async ({ permanent, paused }: { permanent: boolean; paused: boolean }) => {
    // Use pause (not stop) even for permanent interruptions so the queue and
    // position are preserved. stop() destroys the queue and forces the user
    // to start the surah over; pause() lets them resume from the same verse.
    if (permanent || paused) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }: { position: number }) => {
    TrackPlayer.seekTo(position);
  });
}
