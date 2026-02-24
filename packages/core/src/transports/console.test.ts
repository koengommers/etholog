import { describe, expect, it, vi } from "vitest";

import { createLogger } from "../createLogger";
import { consoleTransport } from "./console";

describe("consoleTransport", () => {
  it("should output logs to console", () => {
    const transport = consoleTransport();
    const logger = createLogger({
      transports: [transport],
    });

    const debugSpy = vi.spyOn(console, "debug");
    const infoSpy = vi.spyOn(console, "info");
    const warnSpy = vi.spyOn(console, "warn");
    const errorSpy = vi.spyOn(console, "error");

    logger.debug("foo");
    logger.info("bar");
    logger.warn("baz");
    logger.error("qux");

    expect(debugSpy).toHaveBeenCalledWith("foo");
    expect(infoSpy).toHaveBeenCalledWith("bar");
    expect(warnSpy).toHaveBeenCalledWith("baz");
    expect(errorSpy).toHaveBeenCalledWith("qux");
  });

  it("should output according to the levelMap", () => {
    const transport = consoleTransport({
      levelMap: {
        debug: "log",
        info: "log",
        warn: "log",
        error: "log",
      },
    });
    const logger = createLogger({
      transports: [transport],
    });
    const consoleSpy = vi.spyOn(console, "log");

    logger.debug("foo");
    logger.info("bar");
    logger.warn("baz");
    logger.error("qux");

    expect(consoleSpy).toHaveBeenCalledWith("foo");
    expect(consoleSpy).toHaveBeenCalledWith("bar");
    expect(consoleSpy).toHaveBeenCalledWith("baz");
    expect(consoleSpy).toHaveBeenCalledWith("qux");
  });

  it("should omit logs below the level", () => {
    const transport = consoleTransport({
      level: "warn",
    });
    const logger = createLogger({
      transports: [transport],
    });

    const debugSpy = vi.spyOn(console, "debug");
    const infoSpy = vi.spyOn(console, "info");
    const warnSpy = vi.spyOn(console, "warn");
    const errorSpy = vi.spyOn(console, "error");

    logger.debug("foo");
    logger.info("bar");
    logger.warn("baz");
    logger.error("qux");

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith("baz");
    expect(errorSpy).toHaveBeenCalledWith("qux");
  });
});
