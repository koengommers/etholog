import { describe, expect, it } from "vitest";

import { SerializedError, isError, serializeError } from "./serializeError";

describe("serializeError", () => {
  it("should serialize an error to a plain object", () => {
    const error = new Error("boom");

    const serialized = serializeError(error);

    expect(serialized).toMatchObject({
      name: "Error",
      message: "boom",
      stack: expect.any(String),
    });
  });

  it("should survive JSON.stringify, unlike a bare error", () => {
    expect(JSON.stringify({ error: new Error("boom") })).toBe('{"error":{}}');

    const parsed = JSON.parse(
      JSON.stringify({ error: serializeError(new Error("boom")) }),
    );

    expect(parsed.error.name).toBe("Error");
    expect(parsed.error.message).toBe("boom");
    expect(parsed.error.stack).toEqual(expect.any(String));
  });

  it("should keep the subclass name", () => {
    class RequestError extends Error {
      override name = "RequestError";
    }

    expect(serializeError(new RequestError("nope"))).toMatchObject({
      name: "RequestError",
      message: "nope",
    });
  });

  it("should copy own enumerable properties", () => {
    const error = Object.assign(new Error("failed"), {
      code: "ENOENT",
      status: 404,
    });

    expect(serializeError(error)).toMatchObject({
      message: "failed",
      code: "ENOENT",
      status: 404,
    });
  });

  it("should follow a cause chain", () => {
    const error = new Error("outer", { cause: new Error("inner") });

    const serialized = serializeError(error);

    expect(serialized).toMatchObject({
      message: "outer",
      cause: { name: "Error", message: "inner" },
    });
  });

  it("should serialize a cause assigned by hand", () => {
    const error = new Error("outer");
    error.cause = new Error("inner");

    expect(serializeError(error)).toMatchObject({
      message: "outer",
      cause: { message: "inner" },
    });
  });

  it("should keep a non-error cause as-is", () => {
    const error = new Error("outer", { cause: "just a string" });

    expect(serializeError(error)).toMatchObject({
      message: "outer",
      cause: "just a string",
    });
  });

  it("should terminate on a circular cause", () => {
    const a = new Error("a");
    const b = new Error("b", { cause: a });
    a.cause = b;

    const serialized = serializeError(a) as SerializedError;

    expect(serialized.message).toBe("a");
    expect(serialized.cause).toMatchObject({
      message: "b",
      cause: "[Circular]",
    });
  });

  it("should terminate on a self-referencing cause", () => {
    const error = new Error("loop");
    error.cause = error;

    expect(serializeError(error)).toMatchObject({
      message: "loop",
      cause: "[Circular]",
    });
  });

  it("should serialize AggregateError.errors", () => {
    const error = new AggregateError(
      [new Error("first"), new Error("second")],
      "all failed",
    );

    const serialized = serializeError(error) as SerializedError;

    expect(serialized.message).toBe("all failed");
    expect(serialized.errors).toMatchObject([
      { message: "first" },
      { message: "second" },
    ]);
  });

  it("should stop at a depth limit rather than recursing forever", () => {
    let error = new Error("deepest");
    for (let i = 0; i < 20; i++) {
      error = new Error(`level-${i}`, { cause: error });
    }

    // Deep but finite, and JSON-safe at every level.
    expect(() => JSON.stringify(serializeError(error))).not.toThrow();
    expect(JSON.stringify(serializeError(error))).toContain(
      "[Max depth exceeded]",
    );
  });

  it("should keep a Hermes-style stack verbatim", () => {
    const hermesStack =
      "Error: boom\n    at anonymous (address at index.android.bundle:1:12345)";
    const error = new Error("boom");
    error.stack = hermesStack;

    expect(serializeError(error)).toMatchObject({ stack: hermesStack });
  });

  it("should omit stack when the runtime provides none", () => {
    const error = new Error("boom");
    delete error.stack;

    expect(serializeError(error)).not.toHaveProperty("stack");
  });

  it("should return non-error values unchanged", () => {
    expect(serializeError("boom")).toBe("boom");
    expect(serializeError(42)).toBe(42);
    expect(serializeError(null)).toBe(null);
    expect(serializeError(undefined)).toBe(undefined);

    const plain = { message: "not an error" };
    expect(serializeError(plain)).toBe(plain);
  });

  it("should serialize a cross-realm error that fails instanceof", () => {
    // Errors crossing the React Native bridge or an iframe boundary look like
    // this: right internal class, wrong prototype chain.
    const crossRealm = {
      name: "TypeError",
      message: "from another realm",
      stack: "TypeError: from another realm",
    };
    Object.defineProperty(crossRealm, Symbol.toStringTag, { value: "Error" });

    expect(crossRealm instanceof Error).toBe(false);
    expect(isError(crossRealm)).toBe(true);
    expect(serializeError(crossRealm)).toMatchObject({
      name: "TypeError",
      message: "from another realm",
    });
  });
});
