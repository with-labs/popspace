import { renderHook } from '@testing-library/react-hooks';
import useLocalAudioToggle from './useLocalAudioToggle';
import useVideoContext from '../useVideoContext/useVideoContext';
import { useAppState } from '../../state';

import { useParticipantMeta } from '../../withHooks/useParticipantMeta/useParticipantMeta';
jest.mock('../../withHooks/useParticipantMeta/useParticipantMeta');
const mockUseParticipantMeta = useParticipantMeta as jest.Mock<any>;
mockUseParticipantMeta.mockImplementation(() => ({}));

jest.mock('../useVideoContext/useVideoContext');
const mockUseVideoContext = useVideoContext as jest.Mock<any>;

jest.mock('../useIsTrackEnabled/useIsTrackEnabled', () => () => true);

// Mock the app state context because this hook can set an error in the app state.
jest.mock('../../state');
const mockUseAppState = useAppState as jest.Mock<any>;
mockUseAppState.mockImplementation(() => ({ setError: () => ({}) }));

describe('the useLocalAudioToggle hook', () => {
  it('should return the value from the useIsTrackEnabled hook', () => {
    const mockLocalTrack = {
      kind: 'audio',
      isEnabled: true,
      enable: jest.fn(),
      disable: jest.fn(),
    };

    mockUseVideoContext.mockImplementation(() => ({
      localTracks: [mockLocalTrack],
      room: { localParticipant: {} },
    }));

    const { result } = renderHook(useLocalAudioToggle);
    expect(result.current).toEqual([true, expect.any(Function)]);
  });

  describe('toggleAudioEnabled function', () => {
    it('should call track.disable when track is enabled', () => {
      const mockLocalTrack = {
        kind: 'audio',
        isEnabled: true,
        enable: jest.fn(),
        disable: jest.fn(),
        stop: jest.fn(),
      };

      const unPubMock = jest.fn();
      const emitMock = jest.fn();
      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [mockLocalTrack],
        room: { localParticipant: { unpublishTrack: unPubMock, emit: emitMock } },
      }));

      const { result } = renderHook(useLocalAudioToggle);
      result.current[1]();

      expect(mockLocalTrack.stop).toHaveBeenCalled();
      expect(unPubMock).toHaveBeenCalled();
      expect(emitMock).toHaveBeenCalled();
    });

    it('should call track.enable when track is disabled', done => {
      const mockLocalTrack = {
        kind: 'audio',
        isEnabled: false,
        enable: jest.fn(),
        disable: jest.fn(),
        stop: jest.fn(),
      };

      const pubMock = jest.fn();
      const getTrackMock = jest.fn().mockResolvedValue(mockLocalTrack);
      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [],
        room: { localParticipant: { publishTrack: pubMock } },
        getLocalAudioTrack: getTrackMock,
      }));

      const { result } = renderHook(useLocalAudioToggle);

      result.current[1]();

      expect(getTrackMock).toHaveBeenCalled();
      setImmediate(() => {
        expect(pubMock).toHaveBeenCalledWith(mockLocalTrack);
        done();
      });
    });
  });
});
