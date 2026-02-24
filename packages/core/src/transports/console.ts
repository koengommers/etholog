import { LEVELS } from "../constants";
import { createTransport } from "../createTransport";
import { Level, Log } from "../types";

type LevelMap = Record<Level, "log" | "info" | "warn" | "error" | "debug">;

type ConsoleTransportOptions = {
  levelMap?: LevelMap;
  /** The minimum level to log. If defined, logs below this level will be omitted. */
  level?: Level;
  /** Whether to enable the transport. Defaults to true. Recommended to set to false in production. */
  enabled?: boolean;
};

const DEFAULT_LEVEL_MAP: LevelMap = {
  error: "error",
  warn: "warn",
  info: "info",
  debug: "debug",
} as const;

export function consoleTransport(options?: ConsoleTransportOptions) {
  const levelMap = options?.levelMap ?? DEFAULT_LEVEL_MAP;
  const enabled = options?.enabled ?? true;

  function shouldHandle(log: Log) {
    if (!enabled) {
      return false;
    }
    return options?.level === undefined
      ? true
      : LEVELS[log.level] >= LEVELS[options.level];
  }

  return createTransport((log) => {
    if (!shouldHandle(log)) {
      return;
    }
    const logFnName = log.level in levelMap ? levelMap[log.level] : "log";
    if (log.data) {
      console[logFnName](log.message, log.data);
      return;
    }
    console[logFnName](log.message);
  });
}
