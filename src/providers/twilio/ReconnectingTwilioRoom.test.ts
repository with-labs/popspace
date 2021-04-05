import { ReconnectingTwilioRoom } from './ReconnectingTwilioRoom';
jest.mock('twilio-video');
jest.mock('../../utils/api', () => ({
  loggedInEnterRoom: jest.fn().mockResolvedValue({
    success: true,
    token: 'token',
  }),
}));

describe('ReconnectingTwilioRoom wrapper', () => {
  it('connects to Twilio, and reconnects on disconnect error', async () => {
    const conn = new ReconnectingTwilioRoom({});
    conn.setRoom('roomName');

    const onConnecting = jest.fn();
    conn.on('connecting', onConnecting);
    const onConnected = jest.fn();
    conn.on('connected', onConnected);
    const onDisconnected = jest.fn();
    conn.on('disconnected', onDisconnected);
    const onReconnecting = jest.fn();
    conn.on('reconnecting', onReconnecting);
    const onError = jest.fn();
    conn.on('error', onError);

    const room = await conn.connect();

    expect(onConnecting).toHaveBeenCalled();
    expect(onConnected).toHaveBeenCalled();

    room!.emit('disconnected', room, new Error('mock error'));

    expect(onDisconnected).toHaveBeenCalled();
    expect(onReconnecting).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();

    // a new room was created
    expect(conn.room).not.toBe(room);
  });

  it("doesn't reconnect if there was no error during disconnect", async () => {
    const conn = new ReconnectingTwilioRoom({});
    conn.setRoom('roomName');

    const onConnecting = jest.fn();
    conn.on('connecting', onConnecting);
    const onConnected = jest.fn();
    conn.on('connected', onConnected);
    const onDisconnected = jest.fn();
    conn.on('disconnected', onDisconnected);
    const onReconnecting = jest.fn();
    conn.on('reconnecting', onReconnecting);
    const onError = jest.fn();
    conn.on('error', onError);

    const room = await conn.connect();

    expect(onConnecting).toHaveBeenCalled();
    expect(onConnected).toHaveBeenCalled();

    room!.emit('disconnected', room);

    expect(onDisconnected).toHaveBeenCalled();
    expect(onReconnecting).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('disconnects on window unload', async () => {
    const conn = new ReconnectingTwilioRoom({});
    conn.setRoom('roomName');
    await conn.connect();
    window.dispatchEvent(new Event('beforeunload'));
    expect(conn.room?.disconnect).toHaveBeenCalled();
  });
});
