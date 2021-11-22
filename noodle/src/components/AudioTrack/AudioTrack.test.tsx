import React from 'react';
import { render } from '@testing-library/react';
import AudioTrack from './AudioTrack';
import { useSpatialAudioVolume } from '@hooks/useSpatialAudioVolume/useSpatialAudioVolume';
jest.mock('@hooks/useSpatialAudioVolume/useSpatialAudioVolume');
const mockUseSpatialAudioVolume = useSpatialAudioVolume as jest.Mock<any>;
mockUseSpatialAudioVolume.mockImplementation(() => {
  return { current: 1 };
});
jest.mock('@providers/media/useMediaReadiness', () => ({
  useMediaReadiness: jest.fn(() => true),
}));

describe('the AudioTrack component', () => {
  it('should call the attach method when the component mounts', () => {
    const mockTrack = { attach: jest.fn(), detach: jest.fn() } as any;
    render(<AudioTrack track={mockTrack} objectId="a" objectKind="widget" />);
    expect(mockTrack.attach).toHaveBeenCalledWith(expect.any(window.HTMLAudioElement));
    expect(mockTrack.detach).not.toHaveBeenCalled();
  });

  it('it should call the detach method when the component unmounts', () => {
    const mockTrack = { attach: jest.fn(), detach: jest.fn() } as any;
    const { unmount } = render(<AudioTrack track={mockTrack} objectId="a" objectKind="widget" />);
    unmount();
    expect(mockTrack.detach).toHaveBeenCalledWith(expect.any(window.HTMLAudioElement));
  });
});
