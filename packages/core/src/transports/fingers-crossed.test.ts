import { Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { createLogger } from "../createLogger";
import type { Transport } from "../types";
import { fingersCrossedTransport } from "./fingers-crossed";

function createMockTransport() {
  return {
    process: vi.fn(),
  } as unknown as Transport;
}

describe("fingersCrossedTransport", () => {
  let mockTransport: Transport;

  beforeEach(() => {
    mockTransport = createMockTransport();
  });

  it("buffers logs before action level is reached", () => {
    const transport = fingersCrossedTransport({
      transport: mockTransport,
      actionLevel: "error",
    });
    const logger = createLogger({
      transports: [transport],
    });

    logger.debug("foo");
    logger.info("bar");

    expect(mockTransport.process).not.toHaveBeenCalled();
  });

  it("flushes buffer when action level is reached", () => {
    const transport = fingersCrossedTransport({
      transport: mockTransport,
      actionLevel: "warn",
    });
    const logger = createLogger({
      transports: [transport],
    });

    logger.debug("foo");
    logger.info("bar");
    logger.warn("baz");

    const calls = (mockTransport.process as Mock).mock.calls;
    expect(calls[0]?.[0].message).toBe("foo");
    expect(calls[1]?.[0].message).toBe("bar");
    expect(calls[2]?.[0].message).toBe("baz");
  });

  it("passes logs through after triggering", () => {
    const transport = fingersCrossedTransport({
      transport: mockTransport,
      actionLevel: "warn",
    });

    const logger = createLogger({ transports: [transport] });

    logger.warn("trigger");
    logger.info("after");

    expect(mockTransport.process).toHaveBeenCalledTimes(2);

    const calls = (mockTransport.process as Mock).mock.calls;
    expect(calls[0]?.[0].message).toBe("trigger");
    expect(calls[1]?.[0].message).toBe("after");
  });

  it("respects bufferSize and drops oldest logs", () => {
    const transport = fingersCrossedTransport({
      transport: mockTransport,
      actionLevel: "error",
      bufferSize: 3,
    });

    const logger = createLogger({ transports: [transport] });

    logger.debug("foo");
    logger.info("bar");
    logger.info("baz"); // drops "foo"
    logger.error("qux"); // triggers

    expect(mockTransport.process).toHaveBeenCalledTimes(3);

    const calls = (mockTransport.process as Mock).mock.calls;

    expect(calls[0]?.[0].message).toBe("bar");
    expect(calls[1]?.[0].message).toBe("baz");
    expect(calls[2]?.[0].message).toBe("qux");
  });

  it("can be triggered manually", () => {
    const transport = fingersCrossedTransport({
      transport: mockTransport,
    });

    const logger = createLogger({ transports: [transport] });

    logger.info("foo");

    transport.activate();

    expect(mockTransport.process).toHaveBeenCalledTimes(1);
    expect((mockTransport.process as Mock).mock.calls[0]?.[0].message).toBe(
      "foo",
    );
  });

  it("does nothing on manual trigger if buffer is empty", () => {
    const transport = fingersCrossedTransport({
      transport: mockTransport,
    });

    transport.activate();

    expect(mockTransport.process).not.toHaveBeenCalled();
  });
});
