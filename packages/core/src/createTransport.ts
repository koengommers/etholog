import { Log } from "./types";

export function createTransport<TAdditional extends Record<string, unknown>>(
  process: (log: Log) => void,
  additional?: TAdditional & {
    flush?: () => Promise<void>;
  },
): { process: (log: Log) => void } & TAdditional {
  const base = {
    process,
  };

  return Object.assign(base, additional);
}
