import { EventEmitter } from 'events';
import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { Room } from 'twilio-video';
import { VideoProvider } from './index';
import useRoom from './useRoom/useRoom';
import useHandleTrackPublicationFailed from './useHandleTrackPublicationFailed/useHandleTrackPublicationFailed';
import { useLocalTrackPublications } from './useLocalTrackPublications/useLocalTrackPublications';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

const mockRoom = new EventEmitter() as Room;
jest.mock('./useRoom/useRoom', () => jest.fn(() => ({ room: mockRoom, isConnecting: false, connect: jest.fn() })));
jest.mock('./useHandleTrackPublicationFailed/useHandleTrackPublicationFailed');
jest.mock('./useHandleTrackPublicationFailed/useHandleTrackPublicationFailed');
jest.mock('./useLocalTrackPublications/useLocalTrackPublications');
jest.mock('../../hooks/localMediaToggles/useLocalVideoToggle', () => () => [true, jest.fn(), false]);
jest.mock('./useAllParticipants/useAllParticipants', () => ({ useAllParticipants: () => [] }));

describe('the VideoProvider component', () => {
  it('should correctly return the Video Context object', () => {
    const wrapper: React.FC = ({ children }) => (
      <VideoProvider onError={() => {}} options={{ dominantSpeaker: true }} roomName="room">
        {children}
      </VideoProvider>
    );
    const { result } = renderHook(useVideoContext, { wrapper });
    expect(result.current).toEqual({
      isConnecting: false,
      room: mockRoom,
      allParticipants: [],
    });
    expect(useRoom).toHaveBeenCalledWith(expect.any(Function), {
      dominantSpeaker: true,
    });
    expect(useLocalTrackPublications).toHaveBeenCalled();
    expect(useHandleTrackPublicationFailed).toHaveBeenCalledWith(mockRoom, expect.any(Function));
  });
});
