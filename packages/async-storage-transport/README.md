# @etholog/async-storage-transport

A transport that stores logs in asynchronous storage like AsyncStorage for React Native.

## Installation

```bash
npm install @etholog/async-storage-transport
```

## Example usage

```typescript
import { createLogger } from "etholog";
import { asyncStorageTransport, createJSONStorage } from "@etholog/async-storage-transport";
import AsyncStorage from "@react-native-async-storage/async-storage";

const logger = createLogger({
  transports: [
    asyncStorageTransport({
      storage: createJSONStorage(() => AsyncStorage),
      maxLogs: 1000,
    }),
  ],
});

logger.info("Hello world!");
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `storage` | `AsyncStorage` | N/A | The storage to use. Required. |
| `key` | `string` | `"ETHOLOG_STORAGE"` | The key to use for the storage. |
| `maxLogs` | `number` | `undefined` | If set, it will limit the number of logs stored. Once the limit is reached, the oldest log will be removed. |
