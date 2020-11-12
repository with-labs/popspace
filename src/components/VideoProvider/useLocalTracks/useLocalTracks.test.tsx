/* eslint-disable import/first */
/**
 * #WITH_EDIT
 *
 * Aug. 6, 2020 WQP
 * - Updated to latest twilio-video starter app code
 * - Added updates for video off by default and local data tracks
 */
class MockLocalDataTrack {}
class MockLocalAudioTrack {
  kind = 'audio';
  stop = jest.fn();
}
class MockLocalVideoTrack {
  stop = jest.fn();
  kind = 'video';
}
jest.mock('twilio-video', () => ({
  ...(jest.requireActual('twilio-video') as any),
  LocalDataTrack: MockLocalDataTrack,
  LocalVideoTrack: MockLocalVideoTrack,
  LocalAudioTrack: MockLocalAudioTrack,
  createLocalAudioTrack: jest.fn().mockResolvedValue(new MockLocalAudioTrack()),
  createLocalVideoTrack: jest.fn().mockResolvedValue(new MockLocalVideoTrack()),
}));

import { act, renderHook } from '@testing-library/react-hooks';
import useLocalTracks from './useLocalTracks';
import { LocalVideoTrack, createLocalAudioTrack } from 'twilio-video';

describe('the useLocalTracks hook', () => {
  afterEach(jest.clearAllMocks);

  it('should return an array of tracks and methods to initialize tracks', async () => {
    const onError = jest.fn();
    const { result } = renderHook(() => useLocalTracks(onError));
    // on the first frame, before we initialize audio track, we just have the data track
    expect(result.current.localTracks).toEqual([expect.any(MockLocalDataTrack)]);
    // it provides a way to initialize a video track
    expect(result.current.getLocalVideoTrack).toEqual(expect.any(Function));
  });

  it('should create an audio track by default when loaded', async () => {
    const onError = jest.fn();
    const { waitFor, result } = renderHook(() => useLocalTracks(onError));
    // wait for effect to complete and create the audio track
    await waitFor(() => expect(createLocalAudioTrack).toHaveBeenCalled());
    // after the initial useEffect runs, we have our audio track and data track.
    expect(result.current.localTracks).toEqual([expect.any(MockLocalAudioTrack), expect.any(MockLocalDataTrack)]);
  });

  describe('the removeLocalVideoTrack function', () => {
    it('can add a video track, then remove the video track, which calls videoTrack.stop()', async () => {
      const onError = jest.fn();
      const { result } = renderHook(() => useLocalTracks(onError));
      // initialize a video track
      await act(async () => {
        await result.current.getLocalVideoTrack();
      });
      // retrieve the video track
      const initialVideoTrack = result.current.localTracks.find((track) => track.kind === 'video') as LocalVideoTrack;
      expect(initialVideoTrack!.stop).not.toHaveBeenCalled();
      expect(initialVideoTrack).toBeTruthy();

      // stop the video track
      act(() => {
        result.current.removeLocalVideoTrack();
      });

      expect(result.current.localTracks.some((track) => track.kind === 'video')).toBe(false);
      expect(initialVideoTrack!.stop).toHaveBeenCalled();
    });
  });
});
