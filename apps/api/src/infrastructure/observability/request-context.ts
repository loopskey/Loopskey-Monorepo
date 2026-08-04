import { AsyncLocalStorage } from "async_hooks";

type RequestContext = { correlationId: string };
const storage = new AsyncLocalStorage<RequestContext>();

export const requestContext = {
  run<T>(correlationId: string, callback: () => T) {
    return storage.run({ correlationId }, callback);
  },
  correlationId() {
    return storage.getStore()?.correlationId;
  },
};
