import * as Sentry from "@sentry/react-native";
import { LEVELS, Log } from "etholog";
import { type Level, createTransport } from "etholog";

type SentryLogLevel = "error" | "warn" | "info" | "debug" | "trace" | "fatal";

type LevelMap = Record<Level, SentryLogLevel>;

export type SentryReactNativeTransportOptions = {
  levelMap?: LevelMap;
  /** The minimum level to log. If defined, logs below this level will be omitted. */
  level?: Level;
};

const DEFAULT_LEVEL_MAP = {
  error: "error",
  warn: "warn",
  info: "info",
  debug: "debug",
} satisfies LevelMap;

export function sentryReactNativeTransport(
  options?: SentryReactNativeTransportOptions,
) {
  const levelMap = options?.levelMap ?? DEFAULT_LEVEL_MAP;

  function shouldHandle(log: Log) {
    return options?.level === undefined
      ? true
      : LEVELS[log.level] >= LEVELS[options.level];
  }

  return createTransport(
    (log) => {
      if (!shouldHandle(log)) {
        return;
      }
      const sentryLevel = levelMap[log.level];
      Sentry.logger[sentryLevel](log.message, log.data);
    },
    {
      flush: async () => {
        await Sentry.flush();
      },
    },
  );
}
