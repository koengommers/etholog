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

## Transports

Etholog comes with several transports built into the core, and additional transports are available as separate packages.

### Built-in transports

| Transport | Description |
| --- | --- |
| [`consoleTransport`](packages/core/src/transports/console.ts) | Outputs logs to the console |
| [`fingersCrossedTransport`](packages/core/src/transports/fingers-crossed.ts) | Buffers logs until a log at or above the specified `actionLevel` is encountered. |

### Additional transports

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
