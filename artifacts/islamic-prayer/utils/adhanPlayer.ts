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

// Generation token: every previewAdhan() call increments this. If a newer
// call (or a stopAdhanAudio()) happens while we're awaiting createAsync /
// audio.play(), the older call's resolved sound is stale — we must unload
// it instead of attaching it to the module-level ref. Without this guard,
// rapid taps on different reciters in onboarding can leave a "ghost" sound
// playing in the background that was never tracked or stopped.
let previewGen = 0;

export async function previewAdhan(url: string): Promise<void> {
  const myGen = ++previewGen;
  await stopAdhanAudio();
  // stopAdhanAudio bumps no token of its own, but if another previewAdhan
  // call slipped in during the await above, our generation is now stale.
  if (myGen !== previewGen) return;

  if (Platform.OS === "web") {
    try {
      const audio = new window.Audio(url);
      try { await audio.play(); } catch {}
      // Re-check after the async play() — a newer preview may have started
      // and we'd otherwise leave this audio playing untracked.
      if (myGen !== previewGen) {
        try { audio.pause(); audio.src = ""; } catch {}
        return;
      }
      webAudio = audio;
      audio.onended = () => { if (webAudio === audio) webAudio = null; };
      audio.onerror = () => { if (webAudio === audio) webAudio = null; };
    } catch {}
  } else {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        allowsRecordingIOS: false,
      });
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, volume: 1.0 }
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
        if (!status.isLoaded) return;
        if (status.didJustFinish && nativeSound === sound) {
          nativeSound = null;
        }
      });
    } catch (e) {
      console.warn("[Adhan Preview] Audio error:", e);
    }
  }
}
