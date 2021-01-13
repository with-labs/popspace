import { EventEmitter } from 'events';

/**
 * A mock implementation of SocketConnection for use in test suites. Will
 * be automatically substituted for SocketConnection when using jest.mock() on
 * the module.
 */
export class SocketConnection {
  private emitter = new EventEmitter();

  send = jest.fn().mockImplementation((msg) => ({ ...msg, id: 'mock-id', initiatorId: 'mock-user-id' }));
  sendAndWaitForResponse = jest.fn().mockResolvedValue({ requestId: 'mock-id' });
  close = jest.fn();
  readyState = WebSocket.OPEN;
  on = jest.fn(this.emitter.on);
  off = jest.fn(this.emitter.off);
  once = jest.fn(this.emitter.once);
  removeAllListeners = jest.fn(this.emitter.removeAllListeners);
  /** use this to manually emit events to simulate socket activity */
  emit = jest.fn(this.emitter.emit);
}
