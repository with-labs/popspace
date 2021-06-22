import React from 'react';
import Publication from './Publication';
import { render } from '@testing-library/react';
import useTrack from '@providers/twilio/hooks/useTrack';
import { useSpatialAudioVolume } from '@hooks/useSpatialAudioVolume/useSpatialAudioVolume';
import { MediaReadinessContext } from '../MediaReadinessProvider/MediaReadinessProvider';
import { CAMERA_TRACK_NAME } from '@constants/User';

jest.mock('@providers/twilio/hooks/useTrack');
const mockUseTrack = useTrack as jest.Mock<any>;

jest.mock('@hooks/useSpatialAudioVolume/useSpatialAudioVolume');
const mockUseSpatialAudioVolume = useSpatialAudioVolume as jest.Mock<any>;
mockUseSpatialAudioVolume.mockImplementation(() => {
  return { current: 1 };
});

jest.mock('@providers/canvas/CanvasObject', () => ({
  useCanvasObject: jest.fn(() => ({ mediaGroup: null, objectId: 'mockParticipant', objectKind: 'widget' })),
}));

describe('the Publication component', () => {
  describe('when track.kind is "video"', () => {
    it('should render a VideoTrack', () => {
      mockUseTrack.mockImplementation(() => ({
        kind: 'video',
        name: 'camera',
        attach: jest.fn(),
        detach: jest.fn(),
        setPriority: jest.fn(),
      }));
      const wrapper = render(<Publication isLocal publication={{ trackName: 'trackName' } as any} />);
      expect(useTrack).toHaveBeenCalledWith({ trackName: 'trackName' });
      expect(wrapper.container.querySelectorAll('video').length).toBe(1);
    });

    it('doesn\'t mirror local videos which aren\'t "camera"', () => {
      mockUseTrack.mockImplementation(() => ({
        kind: 'video',
        name: 'screen',
        attach: jest.fn(),
        detach: jest.fn(),
        setPriority: jest.fn(),
      }));
      const wrapper = render(<Publication isLocal publication={{ trackName: 'trackName' } as any} />);
      expect(useTrack).toHaveBeenCalledWith({ trackName: 'trackName' });
      expect(wrapper.container.querySelector('video')?.style.transform).not.toBe('rotateY(180deg)');
    });

    it('should mirror video when local track is "camera"', () => {
      mockUseTrack.mockImplementation(() => ({
        kind: 'video',
        name: 'camera',
        attach: jest.fn(),
        detach: jest.fn(),
        setPriority: jest.fn(),
      }));
      const wrapper = render(<Publication isLocal publication={{ trackName: `${CAMERA_TRACK_NAME}#foo` } as any} />);
      expect(useTrack).toHaveBeenCalledWith({ trackName: `${CAMERA_TRACK_NAME}#foo` });
      expect(wrapper.container.querySelector('video')?.style.transform).toBe('rotateY(180deg)');
    });
  });
  describe('when track.kind is "audio"', () => {
    it('should render an AudioTrack', () => {
      mockUseTrack.mockImplementation(() => ({
        kind: 'audio',
        name: 'mic',
        attach: jest.fn(),
        detach: jest.fn(),
        setPriority: jest.fn(),
      }));
      const wrapper = render(
        <MediaReadinessContext.Provider value={{ isReady: true, onReady: jest.fn(), resetReady: jest.fn() }}>
          <Publication isLocal publication={{ trackName: 'trackName' } as any} />
        </MediaReadinessContext.Provider>
      );
      expect(useTrack).toHaveBeenCalledWith({ trackName: 'trackName' });
      expect(wrapper.container.querySelectorAll('audio').length).toBe(1);
    });

    it('should render null when disableAudio is true', () => {
      mockUseTrack.mockImplementation(() => ({
        kind: 'audio',
        name: 'mic',
        attach: jest.fn(),
        detach: jest.fn(),
        setPriority: jest.fn(),
      }));
      const wrapper = render(
        <MediaReadinessContext.Provider value={{ isReady: true, onReady: jest.fn(), resetReady: jest.fn() }}>
          <Publication isLocal publication={{ trackName: 'trackName' } as any} disableAudio={true} />
        </MediaReadinessContext.Provider>
      );
      expect(useTrack).toHaveBeenCalledWith({ trackName: 'trackName' });
      expect(wrapper.container.querySelectorAll('audio').length).toBe(0);
    });
  });

  it('should render null when there is no track', () => {
    mockUseTrack.mockImplementation(() => null);
    const wrapper = render(
      <MediaReadinessContext.Provider value={{ isReady: true, onReady: jest.fn(), resetReady: jest.fn() }}>
        <Publication isLocal publication={{ trackName: 'trackName' } as any} />
      </MediaReadinessContext.Provider>
    );
    expect(useTrack).toHaveBeenCalledWith({ trackName: 'trackName' });
    expect(wrapper.container.querySelectorAll('*').length).toBe(0);
  });
});
