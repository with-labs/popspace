import { act, renderHook } from '@testing-library/react-hooks';
import useLocalTracks from './useLocalTracks';
import Video from 'twilio-video';
import { EventEmitter } from 'events';
import * as TV from 'twilio-video';

// WARNING, this is a big no-no, BUT LocalDataTrack is undefined in the unit testing env for some unknown reason.
// The only way I could get the tests working was to monkey patch LocalDataTrack back into the module.
class LDT {}
// @ts-ignore
TV.LocalDataTrack = LDT;

describe('the useLocalTracks hook', () => {
  it('should return an array of tracks and two functions', async () => {
    const { result, waitForNextUpdate } = renderHook(useLocalTracks);
    // LocalDataTrack is always present.
    expect(result.current.localTracks).toEqual([expect.any(LDT)]);
    await waitForNextUpdate();
    expect(result.current.localTracks).toEqual([expect.any(EventEmitter), expect.any(EventEmitter), expect.any(LDT)]);
    expect(result.current.getLocalVideoTrack).toEqual(expect.any(Function));
  });

  it('should be called with the correct arguments', async () => {
    const { waitForNextUpdate } = renderHook(useLocalTracks);
    await waitForNextUpdate();
    expect(Video.createLocalAudioTrack).toHaveBeenCalled();
    expect(Video.createLocalVideoTrack).toHaveBeenCalledWith({
      frameRate: 24,
      height: 720,
      width: 1280,
      name: 'camera',
    });
  });

  it('should respond to "stopped" events from the local video track', async () => {
    const { result, waitForNextUpdate } = renderHook(useLocalTracks);
    await waitForNextUpdate();
    expect(result.current.localTracks).toEqual([expect.any(EventEmitter), expect.any(EventEmitter), expect.any(LDT)]);
    act(() => {
      result.current.localTracks[0].emit('stopped');
      result.current.localTracks[1].emit('stopped');
    });
    // LocalDataTrack is always present and cannot be stopped.
    expect(result.current.localTracks).toEqual([expect.any(LDT)]);
  });
});
