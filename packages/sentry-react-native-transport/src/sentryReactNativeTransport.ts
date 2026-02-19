import * as Sentry from "@sentry/react-native";
import { type Level, createTransport } from "etholog";

type SentryLogLevel = "error" | "warn" | "info" | "debug" | "trace" | "fatal";

type LevelMap = Record<Level, SentryLogLevel>;

export type SentryReactNativeTransportOptions = {
  levelMap?: LevelMap;
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

  return createTransport(
    (log) => {
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
