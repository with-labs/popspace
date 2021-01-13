import { logger } from '../utils/logger';
import { EventEmitter } from 'events';
import { v4 } from 'uuid';
import { IncomingSocketMessage, IncomingErrorMessage, OutgoingSocketMessage } from './types/socketProtocol';
import camelcase from 'camelcase-keys';

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

// this limit helps avoid endless memory accumulation
// during a long disconnection period.
const DEADLETTER_QUEUE_LIMIT = 1000;
// for the first reconnection attempt, in ms.
export const INITIAL_BACKOFF_DELAY = 100;
// each time we reconnect, multiply delay by this constant
export const BACKOFF_MULTIPLIER = 4;
// max number of retries before aborting connection attempt
const BACKOFF_RETRIES = 5;
// computed maximum delay time before we stop retrying
export const MAX_BACKOFF_DELAY = INITIAL_BACKOFF_DELAY * BACKOFF_MULTIPLIER ** BACKOFF_RETRIES;
// interval in ms for ping heartbeat
export const HEARTBEAT_INTERVAL = 15 * 1000;
// number of ms to wait for a heartbeat response before
// we consider the connection lost
export const HEARTBEAT_TIMEOUT = 2000;

// full typing for the event emitter
export interface SocketConnectionEvents {
  error: (error: Error) => void;
  connected: () => void;
  closed: () => void;
  message: (msg: IncomingSocketMessage) => void;
  reconnecting: () => void;
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
  private ws: WebSocket;
  // the deadletter queue stores all the messages we couldn't
  // send while we were disconnected.
  private deadletterQueue = new Array<any>();
  // stored delay value for backoff on reconnect attempts
  private backoffDelay = INITIAL_BACKOFF_DELAY;
  // stores the timeout handle for any pending reconnect operation
  private reconnectTimeout: NodeJS.Timeout | null = null;
  // stores the interval for the heartbeat message loop
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(private url: string, private environment = { WebSocket: window.WebSocket }) {
    super();
    // reconnect will synchronously assign this.ws to a new socket instance
    this.ws = this.reconnect();
  }

  private reconnect = () => {
    const socket = new this.environment.WebSocket(this.url);
    socket.addEventListener('open', this.onOpen);
    socket.addEventListener('error', this.onError);
    socket.addEventListener('message', this.onMessage);
    socket.addEventListener('close', this.onClose);
    this.ws = socket;
    return socket;
  };

  private onClose = () => {
    logger.debug('Socket connection closed');
    this.stopHeartbeatLoop();
    // begin a backoff reconnect cycle
    this.tryReconnect();
  };

  private tryReconnect = () => {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.backoffDelay >= MAX_BACKOFF_DELAY) {
      this.emit('error', new ConnectionFailedError());
      return;
    }

    this.reconnectTimeout = setTimeout(this.reconnect, this.backoffDelay);
    logger.debug(`Reconnecting to server in ${this.backoffDelay / 1000} s ...`);

    this.backoffDelay *= BACKOFF_MULTIPLIER;
    this.emit('reconnecting');
  };

  private onError = (ev: Event) => {
    logger.error((ev as any).error ?? 'Socket error emitted, but no error present');
    this.emit('error', new Error('The socket encountered an error'));
  };

  private onOpen = () => {
    // once connected, stop any reconnect loop
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    // start or resume heartbeat loop
    this.startHeartbeatLoop();

    // send any messages we failed to send while disconnected
    this.dequeueDeadletters();
    logger.debug('Connected to socket');
    this.emit('connected');
  };

  private onMessage = (ev: MessageEvent) => {
    const parsed = camelcase(JSON.parse(ev.data), { deep: true }) as IncomingSocketMessage;
    // don't breadcrumb heartbeat messages, there's too many
    if (parsed.kind !== 'pong') {
      logger.breadcrumb({ category: 'mercury', message: `Socket message: ${ev.data}` });
    }
    this.emit('message', parsed);
  };

  private startHeartbeatLoop = () => {
    // stop any previous interval
    this.stopHeartbeatLoop();
    this.heartbeatInterval = setInterval(this.heartbeat, HEARTBEAT_INTERVAL);
  };

  /**
   * Sends a ping, then awaits a pong response. If the response
   * doesn't arrive within the interval, begin a reconnect cycle
   */
  private heartbeat = async () => {
    try {
      // two different timeouts cover different use cases -
      // the first explicit setTimeout covers the case where the message is deadlettered,
      // the timeout passed to sendAndWaitForResponse covers the case where the connection
      // is live but the server doesn't respond in time.
      const timeoutHandle = setTimeout(() => this.onClose, HEARTBEAT_TIMEOUT);
      await this.sendAndWaitForResponse({ kind: 'ping' }, HEARTBEAT_TIMEOUT);
      clearTimeout(timeoutHandle);
      // only after a successful heartbeat do we reset the backoff interval - this ensures that
      // if we continually reconnect successfully to a broken server which errors on heartbeats,
      // we don't enter a tight disconnect-reconnect thrashing loop.
      this.backoffDelay = INITIAL_BACKOFF_DELAY;
    } catch (err) {
      // begin the reconnect cycle
      this.onClose();
      if (!(err instanceof MessageTimeoutError)) {
        // if this wasn't a timeout error (i.e. if the server responded to 'ping' with 'error'),
        // we probably want to know about that, so log it
        logger.error(err);
      }
    }
  };

  private stopHeartbeatLoop = () => {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  };

  // this is recursive, it drains the queue until it either
  // reaches the end or encounters an error.
  private dequeueDeadletters = () => {
    if (this.deadletterQueue.length === 0 || !this.ws) return;
    const nextMessage = this.deadletterQueue.shift();
    try {
      this.rawSend(nextMessage);
      // if the send was successful, it's time for the next item
      this.dequeueDeadletters();
    } catch (err) {
      // oops, it didn't send. Put it back at the front of the queue
      // and stop trying to dequeue - we will wait for the next
      // reconnection.
      logger.error(err);
      this.deadletterQueue.unshift(nextMessage);
    }
  };

  private enequeueDeadletter = (message: any) => {
    this.deadletterQueue.push(message);
    if (this.deadletterQueue.length > DEADLETTER_QUEUE_LIMIT) {
      this.deadletterQueue.splice(DEADLETTER_QUEUE_LIMIT, this.deadletterQueue.length - DEADLETTER_QUEUE_LIMIT);
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

  /**
   * Extracts the behavior of sending a message or enqueuing it on
   * the deadletter queue if the connection is closed. Returns
   * true if the message was sent immediately, false otherwise.
   */
  private sendOrEnqueue = (message: any) => {
    if (this.readyState === WebSocket.OPEN) {
      this.rawSend(message);
      return true;
    } else {
      this.enequeueDeadletter(message);
      return false;
    }
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
  send = <T extends OutgoingSocketMessage>(message: T, retryIfClosed: boolean = false): (T & { id: string }) | null => {
    // assign a random ID to the message so its response can be tracked
    // and attach user ID
    const augmentedMessage = this.prepareMessage(message);

    if (retryIfClosed) {
      this.sendOrEnqueue(augmentedMessage);
      return augmentedMessage;
    } else {
      if (this.readyState === WebSocket.OPEN) {
        this.rawSend(augmentedMessage);
        return augmentedMessage;
      } else {
        return null;
      }
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
    const sentMessage = this.prepareMessage(message);
    // just because we called this.send doesn't mean the message has
    // yet gone out to the server - the connection may be CLOSED
    // or RECONNECTING, in which case the message went into the
    // deadletter queue. We don't want to begin awaiting a
    // response until the message has actually gone out, so
    // we add a handler looking for it on a 'sent' event. So,
    // if the message got enqueued (the returned value of sendOrEnqueue is false),
    // wait for it to be dequeued and sent
    if (!this.sendOrEnqueue(sentMessage)) {
      await new Promise<void>((resolve) => {
        const checkSentMessage = (outgoingMessage: OutgoingSocketMessage & { id: string }) => {
          if (outgoingMessage.id === sentMessage.id) {
            this.off('sent', checkSentMessage);
            resolve();
          }
        };
        this.on('sent', checkSentMessage);
      });
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
    // cancel all reconnection, we are closing the socket.
    this.ws.removeEventListener('close', this.tryReconnect);
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    // close the socket - this.onClose handler will emit the event to our
    // listeners automatically.
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
