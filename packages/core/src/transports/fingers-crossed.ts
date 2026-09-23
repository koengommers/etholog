import { LEVELS } from "../constants";
import { createTransport } from "../createTransport";
import { Level, Log, Transport } from "../types";

type FingersCrossedTransportOptions = {
  /**
   * The underlying transport that will receive logs
   * once the fingers-crossed transport is activated.
   */
  transport: Transport;

  /**
   * The minimum log level to activate the transport.
   *
   * @default "warn"
   */
  actionLevel?: Level;

  /**
   * Maximum number of log entries to keep in memory before triggering.
   *
   * If the buffer exceeds this size, the oldest log entries are dropped.
   *
   * If not provided, the buffer grows without limit until triggered.
   */
  bufferSize?: number;
};

/**
 * Creates a "fingers crossed" transport.
 *
 * This transport buffers log messages until a log at or above the specified
 * `actionLevel` is encountered. Once activated:
 *
 * - All buffered logs are flushed to the underlying transport.
 * - Buffering is disabled, subsequent logs are passed through.
 *
 * This is useful for scenarios where you only want detailed logs
 * if something goes wrong (e.g., errors or warnings).
 *
 * @example
 * ```ts
 * const transport = fingersCrossedTransport({
 *   transport: consoleTransport,
 *   actionLevel: "error",
 *   bufferSize: 50,
 * });
 * ```
 */
export function fingersCrossedTransport({
  transport,
  actionLevel = "warn",
  bufferSize,
}: FingersCrossedTransportOptions) {
  let buffer: Log[] = [];
  let isBuffering = true;

  function activate() {
    isBuffering = false;
    buffer.forEach((log) => transport.process(log));
    buffer = [];
  }

  return createTransport(
    (log) => {
      if (!isBuffering) {
        transport.process(log);
        return;
      }

      buffer.push(log);
      if (typeof bufferSize === "number" && buffer.length > bufferSize) {
        buffer.shift();
      }

      if (LEVELS[log.level] >= LEVELS[actionLevel]) {
        activate();
      }
    },
    {
      /**
       * Manually activates the transport.
       *
       * Flushes all buffered logs to the underlying transport and disables further buffering.
       */
      activate,
    },
  );
}
