import React from 'react';
import { render, cleanup, waitFor, act } from '@testing-library/react';
import { RoomStateProvider } from './RoomStateProvider';
import { BrowserRouter } from 'react-router-dom';
import { useRoomStore } from './useRoomStore';

jest.mock('./SocketConnection');
jest.mock('@utils/sessionToken', () => ({
  getSessionToken: jest.fn(() => 'MOCK TOKEN'),
}));

const props = { roomName: 'foo' };
const testContent = <div data-testid="content" />;

async function getSocketConnection() {
  // wait for socket instance to be provided to the room store
  await waitFor(() => {
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

    await waitFor(() => {
      expect(socket.sendAndWaitForResponse).toHaveBeenCalledWith(
        {
          kind: 'auth',
          payload: {
            roomName: props.roomName,
            token: 'MOCK TOKEN', // this is from the mocked module above
          },
        },
        10000
      );
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
    await waitFor(() => {
      expect(socket.sendAndWaitForResponse).toHaveBeenCalledWith(
        {
          kind: 'auth',
          payload: {
            roomName: props.roomName,
            token: 'MOCK TOKEN', // this is from the mocked module above
          },
        },
        10000
      );
    });
    expect(result.getByTestId('content')).toBeDefined();

    // now disconnect
    act(() => {
      socket.emit('closed');
    });

    // expect reconnect alert to be displayed
    await waitFor(() => {
      expect(result.getByTestId('roomStateReconnecting')).toBeDefined();
    });
    // content is still visible (we don't hide content while reconnecting)
    expect(result.getByTestId('content')).toBeDefined();

    // reconnect
    act(() => {
      socket.emit('connected');
    });
    await waitFor(() => {
      expect(socket.sendAndWaitForResponse).toHaveBeenCalledWith(
        {
          kind: 'auth',
          payload: {
            roomName: props.roomName,
            token: 'MOCK TOKEN', // this is from the mocked module above
          },
        },
        10000
      );
    });

    // expect reconnect alert to be gone
    await waitFor(() => {
      expect(() => result.getByTestId('roomStateReconnecting')).toThrow();
    });
  });
});
