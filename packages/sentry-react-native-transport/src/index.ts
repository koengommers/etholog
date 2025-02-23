import * as Sentry from "@sentry/react-native";
import { Level, createTransport } from "etholog";

type LevelMap = Record<Level, Sentry.SeverityLevel>;

export type SentryReactNativeTransportOptions = {
  levelMap?: LevelMap;
};

const DEFAULT_LEVEL_MAP: LevelMap = {
  error: "error",
  warn: "warning",
  info: "info",
  debug: "debug",
} as const;

export function sentryReactNativeTransport(
  options?: SentryReactNativeTransportOptions,
) {
  const levelMap = options?.levelMap ?? DEFAULT_LEVEL_MAP;

  return createTransport(
    (log) => {
      Sentry.addBreadcrumb({
        message: log.message,
        level: levelMap[log.level],
        data: log.data,
      });
    },
    {
      flush: async () => {
        await Sentry.flush();
      },
    },
  );
}
