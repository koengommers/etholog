import { describe, expect, it, vi } from "vitest";

import { createLogger } from "./createLogger";
import { createTransport } from "./createTransport";
import { serializeErrors } from "./processors/serializeErrors";
import { Log } from "./types";

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

  describe("processors", () => {
    it("should not serialize errors unless serializeErrors is configured", () => {
      const mockTransport = vi.fn();
      const error = new Error("boom");
      const logger = createLogger({
        transports: [createTransport(mockTransport)],
      });

      logger.error("request failed", { error });

      const log = mockTransport.mock.calls[0]?.[0] as Log;
      expect(log.data?.error).toBe(error);
    });

    it("should serialize errors when serializeErrors is configured", () => {
      const mockTransport = vi.fn();
      const logger = createLogger({
        processors: [serializeErrors()],
        transports: [createTransport(mockTransport)],
      });

      logger.error("request failed", { error: new Error("boom") });

      const log = mockTransport.mock.calls[0]?.[0] as Log;
      expect(log.data?.error).toMatchObject({
        name: "Error",
        message: "boom",
      });
      expect(JSON.parse(JSON.stringify(log)).data.error.message).toBe("boom");
    });

    it("should run processors in order", () => {
      const mockTransport = vi.fn();
      const logger = createLogger({
        processors: [
          (log) => ({ ...log, message: `${log.message} one` }),
          (log) => ({ ...log, message: `${log.message} two` }),
        ],
        transports: [createTransport(mockTransport)],
      });

      logger.info("start");

      expect(mockTransport).toHaveBeenCalledWith(
        expect.objectContaining({ message: "start one two" }),
      );
    });

    it("should show live errors to processors placed before serializeErrors", () => {
      const seen = vi.fn();
      const logger = createLogger({
        processors: [
          (log) => {
            seen(log.data?.error instanceof Error);
            return log;
          },
          serializeErrors(),
        ],
        transports: [createTransport(vi.fn())],
      });

      logger.error("failed", { error: new Error("boom") });

      expect(seen).toHaveBeenCalledWith(true);
    });

    it("should drop the log when a processor returns null", () => {
      const mockTransport = vi.fn();
      const logger = createLogger({
        processors: [() => null],
        transports: [createTransport(mockTransport)],
      });

      logger.info("hello");

      expect(mockTransport).not.toHaveBeenCalled();
    });

    it("should not run later processors after a log is dropped", () => {
      const later = vi.fn((log) => log);
      const logger = createLogger({
        processors: [() => null, later],
        transports: [createTransport(vi.fn())],
      });

      logger.info("hello");

      expect(later).not.toHaveBeenCalled();
    });

    it("should pass the log through when a processor throws", () => {
      const mockTransport = vi.fn();
      const logger = createLogger({
        processors: [
          () => {
            throw new Error("oops");
          },
        ],
        transports: [createTransport(mockTransport)],
      });

      expect(() => logger.info("hello")).not.toThrow();
      expect(mockTransport).toHaveBeenCalledWith(
        expect.objectContaining({ message: "hello" }),
      );
    });

    it("should warn only once for a processor that keeps throwing", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const logger = createLogger({
        processors: [
          () => {
            throw new Error("oops");
          },
        ],
        transports: [createTransport(vi.fn())],
      });

      logger.info("one");
      logger.info("two");
      logger.info("three");

      expect(warn).toHaveBeenCalledTimes(1);
      warn.mockRestore();
    });

    it("should let a processor after serializeErrors see plain objects", () => {
      const mockTransport = vi.fn();
      const logger = createLogger({
        processors: [
          serializeErrors(),
          (log) => {
            const error = log.data?.error as { message: string };
            return { ...log, data: { ...log.data, seen: error.message } };
          },
        ],
        transports: [createTransport(mockTransport)],
      });

      logger.error("failed", { error: new Error("boom") });

      const log = mockTransport.mock.calls[0]?.[0] as Log;
      expect(log.data?.seen).toBe("boom");
      expect(log.data?.error).toMatchObject({ message: "boom" });
    });

    it("should inherit processors in child loggers", () => {
      const mockTransport = vi.fn();
      const logger = createLogger({
        processors: [(log) => ({ ...log, message: `${log.message}!` })],
        transports: [createTransport(mockTransport)],
      });

      logger.child({ foo: "bar" }).info("hello");

      expect(mockTransport).toHaveBeenCalledWith(
        expect.objectContaining({ message: "hello!", data: { foo: "bar" } }),
      );
    });
  });
});
