type LoaderListener = (loading: boolean) => void;
const listeners = new Set<LoaderListener>();

export class LoaderService {
  private static activeRequests = 0;

  /**
   * Registers a subscriber callback to observe loading state mutations.
   * Replaces RxJS behavior stream subscriptions natively.
   */
  public static subscribe(listener: LoaderListener) {
    listeners.add(listener);
    // Returns a tear-down function to handle useEffect unmounting cleanly
    return () => {
      listeners.delete(listener);
    };
  }

  /**
   * Increments concurrent request registration metrics and activates the loader layer.
   */
  public static show() {
    this.activeRequests++;
    this.notify(true);
  }

  /**
   * Decrements concurrent request registration metrics. Deactivates layout spin states
   * only when all background execution pipelines settle cleanly.
   */
  public static hide() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.activeRequests === 0) {
      this.notify(false);
    }
  }

  /**
   * Broadcaster utility that passes states down to all active UI component listeners.
   */
  private static notify(state: boolean) {
    listeners.forEach((listener) => listener(state));
  }
}