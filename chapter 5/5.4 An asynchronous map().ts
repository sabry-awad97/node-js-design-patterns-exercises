import { setTimeout } from 'timers/promises';

class Semaphore {
  /**
   * The number of available permits
   */
  private permits: number;

  /**
   * @param concurrency - The number of concurrent operations that can be executed
   */
  constructor(permits: number) {
    this.permits = permits;
  }

  /**
   * Acquires a permit, blocking until one is available
   */
  public async acquire(): Promise<void> {
    while (this.permits <= 0) {
      await setTimeout(0);
    }
    this.permits--;
  }

  /**
   * Releases a permit, allowing other blocked operations to proceed
   */
  public release(): void {
    this.permits++;
  }
}

async function mapAsync<T, R>(
  iterable: T[],
  callback: (value: T) => R | Promise<R>,
  concurrency: number
): Promise<R[]> {
  const semaphore = new Semaphore(concurrency);
  const results = Array<R>(iterable.length);

  const promises = iterable.map(async (item, index) => {
    await semaphore.acquire();
    try {
      results[index] = await callback(item);
    } finally {
      semaphore.release();
    }
  });

  await Promise.all(promises);

  return results;
}

const main = async () => {
  console.time();
  const results = await mapAsync(
    [1, 2, 3, 4, 5],
    async item => {
      await setTimeout(item * 1000);
      return item * 2;
    },
    5
  );
  console.timeEnd();
  console.log(results);
};

main();
