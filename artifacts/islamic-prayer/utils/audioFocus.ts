export interface AudioFocusLease {
  isCurrent(): boolean;
  release(): void;
}

/** One voice at a time, including across asynchronous native stop operations. */
export function createAudioFocusCoordinator() {
  let active: { owner: string; stop: () => void | Promise<void> } | null = null;
  let cleanup: Promise<void> = Promise.resolve();
  let suspended = false;

  const acquire = async (owner: string, stop: () => void | Promise<void>): Promise<AudioFocusLease> => {
    if (suspended) throw new Error("Audio is unavailable while app data is being changed. Restart Nuur to continue.");
    const previous = active;
    const claim = { owner, stop };
    active = claim;
    // Invoke immediately: the old owner must invalidate its pending start now,
    // not after an asynchronous native pause/reset finally completes.
    if (previous && previous.owner !== owner) {
      let stopping: Promise<void>;
      try { stopping = Promise.resolve(previous.stop()); }
      catch (error) { stopping = Promise.reject(error); }
      cleanup = Promise.all([cleanup, stopping]).then(() => undefined);
    }
    const pending = cleanup;
    try {
      await pending;
    } catch (error) {
      // If native stop failed, the previous voice may still be audible. Fail
      // closed until reload rather than lose its owner and allow overlapping
      // playback on a subsequent retry.
      suspended = true;
      if (active === claim) active = null;
      if (cleanup === pending) cleanup = Promise.resolve();
      throw error;
    }
    return {
      isCurrent: () => active === claim,
      release: () => { if (active === claim) active = null; },
    };
  };
  return Object.assign(acquire, {
    isSuspended: () => suspended,
    suspend: async () => {
      suspended = true;
      const previous = active;
      active = null;
      const stopping = previous?.stop();
      await Promise.all([cleanup, stopping]);
    },
  });
}

export const acquireAudioFocus = createAudioFocusCoordinator();

/** Native queue mutations must not interleave reset/add/play from older taps. */
export function createAudioCommandQueue() {
  let tail: Promise<unknown> = Promise.resolve();
  return <T>(command: () => Promise<T>): Promise<T> => {
    const result = tail.then(command, command);
    tail = result.catch(() => undefined);
    return result;
  };
}

export const runTrackPlayerCommand = createAudioCommandQueue();

/** Remains suspended until a JS reload, preventing stale hydration callbacks. */
export async function stopAllAudioForMaintenance(): Promise<void> {
  await acquireAudioFocus.suspend();
  await runTrackPlayerCommand(async () => undefined);
  const { flushAudioSessionChanges } = await import("./audioPlayback");
  await flushAudioSessionChanges();
}

export const isAudioMaintenanceActive = () => acquireAudioFocus.isSuspended();
