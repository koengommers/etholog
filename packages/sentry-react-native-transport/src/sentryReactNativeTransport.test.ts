import * as Sentry from "@sentry/react-native";
import { createLogger } from "etholog";
import { describe, expect, it, vi } from "vitest";

import { sentryReactNativeTransport } from "./sentryReactNativeTransport";

vi.mock("@sentry/react-native");

describe("sentryReactNativeTransport", () => {
  it("should add a log", () => {
    const transport = sentryReactNativeTransport();
    const logger = createLogger({ transports: [transport] });

    logger.info("foo");

    expect(Sentry.logger.info).toHaveBeenCalledWith("foo", undefined);
  });

  it("should add a log with data", () => {
    const transport = sentryReactNativeTransport();
    const logger = createLogger({ transports: [transport] });

    logger.info("foo", { bar: "baz" });

    expect(Sentry.logger.info).toHaveBeenCalledWith("foo", {
      bar: "baz",
    });
  });

  it("should use level in accordance with the levelMap", () => {
    const transport = sentryReactNativeTransport({
      levelMap: {
        debug: "info",
        info: "info",
        warn: "info",
        error: "info",
      },
    });
    const logger = createLogger({ transports: [transport] });

    logger.debug("foo");
    logger.info("bar");
    logger.warn("baz");
    logger.error("qux");

    expect(Sentry.logger.info).toHaveBeenCalledWith("foo", undefined);
    expect(Sentry.logger.info).toHaveBeenCalledWith("bar", undefined);
    expect(Sentry.logger.info).toHaveBeenCalledWith("baz", undefined);
    expect(Sentry.logger.info).toHaveBeenCalledWith("qux", undefined);
  });
});
