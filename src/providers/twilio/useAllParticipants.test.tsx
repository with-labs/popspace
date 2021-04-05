/**
 * #WITH_EDIT
 *
 * Removed tests for dominant speaker shuffling, since that got removed from `useAllParticipants`
 */

import { act, renderHook } from '@testing-library/react-hooks';
import EventEmitter from 'events';
import { useAllParticipants } from './useAllParticipants';

describe('the useAllParticipants hook', () => {
  let mockRoom: any;

  beforeEach(() => {
    mockRoom = new EventEmitter();
    mockRoom.localParticipant = 'localParticipant';
    mockRoom.participants = new Map([
      [0, 'participant1'],
      [1, 'participant2'],
    ]);
  });

  it('should return an array of mockParticipant.tracks by default', () => {
    const { result } = renderHook(() => useAllParticipants(mockRoom));
    expect(result.current).toEqual(['participant1', 'participant2', 'localParticipant']);
  });

  it('should return respond to "participantConnected" events', async () => {
    const { result } = renderHook(() => useAllParticipants(mockRoom));
    act(() => {
      mockRoom.emit('participantConnected', 'newParticipant');
    });
    expect(result.current).toEqual(['participant1', 'participant2', 'newParticipant', 'localParticipant']);
  });

  it('should return respond to "participantDisconnected" events', async () => {
    const { result } = renderHook(() => useAllParticipants(mockRoom));
    act(() => {
      mockRoom.emit('participantDisconnected', 'participant1');
    });
    expect(result.current).toEqual(['participant2', 'localParticipant']);
  });

  it('should clean up listeners on unmount', () => {
    const { unmount } = renderHook(() => useAllParticipants(mockRoom));
    unmount();
    expect(mockRoom.listenerCount('participantConnected')).toBe(0);
    expect(mockRoom.listenerCount('participantDisconnected')).toBe(0);
  });
});
