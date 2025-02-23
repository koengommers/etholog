import { createTransport } from "etholog";

import { AsyncStorage } from "./types";

type AsyncStorageTransportOptions = {
  storage: AsyncStorage;
  key?: string;
  maxLogs?: number;
};

const DEFAULT_KEY = "ETHOLOG_STORAGE";

export function asyncStorageTransport(options: AsyncStorageTransportOptions) {
  let promise: Promise<void> | null = null;
  const key = options.key || DEFAULT_KEY;

  return createTransport(
    (log) => {
      async function storeLog() {
        let logs = (await options.storage.getItem(key)) ?? [];
        if (typeof options.maxLogs !== "undefined") {
          logs = logs.slice(-(options.maxLogs - 1));
        }
        await options.storage.setItem(key, [...logs, log]);
      }

      if (promise === null) {
        promise = storeLog();
      } else {
        promise = promise.then(storeLog);
      }
    },
    {
      flush: () => promise ?? Promise.resolve(),
    },
  );
}
