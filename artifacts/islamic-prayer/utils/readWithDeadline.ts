/** Bound read-only diagnostics. A late native result cannot replace the timeout.
 * Do not use this for mutations: timing out does not cancel the underlying work.
 */
export function readWithDeadline<T>(read: () => Promise<T>, milliseconds = 10_000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("The status check timed out. Please try again.")), milliseconds);
    Promise.resolve().then(read).then(
      value => { clearTimeout(timer); resolve(value); },
      error => { clearTimeout(timer); reject(error); },
    );
  });
}
