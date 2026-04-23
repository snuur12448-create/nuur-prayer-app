import { Audio } from "expo-av";
import { Platform } from "react-native";

let nativeSound: Audio.Sound | null = null;
let webAudio: HTMLAudioElement | null = null;
let finishCallback: (() => void) | null = null;

export async function playAdhanAudio(
  url: string,
  onFinish?: () => void
): Promise<void> {
  await stopAdhanAudio();
  finishCallback = onFinish ?? null;

  if (Platform.OS === "web") {
    try {
      const audio = new window.Audio(url);
      webAudio = audio;
      audio.onended = () => {
        webAudio = null;
        finishCallback?.();
        finishCallback = null;
      };
      audio.onerror = () => {
        webAudio = null;
        finishCallback?.();
        finishCallback = null;
      };
      await audio.play();
    } catch {
      finishCallback?.();
      finishCallback = null;
    }
  } else {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        allowsRecordingIOS: false,
        shouldDuckAndroid: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, volume: 1.0 }
      );
      nativeSound = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          nativeSound = null;
          finishCallback?.();
          finishCallback = null;
        }
      });
    } catch (e) {
      console.warn("[Adhan] Audio error:", e);
      finishCallback?.();
      finishCallback = null;
    }
  }
}

export async function stopAdhanAudio(): Promise<void> {
  finishCallback = null;

  if (Platform.OS === "web") {
    if (webAudio) {
      webAudio.pause();
      webAudio.onended = null;
      webAudio.onerror = null;
      webAudio.src = "";
      webAudio = null;
    }
  } else {
    if (nativeSound) {
      try {
        await nativeSound.stopAsync();
        await nativeSound.unloadAsync();
      } catch {}
      nativeSound = null;
    }
  }
}

// Track which URLs we've already prefetched this session so we don't refetch
// on every modal open. iOS's URL cache persists across app launches so a hit
// here usually means the bytes are already on disk too.
const prefetchedUrls = new Set<string>();

/**
 * Warm iOS's HTTP cache for the given adhan audio URLs by issuing a
 * lightweight fetch of each. The response is read fully so the bytes land
 * in NSURLCache (the server sends `cache-control: max-age=6048000` so this
 * is honored). Subsequent `Audio.Sound.createAsync` calls then load from
 * the local cache instead of from the network — turning what was an 8-second
 * cold-start into a sub-second warm playback.
 *
 * Call this when the AdhanStyleModal becomes visible. Failures are silent
 * because this is a pure performance optimization — playback paths still
 * work without it.
 */
export function prefetchAdhanAudio(urls: string[]): void {
  if (Platform.OS === "web") return; // web uses a different cache path
  for (const url of urls) {
    if (prefetchedUrls.has(url)) continue;
    prefetchedUrls.add(url);
    // Fire-and-forget. We don't await; we just want the bytes flowing into
    // the URL cache. AbortController unused because cancelling mid-flight
    // would defeat the purpose.
    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          prefetchedUrls.delete(url); // allow retry on next modal open
          return;
        }
        // Drain the body so iOS actually stores it in the cache. Without
        // this, the connection sits open and bytes never get cached.
        try { await res.arrayBuffer(); } catch {}
      })
      .catch(() => {
        prefetchedUrls.delete(url); // network error → allow retry
      });
  }
}

// Generation token: every previewAdhan() call increments this. If a newer
// call (or a stopAdhanAudio()) happens while we're awaiting createAsync /
// audio.play(), the older call's resolved sound is stale — we must unload
// it instead of attaching it to the module-level ref. Without this guard,
// rapid taps on different reciters in onboarding can leave a "ghost" sound
// playing in the background that was never tracked or stopped.
let previewGen = 0;

export interface PreviewCallbacks {
  // Resolves the moment audio is loaded enough to begin playback (so the UI
  // can flip from "loading…" → "playing"). Not called if the load fails or
  // a newer preview interrupted us.
  onPlaybackStarted?: () => void;
  // Fires when the file finishes naturally OR when the load fails. Lets the
  // UI clear the "playing" indicator without polling.
  onFinishOrError?: (didError: boolean) => void;
}

export async function previewAdhan(
  url: string,
  cb?: PreviewCallbacks,
  // Optional offset (ms) into the file to start playback at. Used to skip
  // dead-air intros on certain reciters (e.g. Madinah's a1.mp3 has ~6s of
  // low-volume buildup). 0 / undefined plays from the very start.
  startAtMs: number = 0,
): Promise<void> {
  const myGen = ++previewGen;
  await stopAdhanAudio();
  // stopAdhanAudio bumps no token of its own, but if another previewAdhan
  // call slipped in during the await above, our generation is now stale.
  if (myGen !== previewGen) return;

  if (Platform.OS === "web") {
    try {
      const audio = new window.Audio(url);
      if (startAtMs > 0) {
        // Seek as soon as the browser knows the duration. Setting
        // currentTime before metadata is loaded is silently ignored.
        audio.addEventListener("loadedmetadata", () => {
          try { audio.currentTime = startAtMs / 1000; } catch {}
        });
      }
      audio.oncanplay = () => {
        if (myGen === previewGen) cb?.onPlaybackStarted?.();
      };
      audio.onended = () => {
        if (webAudio === audio) webAudio = null;
        if (myGen === previewGen) cb?.onFinishOrError?.(false);
      };
      audio.onerror = () => {
        if (webAudio === audio) webAudio = null;
        if (myGen === previewGen) cb?.onFinishOrError?.(true);
      };
      try { await audio.play(); } catch {
        cb?.onFinishOrError?.(true);
        return;
      }
      // Re-check after the async play() — a newer preview may have started
      // and we'd otherwise leave this audio playing untracked.
      if (myGen !== previewGen) {
        try { audio.pause(); audio.src = ""; } catch {}
        return;
      }
      webAudio = audio;
    } catch (e) {
      console.warn("[Adhan Preview] Web audio error:", e);
      cb?.onFinishOrError?.(true);
    }
  } else {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        allowsRecordingIOS: false,
      });
      // Track whether we've already fired onPlaybackStarted, since with
      // progressive streaming (downloadFirst=false) we hand back a Sound
      // instance immediately and watch the status updates for the first
      // moment isPlaying flips true. Without this guard we'd fire the
      // callback dozens of times.
      let startedNotified = false;

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        {
          shouldPlay: true,
          volume: 1.0,
          progressUpdateIntervalMillis: 200,
          // Skip dead-air intros (e.g. Madinah) so the preview cuts straight
          // to the reciter. positionMillis is honored on the very first load.
          positionMillis: startAtMs > 0 ? startAtMs : 0,
        },
        null,
        // Critical: false = progressive streaming. Default (true) makes
        // expo-av download the ENTIRE mp3 before reporting loaded — which
        // means a 3.4 MB Madinah adhan can spend 4-6 seconds buffering on
        // cellular before any sound emits. Streaming starts within ~500 ms.
        false,
      );
      // Same race check as web: if a newer preview started while createAsync
      // was running, throw away this sound instead of attaching it.
      if (myGen !== previewGen) {
        try { await sound.stopAsync(); } catch {}
        try { await sound.unloadAsync(); } catch {}
        return;
      }
      nativeSound = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          // Load failure mid-stream (network drop, decode error, etc.) lands
          // here with status.error populated. Surface it to the UI so the
          // user isn't stuck staring at a "playing" spinner forever.
          if ("error" in status && status.error) {
            console.warn("[Adhan Preview] Playback error:", status.error);
            if (nativeSound === sound) nativeSound = null;
            if (myGen === previewGen) cb?.onFinishOrError?.(true);
          }
          return;
        }
        // Fire onPlaybackStarted the first time the sound is actually emitting
        // (isPlaying === true). With progressive streaming this can be
        // slightly later than createAsync resolution, so the spinner stays
        // up until audio truly begins — honest UI.
        if (!startedNotified && status.isPlaying) {
          startedNotified = true;
          if (myGen === previewGen) cb?.onPlaybackStarted?.();
        }
        if (status.didJustFinish && nativeSound === sound) {
          nativeSound = null;
          if (myGen === previewGen) cb?.onFinishOrError?.(false);
        }
      });
    } catch (e) {
      // createAsync rejected — most often network failure or unsupported codec.
      // Without surfacing this, the modal sits with a dead "stop" button.
      console.warn("[Adhan Preview] createAsync error for", url, e);
      cb?.onFinishOrError?.(true);
    }
  }
}
