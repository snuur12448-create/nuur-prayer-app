/**
 * Serializes replace-style mutations and discards queued work superseded by a
 * newer request. A task that has already started is allowed to finish; the
 * newest queued task then replaces its result without ever running alongside
 * it. This is used by notification rescheduling to prevent cancel/create
 * phases from interleaving and producing duplicate or partial schedules.
 */
export function createLatestOnlyMutationQueue(): (task: () => Promise<void>) => Promise<void> {
  let queue: Promise<void> = Promise.resolve();
  let latestGeneration = 0;

  return (task: () => Promise<void>): Promise<void> => {
    const generation = ++latestGeneration;
    const run = async () => {
      if (generation !== latestGeneration) return;
      await task();
    };
    const result = queue.then(run, run);
    queue = result.catch(() => {});
    return result;
  };
}
