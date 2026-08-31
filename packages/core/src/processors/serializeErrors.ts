import { isError, serializeError } from "../serializeError";
import { LogData, Processor } from "../types";

/** Objects the walk is willing to rebuild — not Dates, Maps or class instances. */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * Serializes errors in `value`, descending `depth` levels into plain objects.
 * Arrays are transparent — they do not count as a level — so `ctx.errors[0]`
 * is reached at the same depth as `ctx.error`. Returns `value` itself when
 * nothing changed, to keep the common path allocation-light.
 */
function walk(value: unknown, depth: number, seen: WeakSet<object>): unknown {
  if (isError(value)) {
    return serializeError(value);
  }

  if (Array.isArray(value)) {
    if (seen.has(value)) {
      return value;
    }
    seen.add(value);
    let changed = false;
    const next = value.map((item) => {
      const processed = walk(item, depth, seen);
      changed ||= processed !== item;
      return processed;
    });
    return changed ? next : value;
  }

  if (depth > 0 && isPlainObject(value)) {
    if (seen.has(value)) {
      return value;
    }
    seen.add(value);
    let changed = false;
    const next: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      const processed = walk(nested, depth - 1, seen);
      changed ||= processed !== nested;
      next[key] = processed;
    }
    return changed ? next : value;
  }

  return value;
}

/**
 * Processor that converts `Error` instances in a log's `data` into plain
 * objects, so JSON transports store them as `{ name, message, stack }` instead
 * of `{}`. Recommended for any logger with a JSON-backed transport.
 *
 * Walks `data` one level deep: `data.error` and `data.context.error` are
 * serialized, `data.a.b.error` is not.
 *
 * Place it last so earlier processors still see live `Error` objects.
 */
export function serializeErrors(): Processor {
  return (log) => {
    if (!log.data) {
      return log;
    }

    const seen = new WeakSet<object>();
    let changed = false;
    const data: LogData = {};

    for (const [key, value] of Object.entries(log.data)) {
      const processed = walk(value, 1, seen);
      changed ||= processed !== value;
      data[key] = processed;
    }

    return changed ? { ...log, data } : log;
  };
}
