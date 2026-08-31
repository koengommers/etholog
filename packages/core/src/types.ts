import { LEVELS } from "./constants";

export type Level = keyof typeof LEVELS;

export type LogData = Record<string, unknown>;

export type Log = {
  level: Level;
  message: string;
  timestamp: number;
  data?: LogData;
};

export type Transport = {
  process: (log: Log) => void;
  flush: () => Promise<void>;
};

/**
 * Transforms a log before transports receive it. Returning `null` drops the log.
 * Processors run in order, synchronously, after level filtering.
 */
export type Processor = (log: Log) => Log | null;
