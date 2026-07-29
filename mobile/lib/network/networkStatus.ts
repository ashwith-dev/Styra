type Listener = (isOnline: boolean) => void;
const listeners = new Set<Listener>();

let isOnlineState = true;

/**
 * Updates global network status and notifies subscribers.
 */
export function setNetworkOnlineStatus(online: boolean): void {
  if (online !== isOnlineState) {
    isOnlineState = online;
    listeners.forEach((listener) => listener(online));
  }
}

export function isOnline(): boolean {
  return isOnlineState;
}

export function subscribeNetworkStatus(listener: Listener): () => void {
  listeners.add(listener);
  listener(isOnlineState);
  return () => {
    listeners.delete(listener);
  };
}
