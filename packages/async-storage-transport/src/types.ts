import { Log } from "etholog";

export type AsyncStorage = {
  getItem: (key: string) => Promise<Array<Log> | null>;
  setItem: (key: string, value: Array<Log>) => Promise<void>;
};
