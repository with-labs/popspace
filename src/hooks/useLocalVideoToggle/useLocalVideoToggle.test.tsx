import { renderHook } from '@testing-library/react-hooks';
import useLocalVideoToggle from './useLocalVideoToggle';
import useVideoContext from '../useVideoContext/useVideoContext';
import { useAppState } from '../../state';
import { EventEmitter } from 'events';
import { LocalParticipant } from 'twilio-video';

import { useParticipantMeta } from '../../withHooks/useParticipantMeta/useParticipantMeta';
jest.mock('../../withHooks/useParticipantMeta/useParticipantMeta');
const mockUseParticipantMeta = useParticipantMeta as jest.Mock<any>;
mockUseParticipantMeta.mockImplementation(() => ({}));

jest.mock('../useVideoContext/useVideoContext');
const mockUseVideoContext = useVideoContext as jest.Mock<any>;

// Mock the app state context because this hook can set an error in the app state.
jest.mock('../../state');
const mockUseAppState = useAppState as jest.Mock<any>;
mockUseAppState.mockImplementation(() => ({ setError: () => ({}) }));

describe('the useLocalVideoToggle hook', () => {
  it('should return true when a localVideoTrack exists', () => {
    mockUseVideoContext.mockImplementation(() => ({
      localTracks: [
        {
          name: 'camera',
        },
      ],
      room: { localParticipant: {} },
    }));

    const { result } = renderHook(useLocalVideoToggle);
    expect(result.current).toEqual([true, expect.any(Function)]);
  });

  it('should return false when a localVideoTrack does not exist', () => {
    mockUseVideoContext.mockImplementation(() => ({
      localTracks: [
        {
          name: 'microphone',
        },
      ],
      room: { localParticipant: {} },
    }));

    const { result } = renderHook(useLocalVideoToggle);
    expect(result.current).toEqual([false, expect.any(Function)]);
  });

  describe('toggleAudioEnabled function', () => {
    it('should call track.stop when a localVideoTrack exists', () => {
      const mockLocalTrack = {
        name: 'camera',
        stop: jest.fn(),
      };

      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [mockLocalTrack],
        room: { localParticipant: null },
      }));

      const { result } = renderHook(useLocalVideoToggle);
      result.current[1]();
      expect(mockLocalTrack.stop).toHaveBeenCalled();
    });

    it('should call localParticipant.unpublishTrack when a localVideoTrack and localParticipant exists', () => {
      const mockLocalTrack = {
        name: 'camera',
        stop: jest.fn(),
      };

      const mockLocalParticipant = new EventEmitter() as LocalParticipant;
      mockLocalParticipant.unpublishTrack = jest.fn();

      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [mockLocalTrack],
        room: { localParticipant: mockLocalParticipant },
      }));

      const { result } = renderHook(useLocalVideoToggle);
      result.current[1]();
      expect(mockLocalParticipant.unpublishTrack).toHaveBeenCalledWith(mockLocalTrack);
    });

    it('should call getLocalVideoTrack when a localVideoTrack does not exist', () => {
      const mockGetLocalVideoTrack = jest.fn(() => Promise.resolve());
      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [],
        getLocalVideoTrack: mockGetLocalVideoTrack,
        room: {},
      }));

      const { result } = renderHook(useLocalVideoToggle);
      result.current[1]();
      expect(mockGetLocalVideoTrack).toHaveBeenCalled();
    });

    it('should call mockLocalParticipant.publishTrack when a localVideoTrack does not exist and localParticipant does exist', done => {
      const mockGetLocalVideoTrack = jest.fn(() => Promise.resolve('mockTrack'));

      const mockLocalParticipant = new EventEmitter() as LocalParticipant;
      mockLocalParticipant.publishTrack = jest.fn();

      mockUseVideoContext.mockImplementation(() => ({
        localTracks: [],
        getLocalVideoTrack: mockGetLocalVideoTrack,
        room: { localParticipant: mockLocalParticipant },
      }));

      const { result } = renderHook(useLocalVideoToggle);
      result.current[1]();
      setImmediate(() => {
        expect(mockLocalParticipant.publishTrack).toHaveBeenCalledWith('mockTrack');
        done();
      });
    });
  });
});
