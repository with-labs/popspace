import React from 'react';
import Publication from './Publication';
import { render } from '@testing-library/react';
import useTrack from '../../hooks/useTrack/useTrack';
import { useSpatialAudioVolume } from '../../withHooks/useSpatialAudioVolume/useSpatialAudioVolume';
import { Provider } from 'react-redux';
import store from '../../state/store';

jest.mock('../../hooks/useTrack/useTrack');
const mockUseTrack = useTrack as jest.Mock<any>;

jest.mock('../../withHooks/useSpatialAudioVolume/useSpatialAudioVolume');
const mockUseSpatialAudioVolume = useSpatialAudioVolume as jest.Mock<any>;
mockUseSpatialAudioVolume.mockImplementation(() => 0.5);

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
      const wrapper = render(
        <Provider store={store}>
          <Publication isLocal publication={'mockPublication' as any} participant={'mockParticipant' as any} />
        </Provider>
      );
      expect(useTrack).toHaveBeenCalledWith('mockPublication');
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
      const wrapper = render(
        <Provider store={store}>
          <Publication isLocal publication={'mockPublication' as any} participant={'mockParticipant' as any} />
        </Provider>
      );
      expect(useTrack).toHaveBeenCalledWith('mockPublication');
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
      const wrapper = render(
        <Provider store={store}>
          <Publication isLocal publication={'mockPublication' as any} participant={'mockParticipant' as any} />
        </Provider>
      );
      expect(useTrack).toHaveBeenCalledWith('mockPublication');
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
        <Provider store={store}>
          <Publication isLocal publication={'mockPublication' as any} participant={'mockParticipant' as any} />
        </Provider>
      );
      expect(useTrack).toHaveBeenCalledWith('mockPublication');
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
        <Provider store={store}>
          <Publication
            isLocal
            publication={'mockPublication' as any}
            participant={'mockParticipant' as any}
            disableAudio={true}
          />
        </Provider>
      );
      expect(useTrack).toHaveBeenCalledWith('mockPublication');
      expect(wrapper.container.querySelectorAll('audio').length).toBe(0);
    });
  });

  it('should render null when there is no track', () => {
    mockUseTrack.mockImplementation(() => null);
    const wrapper = render(
      <Provider store={store}>
        <Publication isLocal publication={'mockPublication' as any} participant={'mockParticipant' as any} />
      </Provider>
    );
    expect(useTrack).toHaveBeenCalledWith('mockPublication');
    expect(wrapper.container.querySelectorAll('*').length).toBe(0);
  });
});
