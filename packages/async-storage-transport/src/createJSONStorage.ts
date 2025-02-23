import { AsyncStorage } from "./types";

export type AsyncStringStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

export function createJSONStorage(
  getStringStorage: () => AsyncStringStorage,
): AsyncStorage {
  return {
    getItem: async (key) => {
      const value = await getStringStorage().getItem(key);
      if (value === null) {
        return null;
      }
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    },
    setItem: async (key, value) => {
      await getStringStorage().setItem(key, JSON.stringify(value));
    },
  };
}
