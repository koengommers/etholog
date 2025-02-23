import * as Sentry from "@sentry/react-native";
import { createLogger } from "etholog";
import { describe, expect, it, vi } from "vitest";

import { sentryReactNativeTransport } from "./sentryReactNativeTransport";

vi.mock("@sentry/react-native");

describe("sentryReactNativeTransport", () => {
  it("should add a breadcrumb", () => {
    const transport = sentryReactNativeTransport();
    const logger = createLogger({ transports: [transport] });

    logger.info("foo");

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      message: "foo",
      level: "info",
    });
  });

  it("should add a breadcrumb with data", () => {
    const transport = sentryReactNativeTransport();
    const logger = createLogger({ transports: [transport] });

    logger.info("foo", { bar: "baz" });

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      message: "foo",
      level: "info",
      data: { bar: "baz" },
    });
  });

  it("should add level in accordance with the levelMap", () => {
    const transport = sentryReactNativeTransport({
      levelMap: {
        debug: "log",
        info: "log",
        warn: "log",
        error: "log",
      },
    });
    const logger = createLogger({ transports: [transport] });

    logger.debug("foo");
    logger.info("bar");
    logger.warn("baz");
    logger.error("qux");

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      message: "foo",
      level: "log",
    });
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      message: "bar",
      level: "log",
    });
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      message: "baz",
      level: "log",
    });
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      message: "qux",
      level: "log",
    });
  });
});
