import { Log, createLogger } from "etholog";
import { describe, expect, it } from "vitest";

import { syncStorageTransport } from "./syncStorageTransport";

describe("syncStorageTransport", () => {
  it("should store logs", () => {
    const storage: Record<string, Array<Log>> = {};
    const transport = syncStorageTransport({
      storage: {
        getItem: (key) => storage[key] ?? null,
        setItem: (key, value) => {
          storage[key] = value;
        },
      },
    });
    const logger = createLogger({ transports: [transport] });

    logger.info("foo");
    logger.warn("bar");

    expect(storage["ETHOLOG_SYNC_STORAGE"]).toEqual([
      { level: "info", message: "foo", timestamp: expect.any(Number) },
      { level: "warn", message: "bar", timestamp: expect.any(Number) },
    ]);
  });

  it("should remove old logs when it exceeds maxLogs", () => {
    const storage: Record<string, Array<Log>> = {};
    const transport = syncStorageTransport({
      storage: {
        getItem: (key) => storage[key] ?? null,
        setItem: (key, value) => {
          storage[key] = value;
        },
      },
      maxLogs: 2,
    });
    const logger = createLogger({ transports: [transport] });

    logger.info("foo");
    logger.warn("bar");
    logger.error("baz");
    logger.info("qux");

    expect(storage["ETHOLOG_SYNC_STORAGE"]).toEqual([
      { level: "error", message: "baz", timestamp: expect.any(Number) },
      { level: "info", message: "qux", timestamp: expect.any(Number) },
    ]);
  });
});
