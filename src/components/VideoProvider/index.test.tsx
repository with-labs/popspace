import { EventEmitter } from 'events';
import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { Room, TwilioError } from 'twilio-video';
import { VideoProvider } from './index';
import useRoom from './useRoom/useRoom';
import useHandleRoomDisconnectionErrors from './useHandleRoomDisconnectionErrors/useHandleRoomDisconnectionErrors';
import useHandleTrackPublicationFailed from './useHandleTrackPublicationFailed/useHandleTrackPublicationFailed';
import useHandleOnDisconnect from './useHandleOnDisconnect/useHandleOnDisconnect';
import { useLocalTrackPublications } from './useLocalTrackPublications/useLocalTrackPublications';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { Provider } from 'react-redux';
import store from '../../state/store';

const mockRoom = new EventEmitter() as Room;
const mockOnDisconnect = jest.fn();
jest.mock('./useRoom/useRoom', () => jest.fn(() => ({ room: mockRoom, isConnecting: false, connect: jest.fn() })));
jest.mock('./useHandleRoomDisconnectionErrors/useHandleRoomDisconnectionErrors');
jest.mock('./useHandleTrackPublicationFailed/useHandleTrackPublicationFailed');
jest.mock('./useHandleTrackPublicationFailed/useHandleTrackPublicationFailed');
jest.mock('./useHandleOnDisconnect/useHandleOnDisconnect');
jest.mock('./useLocalTrackPublications/useLocalTrackPublications');
jest.mock('../../hooks/useLocalVideoToggle/useLocalVideoToggle', () => () => [true, jest.fn()]);
jest.mock('./useAllParticipants/useAllParticipants', () => ({ useAllParticipants: () => [] }));

describe('the VideoProvider component', () => {
  it('should correctly return the Video Context object', () => {
    const wrapper: React.FC = ({ children }) => (
      <Provider store={store}>
        <VideoProvider onError={() => {}} onDisconnect={mockOnDisconnect} options={{ dominantSpeaker: true }}>
          {children}
        </VideoProvider>
      </Provider>
    );
    const { result } = renderHook(useVideoContext, { wrapper });
    expect(result.current).toEqual({
      isConnecting: false,
      room: mockRoom,
      onError: expect.any(Function),
      onDisconnect: mockOnDisconnect,
      connect: expect.any(Function),
      allParticipants: [],
    });
    expect(useRoom).toHaveBeenCalledWith(expect.any(Function), {
      dominantSpeaker: true,
    });
    expect(useLocalTrackPublications).toHaveBeenCalled();
    expect(useHandleRoomDisconnectionErrors).toHaveBeenCalledWith(mockRoom, expect.any(Function));
    expect(useHandleTrackPublicationFailed).toHaveBeenCalledWith(mockRoom, expect.any(Function));
    expect(useHandleOnDisconnect).toHaveBeenCalledWith(mockRoom, mockOnDisconnect);
  });

  it('should call the onError function when there is an error', () => {
    const mockOnError = jest.fn();
    const wrapper: React.FC = ({ children }) => (
      <Provider store={store}>
        <VideoProvider onError={mockOnError} onDisconnect={mockOnDisconnect} options={{ dominantSpeaker: true }}>
          {children}
        </VideoProvider>
      </Provider>
    );
    const { result } = renderHook(useVideoContext, { wrapper });
    result.current.onError({} as TwilioError);
    expect(mockOnError).toHaveBeenCalledWith({});
  });
});
