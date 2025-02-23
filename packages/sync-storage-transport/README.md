# @etholog/sync-storage-transport

A transport that stores logs in synchronous storage like localStorage.

## Installation

```bash
npm install @etholog/sync-storage-transport
```

## Example usage

```typescript
import { createLogger } from "etholog";
import { syncStorageTransport, createJSONStorage } from "@etholog/sync-storage-transport";

const logger = createLogger({
  transports: [
    syncStorageTransport({
      storage: createJSONStorage(() => localStorage),
      maxLogs: 1000,
    }),
  ],
});

logger.info("Hello world!");
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `storage` | `SyncStorage` | N/A | The storage to use. Required. |
| `key` | `string` | `"ETHOLOG_STORAGE"` | The key to use for the storage. |
| `maxLogs` | `number` | `undefined` | If set, it will limit the number of logs stored. Once the limit is reached, the oldest log will be removed. |
