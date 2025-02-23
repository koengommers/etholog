# @etholog/async-storage-transport

A transport that logs to an async storage like AsyncStorage for React Native.

## Installation

```bash
npm install @etholog/async-storage-transport
```

## Usage

```typescript
import { createLogger } from "etholog";
import { asyncStorageTransport, createJSONStorage } from "@etholog/async-storage-transport";
import AsyncStorage from "@react-native-async-storage/async-storage";

const logger = createLogger({
  transports: [
    asyncStorageTransport({
      storage: createJSONStorage(() => AsyncStorage),
    }),
  ],
});

logger.info("Hello world!");
```
