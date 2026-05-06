import { AsyncLocalStorage } from "node:async_hooks";

interface RequestContextState {
  requestId: string;
}

const requestContextStorage = new AsyncLocalStorage<RequestContextState>();

export class RequestContext {
  static run<T>(state: RequestContextState, callback: () => T): T {
    return requestContextStorage.run(state, callback);
  }

  static getRequestId(): string | null {
    return requestContextStorage.getStore()?.requestId ?? null;
  }
}
