import { describe, expect, it } from "vitest";

import { Log } from "../types";
import { serializeErrors } from "./serializeErrors";

function createLog(data?: Log["data"]): Log {
  return { level: "error", message: "failed", timestamp: 0, data };
}

describe("serializeErrors", () => {
  it("should serialize an error at the top level of data", () => {
    const log = createLog({ error: new Error("boom") });

    const processed = serializeErrors()(log);

    expect(processed?.data?.error).toMatchObject({
      name: "Error",
      message: "boom",
    });
  });

  it("should serialize an error one level deep", () => {
    const log = createLog({ context: { error: new Error("boom") } });

    const processed = serializeErrors()(log);

    expect(processed?.data?.context).toMatchObject({
      error: { message: "boom" },
    });
  });

  it("should not walk two levels deep", () => {
    const error = new Error("boom");
    const log = createLog({ a: { b: { error } } });

    const processed = serializeErrors()(log);

    // Documents the depth limit from plan/03 §3.2 — a deliberate stopping
    // point, not an oversight.
    expect((processed?.data?.a as { b: { error: unknown } }).b.error).toBe(
      error,
    );
  });

  it("should serialize errors inside an array", () => {
    const log = createLog({
      errors: [new Error("first"), new Error("second")],
    });

    const processed = serializeErrors()(log);

    expect(processed?.data?.errors).toMatchObject([
      { message: "first" },
      { message: "second" },
    ]);
  });

  it("should serialize errors in an array one level deep", () => {
    const log = createLog({ context: { errors: [new Error("boom")] } });

    const processed = serializeErrors()(log);

    expect(processed?.data?.context).toMatchObject({
      errors: [{ message: "boom" }],
    });
  });

  it("should not mutate the original log or its data", () => {
    const error = new Error("boom");
    const data = { error };
    const log = createLog(data);

    const processed = serializeErrors()(log);

    expect(data.error).toBe(error);
    expect(log.data).toBe(data);
    expect(processed).not.toBe(log);
    expect(processed?.data).not.toBe(data);
  });

  it("should return the same log when there is nothing to serialize", () => {
    const log = createLog({ user: "ada", count: 1 });

    expect(serializeErrors()(log)).toBe(log);
  });

  it("should return the same log when there is no data", () => {
    const log = createLog();

    expect(serializeErrors()(log)).toBe(log);
  });

  it("should leave non-error values alongside errors untouched", () => {
    const nested = { user: "ada" };
    const log = createLog({ error: new Error("boom"), nested });

    const processed = serializeErrors()(log);

    expect(processed?.data?.nested).toBe(nested);
  });

  it("should terminate on circular data", () => {
    const data: Record<string, unknown> = { error: new Error("boom") };
    data.self = data;
    const log = createLog(data);

    expect(() => serializeErrors()(log)).not.toThrow();
  });

  it("should not rebuild class instances", () => {
    const date = new Date();
    const log = createLog({ date, error: new Error("boom") });

    const processed = serializeErrors()(log);

    expect(processed?.data?.date).toBe(date);
  });
});
