// Minimal service worker: keeps the MV3 extension valid.
interface WorkerScope {
  addEventListener(
    type: string,
    listener: (event: { waitUntil(promise: Promise<unknown>): void }) => void,
  ): void;
  skipWaiting(): Promise<void>;
  clients: { claim(): Promise<void> };
}

const scope = globalThis as unknown as WorkerScope;

scope.addEventListener('install', () => {
  void scope.skipWaiting();
});

scope.addEventListener('activate', (event) => {
  event.waitUntil(scope.clients.claim());
});
