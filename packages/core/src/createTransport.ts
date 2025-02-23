import { Log } from "./types";

export function createTransport(
  process: (log: Log) => void,
  options?: { flush?: () => Promise<void> },
) {
  return {
    process,
    flush: options?.flush ?? (() => Promise.resolve()),
  };
}
