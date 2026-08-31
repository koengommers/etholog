import { describe, expect, it } from "vitest";

import { Log } from "../types";
import { serializeErrors } from "./serializeErrors";

function createLog(data?: Log["data"]): Log {
  return { level: "error", message: "failed", timestamp: 0, data };
}

describe("serializeErrors", () => {
  it("should serialize an error at the top level of data", () => {
    const log = createLog({ cause: new Error("boom") });

    const processed = serializeErrors()(log);

    expect(processed?.data?.cause).toMatchObject({
      name: "Error",
      message: "boom",
    });
  });

  it("should serialize errors under any key", () => {
    const log = createLog({
      reason: new Error("first"),
      uploadFailure: new Error("second"),
      "": new Error("third"),
    });

    const processed = serializeErrors()(log);

    expect(processed?.data).toMatchObject({
      reason: { message: "first" },
      uploadFailure: { message: "second" },
      "": { message: "third" },
    });
  });

  it("should serialize an error one level deep", () => {
    const log = createLog({ request: { thrown: new Error("boom") } });

    const processed = serializeErrors()(log);

    expect(processed?.data?.request).toMatchObject({
      thrown: { message: "boom" },
    });
  });

  it("should not walk two levels deep", () => {
    const error = new Error("boom");
    const log = createLog({ a: { b: { c: error } } });

    const processed = serializeErrors()(log);

    // The depth limit is a deliberate stopping point, not an oversight.
    expect((processed?.data?.a as { b: { c: unknown } }).b.c).toBe(error);
  });

  it("should serialize errors inside an array", () => {
    const log = createLog({
      attempts: [new Error("first"), new Error("second")],
    });

    const processed = serializeErrors()(log);

    expect(processed?.data?.attempts).toMatchObject([
      { message: "first" },
      { message: "second" },
    ]);
  });

  it("should serialize errors in an array one level deep", () => {
    const log = createLog({ batch: { rejected: [new Error("boom")] } });

    const processed = serializeErrors()(log);

    expect(processed?.data?.batch).toMatchObject({
      rejected: [{ message: "boom" }],
    });
  });

  it("should not mutate the original log or its data", () => {
    const failure = new Error("boom");
    const data = { failure };
    const log = createLog(data);

    const processed = serializeErrors()(log);

    expect(data.failure).toBe(failure);
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

  it("should not serialize a plain object that merely looks like an error", () => {
    const notAnError = { name: "Error", message: "boom" };
    const log = createLog({ error: notAnError });

    expect(serializeErrors()(log)?.data?.error).toBe(notAnError);
  });

  it("should leave non-error values alongside errors untouched", () => {
    const nested = { user: "ada" };
    const log = createLog({ problem: new Error("boom"), nested });

    const processed = serializeErrors()(log);

    expect(processed?.data?.nested).toBe(nested);
  });

  it("should terminate on circular data", () => {
    const data: Record<string, unknown> = { problem: new Error("boom") };
    data.self = data;
    const log = createLog(data);

    expect(() => serializeErrors()(log)).not.toThrow();
  });

  it("should not rebuild class instances", () => {
    const date = new Date();
    const log = createLog({ date, problem: new Error("boom") });

    const processed = serializeErrors()(log);

    expect(processed?.data?.date).toBe(date);
  });
});
