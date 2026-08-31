import { LEVELS } from "./constants";
import { Level, LogData, Processor, Transport } from "./types";

type LoggerOptions = {
  level?: Level;
  data?: LogData;
  processors?: Processor[];
  transports: [Transport, ...Transport[]];
};

/**
 * Wraps a processor so that throwing is contained: the log passes through
 * unchanged and the failure is warned about once, rather than every log.
 */
function guard(processor: Processor): Processor {
  let warned = false;
  return (log) => {
    try {
      return processor(log);
    } catch (error) {
      if (!warned) {
        warned = true;
        console.warn("Failed to process log", error);
      }
      return log;
    }
  };
}

/**
 * Chains processors into a single function, running them in order and
 * short-circuiting as soon as one drops the log.
 */
function chain(processors: Processor[]): Processor {
  return processors.reduce<Processor>(
    (run, processor) => (log) => {
      const processed = run(log);
      return processed === null ? null : processor(processed);
    },
    (log) => log,
  );
}

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
  const runProcessors = chain((options.processors ?? []).map(guard));

  function log(level: Level, message: string, data?: LogData) {
    if (options.level && LEVELS[level] < LEVELS[options.level]) {
      return;
    }

    const combinedData = {
      ...options.data,
      ...data,
    };

    const log = runProcessors({
      level,
      message,
      timestamp: Date.now(),
      data: Object.keys(combinedData).length > 0 ? combinedData : undefined,
    });

    if (log === null) {
      return;
    }

    options.transports.forEach((transport) => {
      try {
        transport.process(log);
      } catch (error) {
        console.warn("Failed to transport log", error);
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
