import { EventEmitter } from 'events';

/**
 * A simple signal emitter class, objects subscribe
 * to the signal and any code can call notify() to
 * trigger all subscriptions.
 */
class RerasterizeSignal {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(Infinity);
  }

  /**
   * Subscribe to rerasterize signal notifications. Presumably the
   * subscribing object should trigger rerasterization. Use the
   * returned function to unsubscribe.
   */
  subscribe = (signalHandler: () => void) => {
    this.eventEmitter.on('rerasterize', signalHandler);
    return () => void this.eventEmitter.off('rerasterize', signalHandler);
  };

  notify = () => this.eventEmitter.emit('rerasterize');
}

// a shared global signal emitter makes things simple, just
// import it and call .notify() to trigger rerasterization of
// any relevant items when we need to.
export const rerasterizeSignal = new RerasterizeSignal();
