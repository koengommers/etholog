import { describe, expect, it, vi } from "vitest";

import { createJSONStorage } from "./createJSONStorage";

describe("createJSONStorage", () => {
  it("should return null when the value is null", () => {
    const storage = createJSONStorage(() => ({
      getItem: () => null,
      setItem: () => {},
    }));

    expect(storage.getItem("key")).toBeNull();
  });

  it("should return null when the value is not valid JSON", () => {
    const storage = createJSONStorage(() => ({
      getItem: () => "foo",
      setItem: () => {},
    }));

    expect(storage.getItem("key")).toBeNull();
  });

  it("should return the value when it is valid JSON", () => {
    const storage = createJSONStorage(() => ({
      getItem: () => '{"foo": "bar"}',
      setItem: () => {},
    }));

    expect(storage.getItem("key")).toEqual({ foo: "bar" });
  });

  it("should set the value as a string", () => {
    const mockSetItem = vi.fn();
    const storage = createJSONStorage(() => ({
      getItem: () => null,
      setItem: mockSetItem,
    }));

    storage.setItem("foo", [
      { level: "info", message: "bar", timestamp: 0 },
      { level: "warn", message: "baz", timestamp: 1 },
    ]);

    expect(mockSetItem).toHaveBeenCalledWith(
      "foo",
      '[{"level":"info","message":"bar","timestamp":0},{"level":"warn","message":"baz","timestamp":1}]',
    );
  });
});
