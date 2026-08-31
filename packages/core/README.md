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

Processors transform a log before any transport sees it. A processor is a function that takes a log and returns a log, or `null` to drop it. They run in order, after the level filter and before the transports.

```typescript
import { createLogger } from "etholog";

const logger = createLogger({
  processors: [
    (log) => ({ ...log, data: { ...log.data, appVersion: "1.2.3" } }),
  ],
  transports: [consoleTransport()],
});
```

Processors should treat the log as immutable and return a new object rather than modifying the one they were given. A processor that throws does not crash your app: the log passes through unchanged and the failure is warned about once.

### Serializing errors

`JSON.stringify(new Error("boom"))` returns `{}`, so an error put in a log's data reaches storage and other JSON transports empty. The `serializeErrors()` processor converts errors into `{ name, message, stack }` instead — following `cause` chains and `AggregateError.errors`, and copying custom properties such as `code`.

**If any of your transports serialize logs to JSON, you probably want it:**

```typescript
import { createLogger, serializeErrors } from "etholog";

const logger = createLogger({
  processors: [serializeErrors()],
  transports: [syncStorageTransport({ storage })],
});

logger.error("Request failed", { error: new Error("Timeout") });
// data.error is { name: "Error", message: "Timeout", stack: "..." }
```

It walks `data` one level deep, so `data.error` and `data.context.error` are both serialized but `data.a.b.error` is not.

Put it last in the array. Processors before it still see real `Error` objects and can use `instanceof`; processors after it see plain objects.

The `serializeError` function is also exported on its own if you want to serialize an error outside of a log.

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
