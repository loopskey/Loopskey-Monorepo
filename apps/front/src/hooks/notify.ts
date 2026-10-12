type ToastVariant = "success" | "error" | "warning" | "info";

type ToastRequest = {
  variant: ToastVariant;
  message: string;
  description?: string;
};

const queued: ToastRequest[] = [];
const requestListeners = new Set<() => void>();
const toastListeners = new Set<(request: ToastRequest) => void>();

export const subscribeToToastRequests = (listener: () => void) => {
  requestListeners.add(listener);
  if (queued.length > 0) listener();
  return () => {
    requestListeners.delete(listener);
  };
};

export const subscribeToToasts = (
  listener: (request: ToastRequest) => void,
) => {
  toastListeners.add(listener);
  const inherited = queued.splice(0, queued.length);
  for (const request of inherited) listener(request);
  return () => {
    toastListeners.delete(listener);
  };
};

const publish = (
  variant: ToastVariant,
  message: string,
  description?: string,
) => {
  const request: ToastRequest = { variant, message, description };
  if (toastListeners.size === 0) {
    queued.push(request);
    for (const listener of requestListeners) listener();
    return;
  }
  for (const listener of toastListeners) listener(request);
};

export const notify = {
  success: (message: string, description?: string) =>
    publish("success", message, description),

  error: (message: string, description?: string) =>
    publish("error", message, description),

  warning: (message: string, description?: string) =>
    publish("warning", message, description),

  info: (message: string, description?: string) =>
    publish("info", message, description),
};
