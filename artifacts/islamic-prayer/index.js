// Register TrackPlayer's PlaybackService BEFORE Expo Router mounts.
// This is what makes Control Centre play/pause/skip buttons actually work.
// Guarded by isExpoGo so it silently no-ops in Expo Go where the native
// module is unavailable.
const Constants = require("expo-constants").default;
const isExpoGo = Constants.executionEnvironment === "storeClient";

if (!isExpoGo) {
  try {
    const TrackPlayer = require("react-native-track-player").default;
    const { PlaybackService } = require("./utils/PlaybackService");
    TrackPlayer.registerPlaybackService(() => PlaybackService);
  } catch (_) {
    // Native module unavailable (e.g. dev client without TrackPlayer) — skip
  }
}

require("expo-router/entry");
