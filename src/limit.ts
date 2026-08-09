export type Limiter = <T>(fn: () => Promise<T>) => Promise<T>;

/**
 * Creates a function that runs at most `concurrency` promises at once,
 * queueing the rest until a slot frees up.
 */
export function createLimiter(concurrency: number): Limiter {
  let active = 0;
  const queue: Array<() => void> = [];

  function next(): void {
    active--;
    queue.shift()?.();
  }

  return function limit<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const run = () => {
        active++;
        fn().then(
          (value) => {
            next();
            resolve(value);
          },
          (error) => {
            next();
            reject(error);
          },
        );
      };

      if (active < concurrency) run();
      else queue.push(run);
    });
  };
}
