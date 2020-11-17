import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useCanEnterRoom } from './useCanEnterRoom';
import useVideoContext from '../useVideoContext/useVideoContext';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

jest.mock('../../hooks/useVideoContext/useVideoContext');

describe('useCanEnterRoom hook', () => {
  it("says yes when you're the first in the room but have not gotten a ping", async () => {
    const mockRoom = {
      participants: {
        size: 0,
      },
    };

    (useVideoContext as jest.Mock).mockReturnValue({
      room: mockRoom,
    });

    // initialize a redux store
    const state = {
      room: {
        syncedFromPeer: false,
      },
    };
    const store = createStore(() => state);

    const { result } = renderHook(() => useCanEnterRoom(), {
      wrapper: (p) => <Provider store={store} {...p} />,
    });

    expect(result.current).toBe(true);
  });

  it("says yes when you're not first in the room but have gotten a ping", async () => {
    const mockRoom = {
      participants: {
        size: 4,
      },
    };

    (useVideoContext as jest.Mock).mockReturnValue({
      room: mockRoom,
    });

    // initialize a redux store
    const state = {
      room: {
        syncedFromPeer: true,
      },
    };
    const store = createStore(() => state);

    const { result } = renderHook(() => useCanEnterRoom(), {
      wrapper: (p) => <Provider store={store} {...p} />,
    });

    expect(result.current).toBe(true);
  });

  it("says no when you're not first in the room and have not gotten a ping", async () => {
    const mockRoom = {
      participants: {
        size: 4,
      },
    };

    (useVideoContext as jest.Mock).mockReturnValue({
      room: mockRoom,
    });

    // initialize a redux store
    const state = {
      room: {
        syncedFromPeer: false,
      },
    };
    const store = createStore(() => state);

    const { result } = renderHook(() => useCanEnterRoom(), {
      wrapper: (p) => <Provider store={store} {...p} />,
    });

    expect(result.current).toBe(false);
  });

  it('says yes when you were the first in the room but more people have joined', async () => {
    (useVideoContext as jest.Mock)
      .mockReturnValueOnce({
        room: {
          participants: {
            size: 0,
          },
        },
      })
      .mockReturnValueOnce({
        room: {
          participants: {
            size: 1,
          },
        },
      });

    const state = {
      room: {
        syncedFromPeer: false,
      },
    };
    const store = createStore(() => state);

    const { result, rerender } = renderHook(() => useCanEnterRoom(), {
      wrapper: (p) => <Provider store={store} {...p} />,
    });

    expect(result.current).toBe(true);

    rerender();

    expect(result.current).toBe(true);
  });

  it('resets "first person in room" status when the room changes', async () => {
    (useVideoContext as jest.Mock)
      // starting as first person in
      .mockReturnValueOnce({
        room: {
          participants: {
            size: 0,
          },
        },
      })
      // leaving room
      .mockReturnValueOnce({
        room: null,
      })
      // joining new room with people in already
      .mockReturnValueOnce({
        room: {
          participants: {
            size: 3,
          },
        },
      });

    const state = {
      room: {
        syncedFromPeer: false,
      },
    };
    // this dummy store only does one thing: if you dispatch "mock action" action to it,
    // it toggles syncedFromPeer "on" - this lets us test behavior when this
    // value changes.
    const store = createStore((initialState = state, action: any) => {
      if (action.type === 'mock action') {
        return {
          room: {
            syncedFromPeer: true,
          },
        };
      }
      return state;
    });

    const { result, rerender } = renderHook(() => useCanEnterRoom(), {
      wrapper: (p) => <Provider store={store} {...p} />,
    });

    expect(result.current).toBe(true);

    rerender();

    expect(result.current).toBe(false);

    rerender();

    expect(result.current).toBe(false);

    act(() => {
      // simulate receiving a ping - see comment on the dummy test store above
      store.dispatch({ type: 'mock action' });
    });

    expect(result.current).toBe(true);
  });

  it('eventually says yes if we time out waiting for a ping from peers', async () => {
    jest.useFakeTimers();

    (useVideoContext as jest.Mock).mockReturnValue({
      room: {
        participants: {
          size: 1,
        },
      },
    });

    const state = {
      room: {
        syncedFromPeer: false,
      },
    };
    const store = createStore(() => state);

    const { result, rerender } = renderHook(() => useCanEnterRoom(), {
      wrapper: (p) => <Provider store={store} {...p} />,
    });

    expect(result.current).toBe(false);

    act(() => {
      jest.advanceTimersToNextTimer();
    });

    expect(result.current).toBe(true);

    // test that it resets forced entry state when room changes
    (useVideoContext as jest.Mock).mockReturnValue({
      room: null,
    });

    rerender();

    expect(result.current).toBe(false);
  });
});
