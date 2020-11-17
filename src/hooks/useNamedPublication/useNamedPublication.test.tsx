import { renderHook, act } from '@testing-library/react-hooks';
import { useNamedPublication } from './useNamedPublication';
import { EventEmitter } from 'events';

class MockParticipant extends EventEmitter {
  constructor(private _tracks: { trackName: string }[]) {
    super();
  }

  tracks = {
    values: () => this._tracks,
  };
}

describe('useNamedPublication hook', () => {
  it('retrieves a publication by name', async () => {
    const mockParticipant = new MockParticipant([{ trackName: 'camera-13456' }]);

    const { result } = renderHook(() => useNamedPublication(mockParticipant as any, 'camera'));

    expect(result.current).toEqual({ trackName: 'camera-13456' });
  });

  it('adds the track when it is published', async () => {
    const mockParticipant = new MockParticipant([]);

    const { result } = renderHook(() => useNamedPublication(mockParticipant as any, 'camera'));

    expect(result.current).toBe(null);

    act(() => {
      mockParticipant.emit('trackPublished', { trackName: 'camera-1234' });
    });

    expect(result.current).toEqual({ trackName: 'camera-1234' });
  });

  it('removes the track when unpublished', async () => {
    const mockParticipant = new MockParticipant([{ trackName: 'camera-1234' }]);

    const { result } = renderHook(() => useNamedPublication(mockParticipant as any, 'camera'));

    expect(result.current).toEqual({ trackName: 'camera-1234' });

    act(() => {
      mockParticipant.emit('trackUnpublished', { trackName: 'camera-1234' });
    });

    expect(result.current).toBe(null);
  });
});
