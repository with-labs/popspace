/**
 * #WITH_EDIT
 *
 * Aug. 6, 2020 WQP
 * - Updated to latest twilio-video starter app code
 * - Added updates for video off by default and local data tracks
 */

import { act, renderHook } from '@testing-library/react-hooks';
import useLocalTracks from './useLocalTracks';
import Video, { LocalVideoTrack } from 'twilio-video';
import { EventEmitter } from 'events';

// WARNING, this is a big no-no, BUT LocalDataTrack is undefined in the unit testing env for some unknown reason.
// The only way I could get the tests working was to monkey patch LocalDataTrack back into the module.
import * as TV from 'twilio-video';
class LDT {}
// @ts-ignore
TV.LocalDataTrack = LDT;

describe('the useLocalTracks hook', () => {
  afterEach(jest.clearAllMocks);

  it('should return an array of tracks and two functions', async () => {
    const { result, waitForNextUpdate } = renderHook(useLocalTracks);
    expect(result.current.localTracks).toEqual([]);
    await waitForNextUpdate();
    expect(result.current.localTracks).toEqual([expect.any(EventEmitter), expect.any(EventEmitter), expect.any(LDT)]);
    expect(result.current.getLocalVideoTrack).toEqual(expect.any(Function));
  });

  it('should create only a audio and video local track by default when loaded', async () => {
    Date.now = () => 123456;
    const { waitForNextUpdate } = renderHook(useLocalTracks);
    await waitForNextUpdate();
    expect(Video.createLocalTracks).toHaveBeenCalledWith({
      audio: true,
    });
  });

  describe('the removeLocalVideoTrack function', () => {
    it('should call videoTrack.stop() and remove the videoTrack from state', async () => {
      const { result, waitForNextUpdate } = renderHook(useLocalTracks);
      await waitForNextUpdate();
      const initialVideoTrack = result.current.localTracks.find(track => track.kind === 'video') as LocalVideoTrack;
      expect(initialVideoTrack!.stop).not.toHaveBeenCalled();
      expect(initialVideoTrack).toBeTruthy();

      act(() => {
        result.current.removeLocalVideoTrack();
      });

      expect(result.current.localTracks.some(track => track.kind === 'video')).toBe(false);
      expect(initialVideoTrack!.stop).toHaveBeenCalled();
    });
  });
});
