import { renderHook, act } from '@testing-library/react-hooks';
import useLocalAudioToggle from './useLocalAudioToggle';
import { useLocalTracks } from '../../components/LocalTracksProvider/useLocalTracks';

jest.mock('../../components/LocalTracksProvider/useLocalTracks');
const mockUseLocalTracks = useLocalTracks as jest.Mock<any>;

jest.mock('../useIsTrackEnabled/useIsTrackEnabled', () => () => true);

describe('the useLocalAudioToggle hook', () => {
  it('should indicate enabled when the audio track is live', () => {
    mockUseLocalTracks.mockImplementation(() => ({
      audioTrack: {}, // not falsy
      startAudio: jest.fn(),
      stopAudio: jest.fn(),
    }));

    const { result } = renderHook(useLocalAudioToggle);
    expect(result.current).toEqual([true, expect.any(Function)]);
  });

  describe('toggleAudioEnabled function', () => {
    it('should stop audio when track is enabled', () => {
      const stopAudio = jest.fn();
      const startAudio = jest.fn();
      mockUseLocalTracks.mockImplementation(() => ({
        audioTrack: {},
        stopAudio,
        startAudio,
      }));

      const { result } = renderHook(useLocalAudioToggle);
      act(() => {
        result.current[1]();
      });
      expect(stopAudio).toHaveBeenCalled();
      expect(startAudio).not.toHaveBeenCalled();
    });

    it('should start audio when track is disabled', () => {
      const stopAudio = jest.fn();
      const startAudio = jest.fn();
      mockUseLocalTracks.mockImplementation(() => ({
        audioTrack: null,
        startAudio,
        stopAudio,
      }));

      const { result } = renderHook(useLocalAudioToggle);
      act(() => {
        result.current[1]();
      });
      expect(stopAudio).not.toHaveBeenCalled();
      expect(startAudio).toHaveBeenCalled();
    });
  });
});
