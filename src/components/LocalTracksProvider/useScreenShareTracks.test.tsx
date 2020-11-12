import { renderHook, act } from '@testing-library/react-hooks';
import { useScreenShareTracks } from './useScreenShareTracks';
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

    const { result } = renderHook(() => useScreenShareTracks({}));

    expect(result.current[0]).toEqual({
      screenShareVideoTrack: null,
      screenShareAudioTrack: null,
    });

    await act(async () => {
      await result.current[1]();
    });

    expect(result.current[0]).toEqual({
      screenShareVideoTrack: videoTrack,
      screenShareAudioTrack: audioTrack,
    });
    // @ts-ignore
    expect(global.navigator.mediaDevices.getDisplayMedia).toHaveBeenCalledWith({
      video: true,
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
      result.current[2]();
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

    const { result } = renderHook(() => useScreenShareTracks({}));

    await act(async () => {
      await result.current[1]();
    });

    expect(result.current[0]).toEqual({
      screenShareVideoTrack: videoTrack,
      screenShareAudioTrack: null,
    });

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

    const { result } = renderHook(() => useScreenShareTracks({}));

    await act(async () => {
      await result.current[1]();
    });

    expect(result.current[0]).toEqual({
      screenShareAudioTrack: audioTrack,
      screenShareVideoTrack: null,
    });

    act(() => {
      audioTrack.emit('ended');
    });

    expect(result.current[0]).toEqual({
      screenShareVideoTrack: null,
      screenShareAudioTrack: null,
    });
  });

  it('can "restart" a track (replace it with a new source)', async () => {
    const track = new MockMediaTrack('audio', 'mock track', 'default');
    // @ts-ignore
    global.navigator.mediaDevices.getDisplayMedia = jest.fn().mockResolvedValue(new MockMediaStream([], [track]));

    const { result } = renderHook(() => useScreenShareTracks({}));

    // the initial start
    await act(async () => {
      await result.current[1]();
    });

    expect(result.current[0]).toEqual({
      screenShareVideoTrack: track,
      screenShareAudioTrack: null,
    });

    // the restart
    const newTrack = new MockMediaTrack('audio', 'track 2', 'default');
    // @ts-ignore
    global.navigator.mediaDevices.getDisplayMedia = jest.fn().mockResolvedValue(new MockMediaStream([], [newTrack]));
    await act(async () => {
      await result.current[1]();
    });

    expect(result.current[0]).toEqual({
      screenShareVideoTrack: newTrack,
      screenShareAudioTrack: null,
    });
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
      })
    );

    await act(async () => {
      await result.current[1]();
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
      })
    );

    await act(async () => {
      await result.current[1]();
    });

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0].message).toEqual('foobar');
  });
});
