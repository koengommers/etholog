import { describe, expect, it, vi } from "vitest";

import { createLogger } from "./createLogger";
import { createTransport } from "./createTransport";

describe("createLogger", () => {
  it("should log a message", () => {
    const mockTransport = vi.fn();
    const transport = createTransport(mockTransport);
    const logger = createLogger({
      transports: [transport],
    });

    logger.info("hello");

    expect(mockTransport).toHaveBeenCalledOnce();
    expect(mockTransport).toHaveBeenCalledWith({
      level: "info",
      message: "hello",
      timestamp: expect.any(Number),
    });
  });

  it("should log a message with data", () => {
    const mockTransport = vi.fn();
    const transport = createTransport(mockTransport);
    const logger = createLogger({
      transports: [transport],
    });

    logger.info("hello", { foo: "bar" });

    expect(mockTransport).toHaveBeenCalledOnce();
    expect(mockTransport).toHaveBeenCalledWith({
      level: "info",
      message: "hello",
      timestamp: expect.any(Number),
      data: { foo: "bar" },
    });
  });

  it("should log a message to all transports", () => {
    const mockTransport1 = vi.fn();
    const mockTransport2 = vi.fn();
    const transport1 = createTransport(mockTransport1);
    const transport2 = createTransport(mockTransport2);
    const logger = createLogger({
      transports: [transport1, transport2],
    });

    logger.info("hello");

    expect(mockTransport1).toHaveBeenCalledOnce();
    expect(mockTransport1).toHaveBeenCalledWith({
      level: "info",
      message: "hello",
      timestamp: expect.any(Number),
    });

    expect(mockTransport2).toHaveBeenCalledOnce();
    expect(mockTransport2).toHaveBeenCalledWith({
      level: "info",
      message: "hello",
      timestamp: expect.any(Number),
    });
  });

  it("should be able to produce a child logger", () => {
    const mockTransport = vi.fn();
    const transport = createTransport(mockTransport);
    const logger = createLogger({
      transports: [transport],
    });

    const childLogger = logger.child({ foo: "bar" });

    childLogger.info("hello");

    expect(mockTransport).toHaveBeenCalledOnce();
    expect(mockTransport).toHaveBeenCalledWith({
      level: "info",
      message: "hello",
      timestamp: expect.any(Number),
      data: { foo: "bar" },
    });
  });

  it("should catch errors thrown by transports", () => {
    const transport = createTransport(() => {
      throw new Error("oops");
    });
    const logger = createLogger({
      transports: [transport],
    });

    expect(() => logger.info("hello")).not.toThrow();
  });
});
