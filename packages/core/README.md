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

### Console

The `consoleTransport` function creates a transport that outputs logs to the console.

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
