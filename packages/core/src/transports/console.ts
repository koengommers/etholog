import { createTransport } from "../createTransport";
import { Level } from "../types";

type LevelMap = Record<Level, "log" | "info" | "warn" | "error" | "debug">;

type ConsoleTransportOptions = {
  levelMap?: LevelMap;
};

const DEFAULT_LEVEL_MAP: LevelMap = {
  error: "error",
  warn: "warn",
  info: "info",
  debug: "debug",
} as const;

export function consoleTransport(options?: ConsoleTransportOptions) {
  const levelMap = options?.levelMap ?? DEFAULT_LEVEL_MAP;
  return createTransport((log) => {
    const logFnName = log.level in levelMap ? levelMap[log.level] : "log";
    if (log.data) {
      console[logFnName](log.message, log.data);
      return;
    }
    console[logFnName](log.message);
  });
}
