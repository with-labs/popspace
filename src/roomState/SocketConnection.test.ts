/**
 * NOTE: these tests are run serially because they interact a lot
 * with timers, which appear to be shared context unfortunately.
 */

import { EventEmitter } from 'events';
import {
  HEARTBEAT_INTERVAL,
  HEARTBEAT_TIMEOUT,
  INITIAL_BACKOFF_DELAY,
  BACKOFF_MULTIPLIER,
  SocketConnection,
  ConnectionFailedError,
} from './SocketConnection';

jest.mock('../utils/logger');

// because JSDOM doesn't seem to expose EventSource to inherit
// from, utilizing EventEmitter to mock its behavior.
class MockEventSource extends EventEmitter {
  addEventListener = this.on;
  removeEventListener = this.off;
  dispatchEvent = (event: Event) => {
    this.emit(event.type, event);
  };
}

class MockWebSocket extends MockEventSource {
  constructor(public url: string) {
    super();
  }

  // you must manually open the socket to better emulate real life behavior
  readyState = WebSocket.CONNECTING;

  send = jest.fn();
  close = jest.fn(() => {
    this.readyState = WebSocket.CLOSING;
  });
}

function createConnection() {
  return new SocketConnection('ws://mock.url', { WebSocket: MockWebSocket as any });
}

function createTestHarness(sc: SocketConnection) {
  const harness = {
    /** Easy access to WebSocket mock instance */
    get socket() {
      return (sc.__socket as any) as MockWebSocket;
    },
    /** Emits an open event on the underlying WebSocket mock */
    open: () => {
      ((sc.__socket as any) as MockWebSocket).readyState = WebSocket.OPEN;
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
      ((sc.__socket as any) as MockWebSocket).readyState = WebSocket.CLOSED;
      sc.__socket.dispatchEvent(new CloseEvent('close'));
    },
    /** Mock fn called when SocketConnection enters reconnecting state */
    onReconnecting: jest.fn(),
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

  sc.on('reconnecting', harness.onReconnecting);
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

  it('connects and begins a heartbeat interval loop', () => {
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

    // wait for next heartbeat loop
    jest.runOnlyPendingTimers();

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
        roomName: 'testRoom',
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

  it('enqueues deadletters until socket is open', () => {
    const sc = createConnection();
    const harness = createTestHarness(sc);

    // notice we don't yet emulate open(). let's queue up a couple events, with retryOnClosed = true
    sc.send(
      {
        kind: 'auth',
        payload: {
          roomName: 'testRoom',
          token: 'token!',
        },
      },
      true
    );

    sc.send(
      {
        kind: 'transformSelf',
        payload: {
          transform: {
            position: { x: 0, y: 0 },
          },
        },
      },
      true
    );

    // and one event with retryOnClosed = false
    sc.send(
      {
        kind: 'updateRoomState',
        payload: {
          displayName: 'foo',
        },
      },
      false
    );

    // the messages haven't been sent yet
    expect(harness.onSent).not.toHaveBeenCalled();

    // now, connect the socket
    harness.open();

    jest.runOnlyPendingTimers();

    expect(harness.onConnected).toHaveBeenCalled();

    // our deadletters were resent, but not the one with retryOnClosed = false.
    expect(harness.onSent).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'auth',
      })
    );
    expect(harness.onSent).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'transformSelf',
      })
    );
    expect(harness.onSent).not.toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'updateRoomState',
      })
    );
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
        expect(harness.onReconnecting).toHaveBeenCalled();
        resolve();
      });
    });

    // store the old socket connection - it's about to be recreated.
    let oldSocket = harness.socket;

    // the reconnect is exponential backoff, so we run the timer to the delay
    jest.advanceTimersByTime(INITIAL_BACKOFF_DELAY);

    // a new socket indicates we've attempted a reconnect
    expect(harness.socket).not.toBe(oldSocket);
    // the old socket was closed
    expect(oldSocket.close).toHaveBeenCalled();

    // emulate a connection failure
    harness.error(new Error('Connection failure'));
    harness.close();

    // wait for another reconnection attempt, updating the old socket reference
    oldSocket = harness.socket;

    jest.advanceTimersByTime(INITIAL_BACKOFF_DELAY * BACKOFF_MULTIPLIER);

    expect(harness.socket).not.toBe(oldSocket);

    // reset the mock we're going to check soon
    harness.onConnected.mockReset();

    // now, emulate reconnection by opening the new socket
    harness.open();

    // the connect event should have fired.
    expect(harness.onConnected).toHaveBeenCalled();

    // just to be sure, let's see if we continue reconnecting with backoff -
    // we should have canceled that loop.
    oldSocket = harness.socket;
    harness.onReconnecting.mockReset();

    jest.advanceTimersByTime(INITIAL_BACKOFF_DELAY * BACKOFF_MULTIPLIER * BACKOFF_MULTIPLIER);

    // no reconnecting event was emitted
    expect(harness.onReconnecting).not.toHaveBeenCalled();
    // our socket connection stays stable
    expect(oldSocket).toBe(harness.socket);
  });

  it('waits for a deadletter to be sent before awaiting response', async () => {
    // this test is for a specific edge case where we call .sendAndWaitForResponse
    // but the socket connection is closed - the message will be placed on the
    // deadletter queue. The goal of this test is to ensure that the message
    // response is awaited once the deadletter is drained, and that the timeout
    // is not triggered while the message is still waiting on the queue.

    const sc = createConnection();
    const harness = createTestHarness(sc);

    // we haven't called harness.open() so the socket is not active yet
    const sendPromise = sc.sendAndWaitForResponse(
      {
        kind: 'auth',
        payload: {
          roomName: 'test',
          token: 'token!',
        },
      },
      1000
    );

    // let's go ahead and attach an error thrower to the rejection of this
    // promise - that will fail the test if it gets rejected for any reason.
    sendPromise.catch((err) => {
      throw err;
    });

    // wait for the 1s we specified as timeout to ensure we don't get a timeout error.
    jest.advanceTimersByTime(1001);

    // good, so no timeout rejection - now let's reconnect the socket and ensure
    // the message is sent and the response is recorded.
    harness.open();

    expect(harness.onSent).toHaveBeenCalledWith(expect.objectContaining({ kind: 'auth' }));

    // wait another second to ensure the timeout was cancelled
    jest.advanceTimersByTime(1001);
  });

  it('eventually times out completely trying to reconnect', async () => {
    const sc = createConnection();
    const harness = createTestHarness(sc);

    // emulate open event
    harness.open();
    let oldSocket = harness.socket;

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
    await new Promise<void>((resolve) => {
      setImmediate(() => {
        expect(oldSocket.close).toHaveBeenCalled();
        resolve();
      });
    });

    // the reconnect is exponential backoff, so we run the timer to the delay
    jest.advanceTimersByTime(INITIAL_BACKOFF_DELAY);
    harness.close();
    // ...and then again, multiplied, and so on up to the reconnect attempt limit.
    // each time we check to be sure the connection refused error has not been thrown
    // too early.
    expect(harness.onError).not.toHaveBeenCalled();
    jest.advanceTimersByTime(INITIAL_BACKOFF_DELAY * BACKOFF_MULTIPLIER);
    harness.close();
    expect(harness.onError).not.toHaveBeenCalled();
    jest.advanceTimersByTime(INITIAL_BACKOFF_DELAY * BACKOFF_MULTIPLIER ** 2);
    harness.close();
    expect(harness.onError).not.toHaveBeenCalled();
    jest.advanceTimersByTime(INITIAL_BACKOFF_DELAY * BACKOFF_MULTIPLIER ** 3);
    harness.close();
    expect(harness.onError).not.toHaveBeenCalled();
    jest.advanceTimersByTime(INITIAL_BACKOFF_DELAY * BACKOFF_MULTIPLIER ** 4);
    harness.close();
    expect(harness.onError).not.toHaveBeenCalled();
    jest.advanceTimersByTime(INITIAL_BACKOFF_DELAY * BACKOFF_MULTIPLIER ** 5);
    harness.close();

    // this is wrapped in a setImmediate because
    // of JS event loop quirks
    await new Promise<void>((resolve) => {
      setImmediate(() => {
        expect(harness.onError).toHaveBeenCalledWith(expect.any(ConnectionFailedError));
        resolve();
      });
    });
  });
});
