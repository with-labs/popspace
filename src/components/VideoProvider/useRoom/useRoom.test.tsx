import { act, renderHook } from '@testing-library/react-hooks';
import { mockRoom } from '../../../__mocks__/twilio-video';
import useRoom from './useRoom';
import Video from 'twilio-video';

const mockVideoConnect = Video.connect as jest.Mock<any>;

describe('the useRoom hook', () => {
  beforeEach(jest.clearAllMocks);
  afterEach(() => mockRoom.removeAllListeners());

  it('should return an empty room when no token is provided', () => {
    const { result } = renderHook(() => useRoom(() => {}, {}));
    expect(result.current.room).toEqual(null);
  });

  it('should set isConnecting to true while connecting to the room ', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useRoom(() => {}, {}));
    expect(result.current.isConnecting).toBe(false);
    act(() => {
      result.current.connect('token');
    });
    expect(result.current.isConnecting).toBe(true);
    await waitForNextUpdate();
    expect(Video.connect).toHaveBeenCalledTimes(1);
    expect(result.current.room!.disconnect).not.toHaveBeenCalled();
    expect(result.current.isConnecting).toBe(false);
  });

  it('should return a room after connecting to a room', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useRoom(() => {}, {}));
    act(() => {
      result.current.connect('token');
    });
    await waitForNextUpdate();
    expect(result.current.room!.state).toEqual('connected');
  });

  it('should add a listener for the "beforeUnload" event when connected to a room', async () => {
    jest.spyOn(window, 'addEventListener');
    const { result, waitForNextUpdate } = renderHook(() => useRoom(() => {}, {}));
    act(() => {
      result.current.connect('token');
    });
    await waitForNextUpdate();
    expect(window.addEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('should call onError and set isConnecting to false when there is an error', async () => {
    const mockOnError = jest.fn();
    mockVideoConnect.mockImplementationOnce(() => Promise.reject('mockError'));
    const { result } = renderHook(() => useRoom(mockOnError, {}));
    await act(async () => {
      await result.current.connect('token');
    });
    expect(mockOnError).toHaveBeenCalledWith('mockError');
    expect(result.current.isConnecting).toBe(false);
  });

  it('should reset the room object on disconnect', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useRoom(() => {}, {}));
    act(() => {
      result.current.connect('token');
    });
    await waitForNextUpdate();
    expect(result.current.room!.state).toBe('connected');
    act(() => {
      result.current.room!.emit('disconnected', result.current.room!);
    });
    expect(result.current.room).toBe(null);
  });
});
