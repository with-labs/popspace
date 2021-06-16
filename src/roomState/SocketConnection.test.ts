/**
 * NOTE: these tests are run serially because they interact a lot
 * with timers, which appear to be shared context unfortunately.
 */

import { HEARTBEAT_INTERVAL, HEARTBEAT_TIMEOUT, SocketConnection } from './SocketConnection';
import MockWebSocket from '../__mocks__/reconnecting-websocket';

jest.mock('reconnecting-websocket');
jest.mock('@utils/logger');

function createConnection() {
  return new SocketConnection('ws://mock.url');
}

function createTestHarness(sc: SocketConnection) {
  const harness = {
    /** Easy access to WebSocket mock instance */
    get socket() {
      return sc.__socket as any as MockWebSocket;
    },
    /** Emits an open event on the underlying WebSocket mock */
    open: () => {
      (sc.__socket as any as MockWebSocket).readyState = WebSocket.OPEN;
      sc.__socket.dispatchEvent(new Event('open'));
    },
    /** Emits an error event on the underlying WebSocket mock */
    error: (error: Error) => {
      sc.__socket.dispatchEvent(new ErrorEvent('error', { error }));
    },
    /** Emits a message event on the underlying WebSocket mock */
    message: (message: string) => {
      sc.__socket.dispatchEvent(new MessageEvent('message', { data: message }));
    },
    /** Emits a close event on the underlying WebSocket mock */
    close: () => {
      (sc.__socket as any as MockWebSocket).readyState = WebSocket.CLOSED;
      sc.__socket.dispatchEvent(new CloseEvent('close'));
    },
    /** Mock fn called when SocketConnection encounters an error */
    onError: jest.fn(),
    /** Mock fn called when SocketConnection receives a message */
    onMessage: jest.fn(),
    /** Mock fn called when SocketConnection sends a message */
    onSent: jest.fn(),
    /** Mock fn called when SocketConnection first connects */
    onConnected: jest.fn(),
    /** Mock fn called when SocketConnection enters closed state */
    onClosed: jest.fn(),
  };

  sc.on('closed', harness.onClosed);
  sc.on('error', harness.onError);
  sc.on('message', harness.onMessage);
  sc.on('sent', harness.onSent);
  sc.on('connected', harness.onConnected);

  return harness;
}

describe('SocketConnection', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  it('connects and begins a heartbeat interval loop', async () => {
    const sc = createConnection();
    const harness = createTestHarness(sc);

    // emulate open event
    harness.open();
    // run timers to heartbeat
    jest.runOnlyPendingTimers();

    // heartbeat was sent
    const pingExpectation = expect.objectContaining({
      kind: 'ping',
    });
    expect(harness.onSent).toHaveBeenCalledWith(pingExpectation);
    expect(harness.socket.send).toHaveBeenCalled();

    // extract actual ping message sent so we can use the id
    const pingMessage = harness.onSent.mock.calls[0][0];

    // no error was reported
    expect(harness.onError).not.toHaveBeenCalled();

    // reset mock
    harness.onSent.mockReset();
    harness.socket.send.mockReset();

    // respond to heartbeat
    harness.message(JSON.stringify({ type: 'ping.response', requestId: pingMessage.id }));

    // wait for next heartbeat loop - awaiting a promise + immediate
    // is necessary here because of JS event loop quirks
    await new Promise<void>((resolve) => setImmediate(resolve));
    jest.runAllTimers();

    // still no errors
    expect(harness.onError).not.toHaveBeenCalled();

    // another ping was sent
    expect(harness.onSent).toHaveBeenCalledWith(pingExpectation);
    expect(harness.socket.send).toHaveBeenCalledTimes(1);
  });

  it('sends messages to an open connection', () => {
    const sc = createConnection();
    const harness = createTestHarness(sc);

    harness.open();

    sc.send({
      kind: 'auth',
      payload: {
        roomRoute: 'testRoom',
        token: 'token!',
      },
    });

    // message was reported as sent
    expect(harness.onSent).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'auth',
      })
    );

    // send was called on the socket
    expect(harness.socket.send).toHaveBeenCalledTimes(1);
  });

  it('detects disconnection when there is no heartbeat response', async () => {
    const sc = createConnection();
    const harness = createTestHarness(sc);

    // emulate open event
    harness.open();
    // run timers to heartbeat
    jest.advanceTimersByTime(HEARTBEAT_INTERVAL + 1);
    const pingExpectation = expect.objectContaining({
      kind: 'ping',
    });
    expect(harness.onSent).toHaveBeenCalledWith(pingExpectation);
    // when the heartbeat is issued, it sets a timeout which signifies
    // the response wait time - if the timeout is fired, the connection should
    // enter reconnecting mode. So, run timers!
    jest.advanceTimersByTime(HEARTBEAT_TIMEOUT);

    // once we've triggered the heartbeat timeout, the connection should move
    // to reconnecting state - this is wrapped in a setImmediate because
    // of JS event loop quirks
    await new Promise<void>((resolve) => {
      setImmediate(() => {
        expect(harness.socket.reconnect).toHaveBeenCalled();
        resolve();
      });
    });
  });

  it("can close manually and doesn't reconnect", async () => {
    const sc = createConnection();
    const harness = createTestHarness(sc);

    // emulate open event
    harness.open();
    // run timers to heartbeat
    jest.runOnlyPendingTimers();

    // heartbeat was sent
    const pingExpectation = expect.objectContaining({
      kind: 'ping',
    });
    expect(harness.onSent).toHaveBeenCalledWith(pingExpectation);
    expect(harness.socket.send).toHaveBeenCalled();

    sc.close();

    jest.runAllTimers();

    expect(harness.socket.reconnect).not.toHaveBeenCalled();
    expect(harness.onClosed).toHaveBeenCalled();
  });
});
