import { describe, expect, it } from "vitest";
import { createLimiter } from "./limit.js";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe("createLimiter", () => {
  it("never runs more than `concurrency` tasks at once", async () => {
    const limit = createLimiter(2);
    let active = 0;
    let maxActive = 0;

    const gates = Array.from({ length: 5 }, () => deferred<void>());

    const runs = gates.map((gate, i) =>
      limit(async () => {
        active++;
        maxActive = Math.max(maxActive, active);
        await gate.promise;
        active--;
        return i;
      }),
    );

    // let the first batch start
    await Promise.resolve();
    await Promise.resolve();

    for (const gate of gates) gate.resolve();
    const results = await Promise.all(runs);

    expect(results).toEqual([0, 1, 2, 3, 4]);
    expect(maxActive).toBeLessThanOrEqual(2);
  });

  it("propagates rejections without blocking the queue", async () => {
    const limit = createLimiter(1);

    const first = limit(() => Promise.reject(new Error("boom")));
    const second = limit(() => Promise.resolve("ok"));

    await expect(first).rejects.toThrow("boom");
    await expect(second).resolves.toBe("ok");
  });
});
