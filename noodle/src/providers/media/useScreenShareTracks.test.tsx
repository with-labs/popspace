import { renderHook, act } from '@testing-library/react-hooks';
import { useScreenShareTracks } from './useScreenShareTracks';
import { EventEmitter } from 'events';

jest.mock('twilio-video', () => {
  class MockLocalMediaTrackClass {
    name: string;
    _onCallback: (() => void) | null = null;
    _offCallback: (() => void) | null = null;
    constructor(public mediaStreamTrack: any, options: any) {
      this.name = options.name;
      // fake event emitter callback invocation for stream end
      this.mediaStreamTrack.addEventListener('ended', () => this._onCallback?.());
    }
    on(_ev: string, cb: () => void) {
      this._onCallback = cb;
    }
    off(_ev: string, cb: () => void) {
      this._offCallback = cb;
    }
    stop() {
      this.mediaStreamTrack?.stop();
    }
  }

  return {
    LocalVideoTrack: MockLocalMediaTrackClass,
    LocalAudioTrack: MockLocalMediaTrackClass,
  };
});

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
  constructor(private _audioTracks: MockMediaTrack[], private _videoTracks: MockMediaTrack[]) {
    super();
  }

  getAudioTracks = () => {
    return this._audioTracks;
  };

  getVideoTracks = () => {
    return this._videoTracks;
  };
}

describe('useScreenShareTracks hook', () => {
  beforeEach(() => {
    (global.navigator as any).mediaDevices = {};
  });

  it('can start and stop screen share with audio', async () => {
    const audioTrack = new MockMediaTrack('audio', 'mock audioTrack', 'default');
    const videoTrack = new MockMediaTrack('video', 'mock videoTrack', 'default');
    (global.navigator.mediaDevices as any).getDisplayMedia = jest
      .fn()
      .mockResolvedValue(new MockMediaStream([audioTrack], [videoTrack]));

    const { result } = renderHook(() =>
      useScreenShareTracks({
        audioName: 'audio',
        videoName: 'video',
      })
    );

    expect(result.current[0]).toEqual({
      screenShareVideoTrack: null,
      screenShareAudioTrack: null,
    });

    await act(async () => {
      await result.current[1].start();
    });

    expect(result.current[0].screenShareAudioTrack?.mediaStreamTrack).toEqual(audioTrack);
    expect(result.current[0].screenShareAudioTrack?.name.startsWith('audio')).toBe(true);
    expect(result.current[0].screenShareVideoTrack?.mediaStreamTrack).toEqual(videoTrack);
    expect(result.current[0].screenShareVideoTrack?.name.startsWith('video')).toBe(true);
    // @ts-ignore
    expect(global.navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith({
      video: {
        frameRate: 10,
        height: 1080,
        width: 1920,
      },
      audio: {
        channelCount: 2,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        sampleRate: 48000,
        googEchoCancellation: false,
        googNoiseSuppression: false,
        googAutoGainControl: false,
      },
    });

    act(() => {
      result.current[1].stop();
    });

    expect(result.current[0]).toEqual({
      screenShareVideoTrack: null,
      screenShareAudioTrack: null,
    });
    expect(videoTrack.stop).toHaveBeenCalled();
    expect(audioTrack.stop).toHaveBeenCalled();
  });

  it('can stop a screen share when video has ended', async () => {
    const videoTrack = new MockMediaTrack('video', 'mock track', 'default');
    // @ts-ignore
    global.navigator.mediaDevices.getDisplayMedia = jest.fn().mockResolvedValue(new MockMediaStream([], [videoTrack]));

    const { result } = renderHook(() =>
      useScreenShareTracks({
        audioName: 'audio',
        videoName: 'video',
      })
    );

    await act(async () => {
      await result.current[1].start();
    });

    expect(result.current[0].screenShareVideoTrack?.mediaStreamTrack).toEqual(videoTrack);
    expect(result.current[0].screenShareAudioTrack).toBe(null);

    act(() => {
      videoTrack.emit('ended');
    });

    expect(result.current[0]).toEqual({
      screenShareVideoTrack: null,
      screenShareAudioTrack: null,
    });
  });

  it('can stop a screen share when audio has ended', async () => {
    const audioTrack = new MockMediaTrack('audio', 'mock track', 'default');
    // @ts-ignore
    global.navigator.mediaDevices.getDisplayMedia = jest.fn().mockResolvedValue(new MockMediaStream([audioTrack], []));

    const { result } = renderHook(() =>
      useScreenShareTracks({
        audioName: 'audio',
        videoName: 'video',
      })
    );

    await act(async () => {
      await result.current[1].start();
    });

    expect(result.current[0].screenShareAudioTrack?.mediaStreamTrack).toEqual(audioTrack);
    expect(result.current[0].screenShareVideoTrack).toBe(null);

    act(() => {
      audioTrack.emit('ended');
    });

    expect(result.current[0]).toEqual({
      screenShareVideoTrack: null,
      screenShareAudioTrack: null,
    });
  });

  it('can "restart" a track (replace it with a new source)', async () => {
    const track = new MockMediaTrack('video', 'mock track', 'default');
    // @ts-ignore
    global.navigator.mediaDevices.getDisplayMedia = jest.fn().mockResolvedValue(new MockMediaStream([], [track]));

    const { result } = renderHook(() =>
      useScreenShareTracks({
        audioName: 'audio',
        videoName: 'video',
      })
    );

    // the initial start
    await act(async () => {
      await result.current[1].start();
    });

    expect(result.current[0].screenShareVideoTrack?.mediaStreamTrack).toEqual(track);

    // the restart
    const newTrack = new MockMediaTrack('video', 'track 2', 'default');
    // @ts-ignore
    global.navigator.mediaDevices.getDisplayMedia = jest.fn().mockResolvedValue(new MockMediaStream([], [newTrack]));
    await act(async () => {
      await result.current[1].start();
    });

    expect(result.current[0].screenShareVideoTrack?.mediaStreamTrack).toEqual(newTrack);
    // it calls stop on the replaced track
    expect(track.stop).toHaveBeenCalled();
  });

  it('handles permission denied', async () => {
    // @ts-ignore
    global.navigator.mediaDevices.getDisplayMedia = jest.fn().mockRejectedValue(new Error('Permission denied'));

    const onError = jest.fn();
    const { result } = renderHook(() =>
      useScreenShareTracks({
        onError,
        permissionDeniedMessage: 'foobar',
        audioName: 'audio',
        videoName: 'video',
      })
    );

    await act(async () => {
      await result.current[1].start();
    });

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0].message).toEqual('foobar');
  });

  it('handles permission dismissed', async () => {
    // @ts-ignore
    global.navigator.mediaDevices.getDisplayMedia = jest.fn().mockRejectedValue(new Error('Permission dismissed'));

    const onError = jest.fn();
    const { result } = renderHook(() =>
      useScreenShareTracks({
        onError,
        permissionDismissedMessage: 'foobar',
        audioName: 'audio',
        videoName: 'video',
      })
    );

    await act(async () => {
      await result.current[1].start();
    });

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0].message).toEqual('foobar');
  });
});
