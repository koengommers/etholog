import { describe, expect, it, vi } from "vitest";

import { createJSONStorage } from "./createJSONStorage";

describe("createJSONStorage", () => {
  it("should return null when the value is null", async () => {
    const storage = createJSONStorage(() => ({
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
    }));

    expect(await storage.getItem("key")).toBeNull();
  });

  it("should return null when the value is not valid JSON", async () => {
    const storage = createJSONStorage(() => ({
      getItem: () => Promise.resolve("foo"),
      setItem: () => Promise.resolve(),
    }));

    expect(await storage.getItem("key")).toBeNull();
  });

  it("should return the value when it is valid JSON", async () => {
    const storage = createJSONStorage(() => ({
      getItem: () => Promise.resolve('{"foo": "bar"}'),
      setItem: () => Promise.resolve(),
    }));

    expect(await storage.getItem("key")).toEqual({ foo: "bar" });
  });

  it("should set the value as a string", async () => {
    const mockSetItem = vi.fn();
    const storage = createJSONStorage(() => ({
      getItem: () => Promise.resolve(null),
      setItem: mockSetItem,
    }));

    await storage.setItem("foo", [
      { level: "info", message: "bar", timestamp: 0 },
      { level: "warn", message: "baz", timestamp: 1 },
    ]);

    expect(mockSetItem).toHaveBeenCalledWith(
      "foo",
      '[{"level":"info","message":"bar","timestamp":0},{"level":"warn","message":"baz","timestamp":1}]',
    );
  });
});
