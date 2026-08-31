# Etholog

A simple logging library designed to be compatible with various JavaScript runtimes, such as Node.js, React Native and the browser.

Etholog is named after ethology, the study of animal behavior under natural conditions.

## Installation

```bash
npm install etholog
```

## Basic usage

Etholog works with "transports", these can be seen as destinations for the logs. It requires one transport at the minimum. You can use one of the built-in transports or create your own.

```typescript
import { createLogger } from "etholog";

const logger = createLogger({
  transports: [
    consoleTransport(),
  ],
});

logger.info("Hello world!");
```

## Levels

Etholog supports the following log levels:

- `error`
- `warn`
- `info`
- `debug`

## Processors

Processors transform a log before any transport sees it. A processor takes a log and returns a log, or `null` to drop it. They run in order, after the level filter.

```typescript
import { createLogger } from "etholog";

const logger = createLogger({
  processors: [
    (log) => ({
      ...log,
      data: { ...log.data, time: new Date(log.timestamp).toISOString() },
    }),
  ],
  transports: [consoleTransport()],
});
```

Return a new log rather than modifying the one you were given.

### Serializing errors

`JSON.stringify(new Error("boom"))` returns `{}`, so an error in a log's data reaches JSON transports empty. The `serializeErrors()` processor converts errors into `{ name, message, stack }`, following `cause` chains and copying custom properties such as `code`. Recommended if any of your transports serialize to JSON.

```typescript
import { createLogger, serializeErrors } from "etholog";

const logger = createLogger({
  processors: [serializeErrors()],
  transports: [syncStorageTransport({ storage })],
});

logger.error("Request failed", { error: new Error("Timeout") });
// data.error is { name: "Error", message: "Timeout", stack: "..." }
```

It serializes errors under any key, walking `data` one level deep: `data.error` and `data.context.error` are serialized, `data.a.b.error` is not.

## Transports

Etholog comes with one built-in transport, the `consoleTransport`. There are various additional transports available as separate packages.

| Package | Description |
| --- | --- |
| [`@etholog/sentry-react-native-transport`](packages/sentry-react-native-transport) | Send logs to Sentry for React Native |
| [`@etholog/async-storage-transport`](packages/async-storage-transport) | Stores logs in asynchronous storage, such as AsyncStorage for React Native |
| [`@etholog/sync-storage-transport`](packages/sync-storage-transport) | Stores logs in synchronous storage, such as localStorage |

### Creating a custom transport

You can create your own transport by using the `createTransport` function.

```typescript
import { createTransport } from "etholog";

const customTransport = createTransport((log) => {
  // Do something with the log
});

const logger = createLogger({
  transports: [customTransport],
});
```
