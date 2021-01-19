import React from 'react';
import { render } from '@testing-library/react';
import AudioTrack from './AudioTrack';
import { MediaReadinessContext } from '../MediaReadinessProvider/MediaReadinessProvider';
import { useSpatialAudioVolume } from '../../hooks/useSpatialAudioVolume/useSpatialAudioVolume';
jest.mock('../../hooks/useSpatialAudioVolume/useSpatialAudioVolume');
const mockUseSpatialAudioVolume = useSpatialAudioVolume as jest.Mock<any>;
mockUseSpatialAudioVolume.mockImplementation(() => {
  return { current: 1 };
});

describe('the AudioTrack component', () => {
  it('should call the attach method when the component mounts', () => {
    const mockTrack = { attach: jest.fn(), detach: jest.fn() } as any;
    render(<AudioTrack track={mockTrack} objectId="a" objectKind="widget" />, {
      wrapper: ({ children }) => (
        <MediaReadinessContext.Provider value={{ isReady: true, onReady: jest.fn() }}>
          {children}
        </MediaReadinessContext.Provider>
      ),
    });
    expect(mockTrack.attach).toHaveBeenCalledWith(expect.any(window.HTMLAudioElement));
    expect(mockTrack.detach).not.toHaveBeenCalled();
  });

  it('it should call the detach method when the component unmounts', () => {
    const mockTrack = { attach: jest.fn(), detach: jest.fn() } as any;
    const { unmount } = render(<AudioTrack track={mockTrack} objectId="a" objectKind="widget" />, {
      wrapper: ({ children }) => (
        <MediaReadinessContext.Provider value={{ isReady: true, onReady: jest.fn() }}>
          {children}
        </MediaReadinessContext.Provider>
      ),
    });
    unmount();
    expect(mockTrack.detach).toHaveBeenCalledWith(expect.any(window.HTMLAudioElement));
  });
});
