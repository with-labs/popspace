import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { useCleanupDisconnectedPeople } from './useCleanupDisconnectedPeople';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { useCoordinatedDispatch } from './CoordinatedDispatchProvider';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { actions } from './roomSlice';

jest.mock('./CoordinatedDispatchProvider');
jest.mock('../../hooks/useVideoContext/useVideoContext');

const mockDispatch = jest.fn();
(useCoordinatedDispatch as jest.Mock).mockReturnValue(mockDispatch);

(useVideoContext as jest.Mock).mockReturnValue({
  allParticipants: [{ sid: 'someoneReal' }],
});

describe('useCleanupDisconnectedPeople hook', () => {
  it('removes people from Redux who are not present in the room', async () => {
    const state = {
      room: {
        people: {
          ghost: { message: 'boo' },
        },
      },
    };
    const store = createStore(() => state);

    const { waitFor } = renderHook(() => useCleanupDisconnectedPeople(), {
      wrapper: (p) => <Provider store={store} {...p} />,
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(actions.removePerson({ id: 'ghost' }));
    });
  });
});
