import * as React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { useEnforcedPersonSelector } from './useEnforcedPersonSelector';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { useCoordinatedDispatch } from '../CoordinatedDispatchProvider';
import { fuzzVector } from '../../../utils/math';
import { actions } from '../roomSlice';
import { randomAvatar } from '../../../components/AvatarSelect/options';

jest.mock('../CoordinatedDispatchProvider');
jest.mock('../../../utils/math');
jest.mock('../../../components/AvatarSelect/options');

const ID = 'me';

const POSITION = { x: 10, y: -5 };
(fuzzVector as jest.Mock).mockReturnValue(POSITION);

const AVATAR = 'bar';
(randomAvatar as jest.Mock).mockReturnValue({
  name: AVATAR,
});

const mockDispatch = jest.fn();
(useCoordinatedDispatch as jest.Mock).mockReturnValue(mockDispatch);

describe('useEnforcedPersonSelector hook', () => {
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
      const { waitFor } = renderHook(() => useEnforcedPersonSelector(ID), {
        wrapper: (p) => <Provider store={store} {...p} />,
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          actions.addPerson({
            position: POSITION,
            person: {
              id: ID,
              avatar: AVATAR,
            },
          })
        );
      });
    });
  });

  describe('if you are in the room', () => {
    const state = {
      room: {
        people: {
          [ID]: { foo: 'bar' },
        },
      },
    };
    const store = createStore(() => state);

    it('returns your data', async () => {
      const { result } = renderHook(() => useEnforcedPersonSelector(ID), {
        wrapper: (p) => <Provider store={store} {...p} />,
      });

      expect(result.current).toEqual({ foo: 'bar' });
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });
});
