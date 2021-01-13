import React from 'react';
import { render, cleanup, wait, act } from '@testing-library/react';
import { RoomStateProvider } from './RoomStateProvider';
import { BrowserRouter } from 'react-router-dom';
import { useRoomStore } from './useRoomStore';
import { ConnectionFailedError } from './SocketConnection';

jest.mock('./SocketConnection');
jest.mock('../utils/sessionToken', () => ({
  getSessionToken: jest.fn(() => 'MOCK TOKEN'),
}));

const props = { roomName: 'foo' };
const testContent = <div data-testid="content" />;

async function getSocketConnection() {
  // wait for socket instance to be provided to the room store
  await wait(() => {
    expect(useRoomStore.getState().socket).toBeDefined();
  });

  // store the SocketConnection (it's a mock)
  return useRoomStore.getState().socket!;
}

describe('RoomStateProvider component', () => {
  afterEach(cleanup);

  test('connects to the socket server and inits room state', async () => {
    const result = render(<RoomStateProvider {...props}>{testContent}</RoomStateProvider>, {
      wrapper: BrowserRouter,
    });

    expect(result.getByTestId('roomStateLoading')).toBeDefined();

    const socket = await getSocketConnection();

    // now we can simulate some socket events to move through the lifecycle
    act(() => {
      socket.emit('connected');
    });

    await wait(() => {
      expect(socket.sendAndWaitForResponse).toHaveBeenCalledWith({
        kind: 'auth',
        payload: {
          roomName: props.roomName,
          token: 'MOCK TOKEN', // this is from the mocked module above
        },
      });
    });

    expect(result.getByTestId('content')).toBeDefined();
  });

  test('reconnects and reauthenticates after disconnection', async () => {
    // first part is just the same connect test as above...
    const result = render(<RoomStateProvider {...props}>{testContent}</RoomStateProvider>, {
      wrapper: BrowserRouter,
    });
    const socket = await getSocketConnection();
    act(() => {
      socket.emit('connected');
    });
    await wait(() => {
      expect(socket.sendAndWaitForResponse).toHaveBeenCalledWith({
        kind: 'auth',
        payload: {
          roomName: props.roomName,
          token: 'MOCK TOKEN', // this is from the mocked module above
        },
      });
    });
    expect(result.getByTestId('content')).toBeDefined();

    // now disconnect
    act(() => {
      socket.emit('reconnecting');
    });

    // expect reconnect alert to be displayed
    await wait(() => {
      expect(result.getByTestId('roomStateReconnecting')).toBeDefined();
    });
    // content is still visible (we don't hide content while reconnecting)
    expect(result.getByTestId('content')).toBeDefined();

    // reconnect
    act(() => {
      socket.emit('connected');
    });
    await wait(() => {
      expect(socket.sendAndWaitForResponse).toHaveBeenCalledWith({
        kind: 'auth',
        payload: {
          roomName: props.roomName,
          token: 'MOCK TOKEN', // this is from the mocked module above
        },
      });
    });

    // expect reconnect alert to be gone
    await wait(() => {
      expect(() => result.getByTestId('roomStateReconnecting')).toThrow();
    });
  });
});
