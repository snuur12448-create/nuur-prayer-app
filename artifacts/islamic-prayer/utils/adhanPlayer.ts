import { Platform } from "react-native";
import { createAudioPlayback, type AudioPlayback } from "./audioPlayback";
import { acquireAudioFocus, type AudioFocusLease } from "./audioFocus";

let playback: AudioPlayback | null = null;
let lease: AudioFocusLease | null = null;
let playbackGeneration = 0;

export interface PreviewCallbacks {
  onPlaybackStarted?: () => void;
  onFinishOrError?: (didError: boolean) => void;
}

export async function stopAdhanAudio(): Promise<void> {
  ++playbackGeneration;
  playback?.stop();
  playback = null;
  lease?.release();
  lease = null;
}

async function startAdhan(url: string, background: boolean, cb?: PreviewCallbacks, startAtMs = 0): Promise<void> {
  // Invalidate synchronously before any await; two rapid calls cannot capture
  // the same generation while the previous native player is being released.
  void stopAdhanAudio();
  const generation = playbackGeneration;
  let hasStarted = false;
  const finish = (didError: boolean) => {
    if (generation !== playbackGeneration) return;
    void stopAdhanAudio();
    cb?.onFinishOrError?.(didError);
  };
  try {
    const claim = await acquireAudioFocus("adhan", () => finish(false));
    if (generation !== playbackGeneration || !claim.isCurrent()) { claim.release(); return; }
    lease = claim;
    const session = createAudioPlayback(url, {
      background,
      startAtMs,
      onState: (state) => {
        if (generation !== playbackGeneration) return;
        if (state === "playing" && !hasStarted) { hasStarted = true; cb?.onPlaybackStarted?.(); }
        // A call/headphone interruption must not resume the Adhan unexpectedly.
        if (state === "paused" && hasStarted) finish(false);
      },
      onFinish: () => finish(false),
      onError: () => finish(true),
    });
    playback = session;
    await session.start();
  } catch { finish(true); }
}

export function playAdhanAudio(url: string, onFinish?: () => void): Promise<void> {
  return startAdhan(url, true, { onFinishOrError: () => onFinish?.() });
}

export function previewAdhan(url: string, cb?: PreviewCallbacks, startAtMs = 0): Promise<void> {
  return startAdhan(url, false, cb, startAtMs);
}

const prefetchedUrls = new Set<string>();
/** Best-effort cache warming only; playback streams even without this cache. */
export function prefetchAdhanAudio(urls: string[]): void {
  if (Platform.OS === "web") return;
  for (const url of urls) {
    if (prefetchedUrls.has(url)) continue;
    prefetchedUrls.add(url);
    fetch(url).then(async (response) => {
      if (!response.ok) throw new Error("Audio cache unavailable");
      await response.arrayBuffer();
    }).catch(() => prefetchedUrls.delete(url));
  }
}
