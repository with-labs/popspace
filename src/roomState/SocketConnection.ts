import { logger } from '../utils/logger';
import { EventEmitter } from 'events';
import { v4 } from 'uuid';
import { IncomingSocketMessage, IncomingErrorMessage, OutgoingSocketMessage } from './types/socketProtocol';
import camelcase from 'camelcase-keys';
import ReconnectingWebsocket, { ErrorEvent, CloseEvent } from 'reconnecting-websocket';

export class MessageTimeoutError extends Error {
  constructor() {
    super('Timed out awaiting message response');
  }
}

export class ConnectionFailedError extends Error {
  constructor() {
    super('Failed to establish socket connection');
  }
}

// each time we reconnect, multiply delay by this constant
export const BACKOFF_MULTIPLIER = 3;
// computed maximum delay time before we stop retrying
export const MAX_BACKOFF_DELAY = 30 * 1000;
// interval in ms for ping heartbeat
export const HEARTBEAT_INTERVAL = 15 * 1000;
// number of ms to wait for a heartbeat response before
// we consider the connection lost
export const HEARTBEAT_TIMEOUT = 5000;

// full typing for the event emitter
export interface SocketConnectionEvents {
  error: (error: Error) => void;
  connected: () => void;
  closed: () => void;
  message: (msg: IncomingSocketMessage) => void;
  sent: (msg: OutgoingSocketMessage & { id: string }) => void;
}

export declare interface SocketConnection {
  on<U extends keyof SocketConnectionEvents>(event: U, listener: SocketConnectionEvents[U]): this;
  emit<U extends keyof SocketConnectionEvents>(event: U, ...args: Parameters<SocketConnectionEvents[U]>): boolean;
}

export class SocketMessageRejectionError extends Error {
  code: string;
  originalMessage: string;
  constructor(errorMessage: IncomingErrorMessage) {
    super(`Outgoing socket message rejected: ${errorMessage.message} (${errorMessage.code})`);
    this.code = errorMessage.code;
    this.originalMessage = errorMessage.message;
  }
}

/**
 * A high-level abstraction around WebSocket which enables automatic
 * reconnection with backoff, and a deadletter queue for resending
 * events which were queued during a disconnected period.
 *
 * @event SocketConnection#error
 * @type {Error}
 *
 * @event SocketConnection#connected
 *
 * @event SocketConnection#closed
 *
 * @event SocketConnection#message
 * @type {object} The message, parsed as JSON.
 */
export class SocketConnection extends EventEmitter {
  // although this starts out null, it is assigned in the constructor -
  // just not in a way that TS can infer.
  private ws: ReconnectingWebsocket;
  // stores the handle for the next frame of the heartbeat message loop
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  // tracks a "generation" - basically the number of reconnections
  // made on this instance. This is useful because we have occasional
  // long-running async tasks which might want to know if there was
  // a reconnect while they were running
  private generation = 0;

  constructor(url: string) {
    super();
    // reconnect will synchronously assign this.ws to a new socket instance
    this.ws = new ReconnectingWebsocket(url, undefined, {
      maxEnqueuedMessages: 1000,
      maxReconnectionDelay: MAX_BACKOFF_DELAY,
      reconnectionDelayGrowFactor: BACKOFF_MULTIPLIER,
      debug: localStorage.getItem('DEBUG_WS') === 'true',
    });
    this.ws.addEventListener('open', this.onOpen);
    this.ws.addEventListener('error', this.onError);
    this.ws.addEventListener('message', this.onMessage);
    this.ws.addEventListener('close', this.onClose);
  }

  private onError = (ev: ErrorEvent) => {
    if (ev.error) {
      logger.error(ev.error);
    }
    this.emit('error', new Error('The socket encountered an error'));
  };

  private onClose = (ev: CloseEvent) => {
    // don't log 1000, which is a normal close event.
    if (ev.code !== 1000) {
      logger.debug(`Socket connection closed`, ev.code, 'reason?:', ev.reason);
    }
    this.stopHeartbeatLoop();
    this.generation++;
    this.emit('closed');
  };

  private onOpen = () => {
    // start or resume heartbeat loop
    this.startHeartbeatLoop();

    this.emit('connected');
  };

  private onMessage = (ev: MessageEvent) => {
    const parsed = camelcase(JSON.parse(ev.data), { deep: true }) as IncomingSocketMessage;
    this.emit('message', parsed);
  };

  private startHeartbeatLoop = () => {
    // stop any previous interval
    this.stopHeartbeatLoop();
    this.heartbeatTimeout = setTimeout(this.heartbeat, HEARTBEAT_INTERVAL);
  };

  private manuallyReconnect = () => {
    this.ws.reconnect();
  };

  /**
   * Sends a ping, then awaits a pong response. If the response
   * doesn't arrive within the interval, begin a reconnect cycle
   */
  private heartbeat = async () => {
    // grab a freeze of the current generation - heartbeat timeout
    // can take a while, and there's a chance we reconnect a dead socket
    // during that time. If the heartbeat times out alongside a dead
    // socket scenario, the timeout will trigger an extra forced reconnect -
    // unless we compare generations and recognize the reconnect already happened.
    const currentGeneration = this.generation;
    try {
      await this.sendAndWaitForResponse({ kind: 'ping' }, HEARTBEAT_TIMEOUT);
      // queue another heartbeat
      this.heartbeatTimeout = setTimeout(this.heartbeat, HEARTBEAT_INTERVAL);
    } catch (err) {
      logger.debug(`Missed heartbeat`, err);
      // check to see if there was a reconnect while we were waiting -
      // if there was, we don't force a new one.
      if (this.generation === currentGeneration) {
        // begin the reconnect cycle
        this.manuallyReconnect();
      }
      if (!(err instanceof MessageTimeoutError)) {
        // if this wasn't a timeout error (i.e. if the server responded to 'ping' with 'error'),
        // we probably want to know about that, so log it
        logger.error(err);
      }
    }
  };

  private stopHeartbeatLoop = () => {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
    }
  };

  /**
   * Not guarded for disconnection. Will throw if socket is not connected!
   */
  private rawSend = (message: any) => {
    if (!this.ws) throw new Error('No socket connection');
    this.ws.send(JSON.stringify(message));
    this.emit('sent', message);
  };

  private isErrorMessage = (message: any): message is IncomingErrorMessage => message.kind === 'error';

  private prepareMessage = <T extends OutgoingSocketMessage>(message: T) => ({
    ...message,
    id: v4(),
  });

  /**
   * Sends a message to the socket connection, or enqueues it
   * for sending later if the connection is closed.
   *
   * @param message Any message object
   * @param dropIfClosed Optionally drop the message if the socket is closed
   * @returns The final message we sent - including random ID. If no message
   *   was sent (i.e. dropIfClosed is true and we are disconnected), returns null
   */
  send = <T extends OutgoingSocketMessage>(message: T): (T & { id: string }) | null => {
    // assign a random ID to the message so its response can be tracked
    // and attach user ID
    const augmentedMessage = this.prepareMessage(message);

    if (this.readyState === WebSocket.OPEN) {
      this.rawSend(augmentedMessage);
      return augmentedMessage;
    } else {
      return null;
    }
  };

  /**
   * Sends a message and awaits the server's acknowledgement of that message.
   * Resolves with the server's response.
   *
   * @param message Any message object
   */
  sendAndWaitForResponse = async <ExpectedResponse extends IncomingSocketMessage>(
    message: OutgoingSocketMessage,
    timeout: number = 1000
  ) => {
    const sentMessage = this.send(message);

    if (!sentMessage) {
      throw new Error('Could not send message; connection is not established');
    }

    return new Promise<ExpectedResponse>((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        reject(new MessageTimeoutError());
      }, timeout);

      const checkMessage = (incomingMessage: IncomingSocketMessage) => {
        if (incomingMessage.requestId === sentMessage.id) {
          clearTimeout(timeoutHandle);
          this.off('message', checkMessage);
          if (this.isErrorMessage(incomingMessage)) {
            reject(new SocketMessageRejectionError(incomingMessage));
          } else {
            resolve(incomingMessage as ExpectedResponse);
          }
        }
      };
      this.on('message', checkMessage);
    });
  };

  /**
   * Ends the socket connection
   */
  close = () => {
    this.ws.close();
    this.emit('closed');
  };

  /**
   * Current status of the active websocket connection
   */
  get readyState():
    | typeof WebSocket.OPEN
    | typeof WebSocket.CLOSED
    | typeof WebSocket.CLOSING
    | typeof WebSocket.CONNECTING {
    return this.ws.readyState;
  }

  /**
   * For testing purposes only!
   */
  get __socket() {
    return this.ws;
  }
}
