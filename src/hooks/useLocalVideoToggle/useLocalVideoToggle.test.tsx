import { act, renderHook } from '@testing-library/react-hooks';
import { useLocalTracks } from '../../components/LocalTracksProvider/useLocalTracks';
import useLocalVideoToggle from './useLocalVideoToggle';

jest.mock('../../components/LocalTracksProvider/useLocalTracks');
const mockUseLocalTracks = useLocalTracks as jest.Mock<any>;

jest.mock('../useIsTrackEnabled/useIsTrackEnabled', () => () => true);

describe('the useLocalVideoToggle hook', () => {
  it('should indicate enabled when the audio track is live', () => {
    mockUseLocalTracks.mockImplementation(() => ({
      videoTrack: {}, // not falsy
      startVideo: jest.fn(),
      stopVideo: jest.fn(),
    }));

    const { result } = renderHook(useLocalVideoToggle);
    expect(result.current).toEqual([true, expect.any(Function)]);
  });

  describe('toggleAudioEnabled function', () => {
    it('should stop audio when track is enabled', () => {
      const stopVideo = jest.fn();
      const startVideo = jest.fn();
      mockUseLocalTracks.mockImplementation(() => ({
        videoTrack: {},
        stopVideo,
        startVideo,
      }));

      const { result } = renderHook(useLocalVideoToggle);
      act(() => {
        result.current[1]();
      });
      expect(stopVideo).toHaveBeenCalled();
      expect(startVideo).not.toHaveBeenCalled();
    });

    it('should start audio when track is disabled', () => {
      const stopVideo = jest.fn();
      const startVideo = jest.fn();
      mockUseLocalTracks.mockImplementation(() => ({
        videoTrack: null,
        startVideo,
        stopVideo,
      }));

      const { result } = renderHook(useLocalVideoToggle);
      act(() => {
        result.current[1]();
      });
      expect(stopVideo).not.toHaveBeenCalled();
      expect(startVideo).toHaveBeenCalled();
    });
  });
});
