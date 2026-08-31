export type SerializedError = {
  name: string;
  message: string;
  stack?: string;
  cause?: unknown;
  errors?: unknown[];
  [key: string]: unknown;
};

/**
 * Errors that cross a realm boundary (the React Native bridge, an iframe, a
 * worker) fail `instanceof`, so fall back to the internal class check.
 */
export function isError(value: unknown): value is Error {
  return (
    value instanceof Error ||
    Object.prototype.toString.call(value) === "[object Error]"
  );
}

const MAX_DEPTH = 8;

const OWN_KEYS_TO_SKIP = ["name", "message", "stack", "cause", "errors"];

function serialize(
  error: Error,
  seen: WeakSet<object>,
  depth: number,
): SerializedError {
  seen.add(error);

  const serialized: SerializedError = {
    name: error.name,
    message: error.message,
  };

  if (typeof error.stack === "string") {
    serialized.stack = error.stack;
  }

  // Custom properties such as `code` on Node errno errors. `cause` and
  // `errors` are non-enumerable when set by the constructor, but become own
  // enumerable keys when assigned by hand — they are handled below either way.
  for (const key of Object.keys(error)) {
    if (OWN_KEYS_TO_SKIP.includes(key)) {
      continue;
    }
    serialized[key] = (error as unknown as Record<string, unknown>)[key];
  }

  const { cause, errors } = error as { cause?: unknown; errors?: unknown };

  if (cause !== undefined) {
    serialized.cause = serializeValue(cause, seen, depth + 1);
  }

  // AggregateError, duck-typed so this stays safe on older runtimes.
  if (Array.isArray(errors)) {
    serialized.errors = errors.map((nested) =>
      serializeValue(nested, seen, depth + 1),
    );
  }

  return serialized;
}

function serializeValue(
  value: unknown,
  seen: WeakSet<object>,
  depth: number,
): unknown {
  if (!isError(value)) {
    return value;
  }
  if (seen.has(value)) {
    return "[Circular]";
  }
  if (depth > MAX_DEPTH) {
    return "[Max depth exceeded]";
  }
  return serialize(value, seen, depth);
}

/**
 * Converts an error into a plain object that survives `JSON.stringify`, which
 * otherwise renders an `Error` as `{}`. Follows `cause` chains and
 * `AggregateError.errors`, and copies own enumerable properties. Values that
 * are not errors are returned unchanged.
 */
export function serializeError(error: Error): SerializedError;
export function serializeError(value: unknown): unknown;
export function serializeError(value: unknown): unknown {
  return serializeValue(value, new WeakSet(), 0);
}
