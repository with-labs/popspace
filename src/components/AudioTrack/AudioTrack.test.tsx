import React from 'react';
import { render } from '@testing-library/react';
import AudioTrack from './AudioTrack';
import { MediaReadinessContext } from '../MediaReadinessProvider/MediaReadinessProvider';

describe('the AudioTrack component', () => {
  it('should call the attach method when the component mounts', () => {
    const mockTrack = { attach: jest.fn(), detach: jest.fn() } as any;
    render(<AudioTrack track={mockTrack} volume={1} />, {
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
    const { unmount } = render(<AudioTrack track={mockTrack} volume={1} />, {
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
