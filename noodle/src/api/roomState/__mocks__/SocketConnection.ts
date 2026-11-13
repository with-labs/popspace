import { EventEmitter } from 'events';

/**
 * A mock implementation of SocketConnection for use in test suites. Will
 * be automatically substituted for SocketConnection when using vi.mock() on
 * the module.
 */
export class SocketConnection {
  private emitter = new EventEmitter();

  send = vi.fn().mockImplementation((msg) => ({ ...msg, id: 'mock-id', initiatorId: 'mock-user-id' }));
  sendAndWaitForResponse = vi.fn().mockResolvedValue({ requestId: 'mock-id' });
  close = vi.fn();
  readyState = WebSocket.OPEN;
  on = vi.fn(this.emitter.on);
  off = vi.fn(this.emitter.off);
  once = vi.fn(this.emitter.once);
  removeAllListeners = vi.fn(this.emitter.removeAllListeners);
  /** use this to manually emit events to simulate socket activity */
  emit = vi.fn(this.emitter.emit);
}
