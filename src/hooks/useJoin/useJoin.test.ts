import { renderHook, act } from '@testing-library/react-hooks';
import { useJoin } from './useJoin';
import mockUseVideoContext from '../useVideoContext/useVideoContext';
import { getSessionToken as mockGetSessionToken } from '../../utils/getSessionToken';
import mockApi from '../../utils/api';

jest.mock('../../hooks/useVideoContext/useVideoContext');
jest.mock('../../utils/getSessionToken');
jest.mock('../../utils/api');

const mockConnect = jest.fn();
(mockUseVideoContext as jest.Mock).mockReturnValue({
  connect: mockConnect,
});

describe('useJoin hook', () => {
  afterEach(() => {
    mockConnect.mockClear();
  });

  it('joins using a session token and no credentials', async () => {
    // mock a session token
    (mockGetSessionToken as jest.Mock).mockReturnValue('fake session');

    // mock API call
    (mockApi.loggedInEnterRoom as jest.Mock).mockResolvedValue({
      success: true,
      token: 'fake token',
    });

    const { result, waitFor } = renderHook(() => useJoin('roomName'));

    act(() => {
      result.current[0]();
    });

    expect(mockApi.loggedInEnterRoom).toHaveBeenCalledWith('roomName');
    // it's loading
    expect(result.current[1].loading).toBe(true);

    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalledWith('fake token');
    });
    expect(result.current[1].loading).toBe(false);
  });

  it('joins using credentials with no session', async () => {
    // no session token
    (mockGetSessionToken as jest.Mock).mockReturnValue(null);

    // mock API call
    (mockApi.getToken as jest.Mock).mockResolvedValue({
      success: true,
      token: 'fake token',
    });

    const { result, waitFor } = renderHook(() => useJoin('roomName'));

    act(() => {
      result.current[0]('username', 'password');
    });

    expect(mockApi.getToken).toHaveBeenCalledWith('username', 'password', 'roomName');
    // it's loading
    expect(result.current[1].loading).toBe(true);

    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalledWith('fake token');
    });
    expect(result.current[1].loading).toBe(false);
  });

  it('joins using credentials even with a session', async () => {
    // no session token
    (mockGetSessionToken as jest.Mock).mockReturnValue('fake session');

    // mock API call
    (mockApi.getToken as jest.Mock).mockResolvedValue({
      success: true,
      token: 'fake token',
    });

    const { result, waitFor } = renderHook(() => useJoin('roomName'));

    act(() => {
      result.current[0]('username', 'password');
    });

    expect(mockApi.getToken).toHaveBeenCalledWith('username', 'password', 'roomName');
    // it's loading
    expect(result.current[1].loading).toBe(true);

    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalledWith('fake token');
    });
    expect(result.current[1].loading).toBe(false);
  });
});
