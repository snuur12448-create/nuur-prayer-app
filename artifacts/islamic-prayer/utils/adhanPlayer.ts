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

export async function previewAdhan(url: string): Promise<void> {
  await stopAdhanAudio();

  if (Platform.OS === "web") {
    try {
      const audio = new window.Audio(url);
      webAudio = audio;
      audio.onended = () => { webAudio = null; };
      audio.onerror = () => { webAudio = null; };
      await audio.play();
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
      nativeSound = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          nativeSound = null;
        }
      });
    } catch (e) {
      console.warn("[Adhan Preview] Audio error:", e);
    }
  }
}
