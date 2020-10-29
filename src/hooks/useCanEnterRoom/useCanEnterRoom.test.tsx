import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
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
      __unsafe: {
        receivedPing: false,
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
      __unsafe: {
        receivedPing: true,
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
      __unsafe: {
        receivedPing: false,
      },
    };
    const store = createStore(() => state);

    const { result } = renderHook(() => useCanEnterRoom(), {
      wrapper: (p) => <Provider store={store} {...p} />,
    });

    expect(result.current).toBe(false);
  });
});
