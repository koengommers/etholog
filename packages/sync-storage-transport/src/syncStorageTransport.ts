import { createTransport } from "etholog";

import { SyncStorage } from "./types";

type SyncStorageTransportOptions = {
  storage: SyncStorage;
  key?: string;
  maxLogs?: number;
};

const DEFAULT_KEY = "ETHOLOG_SYNC_STORAGE";

export function syncStorageTransport(options: SyncStorageTransportOptions) {
  const key = options.key || DEFAULT_KEY;
  return createTransport((log) => {
    let logs = options.storage.getItem(key) ?? [];
    if (typeof options.maxLogs !== "undefined") {
      logs = logs.slice(-(options.maxLogs - 1));
    }
    options.storage.setItem(key, [...logs, log]);
  });
}
