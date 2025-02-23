# @etholog/sync-storage-transport

A transport that logs to a sync storage like localStorage.

## Installation

```bash
npm install @etholog/sync-storage-transport
```

## Usage

```typescript
import { createLogger } from "etholog";
import { syncStorageTransport, createJSONStorage } from "@etholog/sync-storage-transport";

const logger = createLogger({
  transports: [
    syncStorageTransport({
      storage: createJSONStorage(() => localStorage),
    }),
  ],
});

logger.info("Hello world!");
```
