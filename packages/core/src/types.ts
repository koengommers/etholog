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
