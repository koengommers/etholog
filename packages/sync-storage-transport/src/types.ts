import { Log } from "etholog";

export type SyncStorage = {
  getItem: (key: string) => Array<Log> | null;
  setItem: (key: string, value: Array<Log>) => void;
};
