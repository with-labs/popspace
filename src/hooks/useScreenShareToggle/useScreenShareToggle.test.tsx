import { renderHook, act } from '@testing-library/react-hooks';
import useScreenShareToggle from './useScreenShareToggle';
import useVideoContext from '../useVideoContext/useVideoContext';
import { EventEmitter } from 'events';
jest.mock('../useVideoContext/useVideoContext');

const mockedVideoContext = useVideoContext as jest.Mock<any>;

const mockLocalParticipant = new EventEmitter() as any;
mockLocalParticipant.publishTrack = jest.fn(track => {
  mockLocalParticipant.tracks.set('abc123', mockPub);
  return Promise.resolve(mockPub);
});
mockLocalParticipant.unpublishTrack = jest.fn(track => {
  mockLocalParticipant.tracks.clear();
  return mockPub;
});
mockLocalParticipant.tracks = new Map();

mockedVideoContext.mockImplementation(() => ({
  room: {
    localParticipant: mockLocalParticipant,
  },
}));

const mockTrack: any = { stop: jest.fn() };

const mockPub: any = { trackName: 'screen', track: mockTrack };

const mockMediaDevices = {
  value: {
    getDisplayMedia: jest.fn(() =>
      Promise.resolve({
        getTracks: jest.fn(() => [mockTrack]),
      })
    ),
  } as any,
};

Object.defineProperty(navigator, 'mediaDevices', mockMediaDevices);

describe('the useScreenShareToggle hook', () => {
  beforeEach(() => {
    delete mockTrack.onended;
    jest.clearAllMocks();
    mockLocalParticipant.tracks.clear();
  });

  it('should return a default value of false', () => {
    const { result } = renderHook(useScreenShareToggle);
    expect(result.current).toEqual([false, expect.any(Function)]);
  });

  describe('toggle function', () => {
    it('should call localParticipant.publishTrack with the correct arguments when isSharing is false', async () => {
      const { result, waitForNextUpdate } = renderHook(useScreenShareToggle);
      result.current[1]();
      await waitForNextUpdate();
      expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalled();
      expect(mockLocalParticipant.publishTrack).toHaveBeenCalledWith(mockTrack, { name: 'screen', priority: 'high' });
      expect(result.current[0]).toEqual(true);
    });

    it('should correctly stop screen sharing when isSharing is true', async () => {
      const localParticipantSpy = jest.spyOn(mockLocalParticipant, 'emit');
      const { result, waitForNextUpdate } = renderHook(useScreenShareToggle);
      expect(mockTrack.onended).toBeUndefined();
      result.current[1]();
      await waitForNextUpdate();
      expect(result.current[0]).toEqual(true);
      act(() => {
        result.current[1]();
      });
      expect(mockLocalParticipant.unpublishTrack).toHaveBeenCalledWith(mockTrack);
      expect(localParticipantSpy).toHaveBeenCalledWith('trackUnpublished', mockPub);
      expect(mockTrack.stop).toHaveBeenCalled();
      expect(result.current[0]).toEqual(false);
    });

    describe('onended function', () => {
      it('should correctly stop screen sharing when called', async () => {
        const localParticipantSpy = jest.spyOn(mockLocalParticipant, 'emit');
        const { result, waitForNextUpdate } = renderHook(useScreenShareToggle);
        expect(mockTrack.onended).toBeUndefined();
        result.current[1]();
        await waitForNextUpdate();
        expect(mockTrack.onended).toEqual(expect.any(Function));
        act(() => {
          mockTrack.onended();
        });
        expect(mockLocalParticipant.unpublishTrack).toHaveBeenCalledWith(mockTrack);
        expect(localParticipantSpy).toHaveBeenCalledWith('trackUnpublished', mockPub);
        expect(mockTrack.stop).toHaveBeenCalled();
        expect(result.current[0]).toEqual(false);
      });
    });
  });
});
