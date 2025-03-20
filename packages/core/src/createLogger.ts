import { LEVELS } from "./constants";
import { Level, LogData, Transport } from "./types";

type LoggerOptions = {
  level?: Level;
  data?: LogData;
  transports: [Transport, ...Transport[]];
};

type LogMethod = (message: string, data?: LogData) => void;

type ProxiedMethods = {
  [key in Level]: LogMethod;
};

type PlainLogger = {
  flush: () => Promise<void>;
  child: (data: LogData) => Logger;
};

type Logger = PlainLogger & ProxiedMethods;

export function createLogger(options: LoggerOptions) {
  function log(level: Level, message: string, data?: LogData) {
    if (options.level && LEVELS[level] > LEVELS[options.level]) {
      return;
    }

    const combinedData = {
      ...options.data,
      ...data,
    };

    const log = {
      level,
      message,
      timestamp: Date.now(),
      data: Object.keys(combinedData).length > 0 ? combinedData : undefined,
    };

    options.transports.forEach((transport) => {
      try {
        transport.process(log);
      } catch (error) {
        console.warn("Failed to process log", error);
      }
    });
  }

  const logger: PlainLogger = {
    flush: async () => {
      const promises = options.transports.map((transport) => transport.flush());
      await Promise.allSettled(promises);
    },
    child: (data: LogData) => {
      return createLogger({
        ...options,
        data: { ...options.data, ...data },
      });
    },
  };

  const proxy = new Proxy(logger, {
    get(target, key) {
      if (key in LEVELS) {
        return (...args: Parameters<LogMethod>) => {
          log(key as keyof typeof LEVELS, ...args);
        };
      }
      return target[key as keyof typeof target];
    },
  });

  return proxy as Logger;
}
