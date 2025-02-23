import { SyncStorage } from "./types";

export type SyncStringStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export function createJSONStorage(
  getStringStorage: () => SyncStringStorage,
): SyncStorage {
  return {
    getItem: (key) => {
      const value = getStringStorage().getItem(key);
      if (value === null) {
        return null;
      }
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    },
    setItem: (key, value) => {
      getStringStorage().setItem(key, JSON.stringify(value));
    },
  };
}
