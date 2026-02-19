# @etholog/sentry-react-native-transport

Send logs to Sentry for React Native.

## Installation

```bash
npm install @etholog/sentry-react-native-transport
```

Make sure Sentry is set up with logs enabled: https://docs.sentry.io/platforms/react-native/logs/

## Example usage

```typescript
import { createLogger } from "etholog";
import { sentryReactNativeTransport } from "@etholog/sentry-react-native-transport";

const logger = createLogger({
  transports: [
    sentryReactNativeTransport(),
  ],
});

logger.info("Hello world!");
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `levelMap` | `Record<Level, Sentry.SeverityLevel>` | `{ error: "error", warn: "warning", info: "info", debug: "debug" }` | Maps Etholog levels to Sentry levels.
