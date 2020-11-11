import { renderHook, act } from '@testing-library/react-hooks';
import { useLocalMediaTrack } from './useLocalMediaTrack';
import { EventEmitter } from 'events';

class MockEventSource extends EventEmitter {
  addEventListener = this.on;
  removeEventListener = this.off;
}

class MockMediaTrack extends MockEventSource {
  constructor(public kind: string, public id: string, private _deviceId: string) {
    super();
  }

  getConstraints() {
    return {
      deviceId: this._deviceId,
    };
  }

  stop = jest.fn();
}

class MockMediaStream extends MockEventSource {
  constructor(private _tracks: MockMediaTrack[]) {
    super();
  }

  getTracks = () => {
    return this._tracks;
  };
}

describe('useLocalMediaTrack hook', () => {
  beforeEach(() => {
    (global.navigator as any).mediaDevices = {};
  });

  it('can start and stop an audio track', async () => {
    const track = new MockMediaTrack('audio', 'mock track', 'default');
    global.navigator.mediaDevices.getUserMedia = jest.fn().mockResolvedValue(new MockMediaStream([track]));

    const { result } = renderHook(() => useLocalMediaTrack('audio', null, {}, {}));

    expect(result.current[0]).toBe(null);

    await act(async () => {
      await result.current[1]();
    });

    expect(result.current[0]).toEqual(track);
    expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: {
        deviceId: null,
      },
    });

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe(null);
    expect(track.stop).toHaveBeenCalled();
  });

  it('can start and stop a video track', async () => {
    const track = new MockMediaTrack('video', 'mock track', 'default');
    global.navigator.mediaDevices.getUserMedia = jest.fn().mockResolvedValue(new MockMediaStream([track]));

    const { result } = renderHook(() => useLocalMediaTrack('video', null, {}, {}));

    expect(result.current[0]).toBe(null);

    await act(async () => {
      await result.current[1]();
    });

    expect(result.current[0]).toEqual(track);
    expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      video: {
        deviceId: null,
      },
    });

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe(null);
    expect(track.stop).toHaveBeenCalled();
  });

  it('can stop a track when it has ended', async () => {
    const track = new MockMediaTrack('audio', 'mock track', 'default');
    global.navigator.mediaDevices.getUserMedia = jest.fn().mockResolvedValue(new MockMediaStream([track]));

    const { result } = renderHook(() => useLocalMediaTrack('audio', null, {}, {}));

    await act(async () => {
      await result.current[1]();
    });

    expect(result.current[0]).toEqual(track);

    act(() => {
      track.emit('ended');
    });

    expect(result.current[0]).toBe(null);
  });

  it('can "restart" a track (replace it with a new source)', async () => {
    const track = new MockMediaTrack('audio', 'mock track', 'default');
    global.navigator.mediaDevices.getUserMedia = jest.fn().mockResolvedValue(new MockMediaStream([track]));

    const { result } = renderHook(() => useLocalMediaTrack('audio', null, {}, {}));

    // the initial start
    await act(async () => {
      await result.current[1]();
    });

    expect(result.current[0]).toEqual(track);

    // the restart
    const newTrack = new MockMediaTrack('audio', 'track 2', 'default');
    global.navigator.mediaDevices.getUserMedia = jest.fn().mockResolvedValue(new MockMediaStream([newTrack]));
    await act(async () => {
      await result.current[1]();
    });

    expect(result.current[0]).toBe(newTrack);
    // it calls stop on the replaced track
    expect(track.stop).toHaveBeenCalled();
  });

  it('restarts with a new track when the device ID changes', async () => {
    const track = new MockMediaTrack('audio', 'mock track', 'default');
    global.navigator.mediaDevices.getUserMedia = jest.fn().mockResolvedValue(new MockMediaStream([track]));

    const { result, rerender, waitFor } = renderHook(
      (args: ['audio' | 'video', string | null, any, any]) => useLocalMediaTrack(...args),
      {
        initialProps: ['audio', null, {}, {}],
      }
    );

    await act(async () => {
      await result.current[1]();
    });

    expect(result.current[0]).toEqual(track);

    const newTrack = new MockMediaTrack('audio', 'mock track', 'specificDevice');
    global.navigator.mediaDevices.getUserMedia = jest.fn().mockResolvedValue(new MockMediaStream([newTrack]));

    // restart with device ID
    act(() => {
      rerender(['audio', 'specificDevice', {}, {}]);
    });

    await waitFor(() => expect(result.current[0]).toEqual(newTrack));
    expect(track.stop).toHaveBeenCalled();
  });

  it("doesn't restart if device ID changes but track is not active", async () => {
    global.navigator.mediaDevices.getUserMedia = jest.fn();

    const { result, rerender } = renderHook(
      (args: ['audio' | 'video', string | null, any, any]) => useLocalMediaTrack(...args),
      {
        initialProps: ['audio', null, {}, {}],
      }
    );

    // restart with device ID
    act(() => {
      rerender(['audio', 'specificDevice', {}, {}]);
    });

    expect(result.current[0]).toBe(null);
    // no media was ever started, despite the device ID change
    expect(global.navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
  });

  it('handles permission denied', async () => {
    global.navigator.mediaDevices.getUserMedia = jest.fn().mockRejectedValue(new Error('Permission denied'));

    const onError = jest.fn();
    const { result } = renderHook(() =>
      useLocalMediaTrack(
        'audio',
        null,
        {},
        {
          onError,
          permissionDeniedMessage: 'foobar',
        }
      )
    );

    await act(async () => {
      await result.current[1]();
    });

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0].message).toEqual('foobar');
  });

  it('handles permission dismissed', async () => {
    global.navigator.mediaDevices.getUserMedia = jest.fn().mockRejectedValue(new Error('Permission dismissed'));

    const onError = jest.fn();
    const { result } = renderHook(() =>
      useLocalMediaTrack(
        'audio',
        null,
        {},
        {
          onError,
          permissionDismissedMessage: 'foobar',
        }
      )
    );

    await act(async () => {
      await result.current[1]();
    });

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0].message).toEqual('foobar');
  });
});
