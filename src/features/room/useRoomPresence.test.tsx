import * as React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { useRoomPresence } from './useRoomPresence';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { useCoordinatedDispatch } from './CoordinatedDispatchProvider';
import { fuzzVector } from '../../utils/math';
import { actions } from './roomSlice';
import { useLocalParticipant } from '../../withHooks/useLocalParticipant/useLocalParticipant';
import { randomAvatar } from '../../withComponents/AvatarSelect/options';

jest.mock('./CoordinatedDispatchProvider');
jest.mock('../../utils/math');
jest.mock('../../withComponents/AvatarSelect/options');
jest.mock('../../withHooks/useLocalParticipant/useLocalParticipant');

const POSITION = { x: 10, y: -5 };
(fuzzVector as jest.Mock).mockReturnValue(POSITION);

const ID = 'foo';
(useLocalParticipant as jest.Mock).mockReturnValue({
  sid: ID,
});

const AVATAR = 'bar';
(randomAvatar as jest.Mock).mockReturnValue({
  name: AVATAR,
});

const mockDispatch = jest.fn();
(useCoordinatedDispatch as jest.Mock).mockReturnValue(mockDispatch);

describe('useRoomPresence hook', () => {
  afterEach(() => {
    mockDispatch.mockClear();
  });

  describe("if you're not in the room yet", () => {
    // initialize a redux store
    const state = {
      room: {
        people: {},
      },
    };
    const store = createStore(() => state);

    it('adds you to the room', async () => {
      const { waitFor } = renderHook(() => useRoomPresence(), {
        wrapper: (p) => <Provider store={store} {...p} />,
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          actions.addPerson({
            position: POSITION,
            person: {
              id: ID,
              kind: 'person',
              avatar: AVATAR,
              emoji: null,
              viewingScreenSid: null,
              isSpeaking: false,
            },
          })
        );
      });
    });
  });
});
