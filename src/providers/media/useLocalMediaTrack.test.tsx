import { renderHook, act } from '@testing-library/react-hooks';
import { useLocalMediaTrack } from './useLocalMediaTrack';
import { EventEmitter } from 'events';
import { createLocalVideoTrack, createLocalAudioTrack } from 'twilio-video';
import { MediaTrackEvent } from '@constants/twilio';

jest.mock('@utils/logger');

jest.mock('twilio-video', () => ({
  createLocalAudioTrack: jest.fn(),
  createLocalVideoTrack: jest.fn(),
}));

class MockEventSource extends EventEmitter {
  addEventListener = this.on;
  removeEventListener = this.off;
}

class MockMediaTrack extends MockEventSource {
  constructor(public kind: string, public id: string, public _deviceId: string | null) {
    super();
  }

  getConstraints() {
    return {
      deviceId: this._deviceId,
    };
  }

  stop = jest.fn();
}

class MockLocalMediaTrack extends EventEmitter {
  name: string;
  constructor(public mediaStreamTrack: any, options: any) {
    super();
    this.name = options.name;
    // fake event emitter callback invocation for stream end
    this.mediaStreamTrack.addEventListener('ended', () => this.emit('stopped'));
  }

  stop = jest.fn();
  restart = jest.fn();
}

describe('useLocalMediaTrack hook', () => {
  beforeEach(() => {
    (global.navigator as any).mediaDevices = {};
  });

  it('can start and stop an audio track', async () => {
    const track = new MockMediaTrack('audio', 'mock track', 'default');
    const localMediaTrack = new MockLocalMediaTrack(track, {
      name: 'mic-1234',
    });
    (createLocalAudioTrack as jest.Mock).mockResolvedValue(localMediaTrack);
    const { result } = renderHook(() => useLocalMediaTrack('audio', 'mic', null, {}, {}));

    expect(result.current[0]).toBe(null);

    await act(async () => {
      await result.current[1].start();
    });

    expect(result.current[0]).toEqual(localMediaTrack);
    expect((createLocalAudioTrack as jest.Mock).mock.calls[0][0].name.startsWith('mic')).toBe(true);

    act(() => {
      result.current[1].stop();
    });

    expect(result.current[0]).toBe(null);
    expect(localMediaTrack.stop).toHaveBeenCalled();
  });

  it('can start and stop a video track', async () => {
    const track = new MockMediaTrack('video', 'mock track', 'default');
    const localMediaTrack = new MockLocalMediaTrack(track, {
      name: 'camera-1234',
    });
    (createLocalVideoTrack as jest.Mock).mockResolvedValue(localMediaTrack);
    const { result } = renderHook(() => useLocalMediaTrack('video', 'camera', null, {}, {}));

    expect(result.current[0]).toBe(null);

    await act(async () => {
      await result.current[1].start();
    });

    expect(result.current[0]).toEqual(localMediaTrack);
    expect((createLocalVideoTrack as jest.Mock).mock.calls[0][0].name.startsWith('camera')).toBe(true);

    act(() => {
      result.current[1].stop();
    });

    expect(result.current[0]).toBe(null);
    expect(localMediaTrack.stop).toHaveBeenCalled();
  });

  it('can stop a track when it has ended', async () => {
    const track = new MockMediaTrack('audio', 'mock track', 'default');
    const localMediaTrack = new MockLocalMediaTrack(track, {
      name: 'mic-1234',
    });
    (createLocalAudioTrack as jest.Mock).mockResolvedValue(localMediaTrack);
    const { result } = renderHook(() => useLocalMediaTrack('audio', 'mic', null, {}, {}));

    await act(async () => {
      await result.current[1].start();
    });

    expect(result.current[0]).toEqual(localMediaTrack);

    act(() => {
      localMediaTrack.emit(MediaTrackEvent.Stopped);
    });

    expect(result.current[0]).toBe(null);
  });

  it('can "restart" a track (replace it with a new source)', async () => {
    const track = new MockMediaTrack('audio', 'mock track', 'default');
    const localMediaTrack = new MockLocalMediaTrack(track, {
      name: 'mic-1234',
    });
    (createLocalAudioTrack as jest.Mock).mockResolvedValue(localMediaTrack);
    const { result } = renderHook(() => useLocalMediaTrack('audio', 'mic', null, {}, {}));

    // the initial start
    await act(async () => {
      await result.current[1].start();
    });

    expect(result.current[0]).toEqual(localMediaTrack);

    // the restart
    const newTrack = new MockMediaTrack('audio', 'track 2', 'default');
    // prepare for restart by switching tracks
    localMediaTrack.mediaStreamTrack = newTrack;
    await act(async () => {
      await result.current[1].start();
    });

    expect(result.current[0]?.mediaStreamTrack).toBe(newTrack);
    expect(localMediaTrack?.stop).toHaveBeenCalled();
  });

  it('restarts with a new track when the device ID changes', async () => {
    const track = new MockMediaTrack('audio', 'mock track', null);
    const localMediaTrack = new MockLocalMediaTrack(track, {
      name: 'mic-1234',
    });
    (createLocalAudioTrack as jest.Mock).mockResolvedValue(localMediaTrack);

    const { result, rerender, waitFor } = renderHook(
      (args: ['audio' | 'video', string, string | null, any, any]) => useLocalMediaTrack(...args),
      {
        initialProps: ['audio', 'mic', null, {}, {}],
      }
    );

    await act(async () => {
      await result.current[1].start();
    });

    expect(result.current[0]).toEqual(localMediaTrack);

    // restart with device ID
    act(() => {
      rerender(['audio', 'mic', 'specificDevice', {}, {}]);
    });

    await waitFor(() =>
      expect(createLocalAudioTrack).toHaveBeenCalledWith(
        expect.objectContaining({
          deviceId: 'specificDevice',
        })
      )
    );
  });

  it("doesn't restart if device ID changes but track is not active", async () => {
    const { result, rerender } = renderHook(
      (args: ['audio' | 'video', string, string | null, any, any]) => useLocalMediaTrack(...args),
      {
        initialProps: ['audio', 'mic', null, {}, {}],
      }
    );

    // restart with device ID
    act(() => {
      rerender(['audio', 'mic', 'specificDevice', {}, {}]);
    });

    expect(result.current[0]).toBe(null);
    // no media was ever started, despite the device ID change
    expect(createLocalAudioTrack).not.toHaveBeenCalled();
  });

  it('handles permission denied', async () => {
    (createLocalAudioTrack as jest.Mock).mockRejectedValue(new Error('Permission denied'));

    const onError = jest.fn();
    const { result } = renderHook(() =>
      useLocalMediaTrack(
        'audio',
        'mic',
        null,
        {},
        {
          onError,
          permissionDeniedMessage: 'foobar',
        }
      )
    );

    await act(async () => {
      await result.current[1].start();
    });

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0].message).toEqual('foobar');
  });

  it('handles permission dismissed', async () => {
    (createLocalAudioTrack as jest.Mock).mockRejectedValue(new Error('Permission dismissed'));

    const onError = jest.fn();
    const { result } = renderHook(() =>
      useLocalMediaTrack(
        'audio',
        'mic',
        null,
        {},
        {
          onError,
          permissionDismissedMessage: 'foobar',
        }
      )
    );

    await act(async () => {
      await result.current[1].start();
    });

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0].message).toEqual('foobar');
  });
});
