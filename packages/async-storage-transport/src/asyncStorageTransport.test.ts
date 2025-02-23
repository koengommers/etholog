import { Log, createLogger } from "etholog";
import { describe, expect, it } from "vitest";

import { asyncStorageTransport } from "./asyncStorageTransport";

describe("asyncStorageTransport", () => {
  it("should store logs", async () => {
    const storage: Record<string, Array<Log>> = {};
    const transport = asyncStorageTransport({
      storage: {
        getItem: (key) => Promise.resolve(storage[key] ?? null),
        setItem: (key, value) => {
          storage[key] = value;
          return Promise.resolve();
        },
      },
    });
    const logger = createLogger({ transports: [transport] });

    logger.info("foo");
    logger.warn("bar");

    await logger.flush();

    expect(storage["ETHOLOG_STORAGE"]).toEqual([
      { level: "info", message: "foo", timestamp: expect.any(Number) },
      { level: "warn", message: "bar", timestamp: expect.any(Number) },
    ]);
  });

  it("should remove old logs when it exceeds maxLogs", async () => {
    const storage: Record<string, Array<Log>> = {};
    const transport = asyncStorageTransport({
      storage: {
        getItem: (key) => Promise.resolve(storage[key] ?? null),
        setItem: (key, value) => {
          storage[key] = value;
          return Promise.resolve();
        },
      },
      maxLogs: 2,
    });
    const logger = createLogger({ transports: [transport] });

    logger.info("foo");
    logger.warn("bar");
    logger.error("baz");
    logger.info("qux");

    await logger.flush();

    expect(storage["ETHOLOG_STORAGE"]).toEqual([
      { level: "error", message: "baz", timestamp: expect.any(Number) },
      { level: "info", message: "qux", timestamp: expect.any(Number) },
    ]);
  });
});
