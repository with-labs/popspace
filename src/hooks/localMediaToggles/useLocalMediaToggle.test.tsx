import { renderHook, act } from '@testing-library/react-hooks';
import { useLocalMediaToggle } from './useLocalMediaToggle';

const mockPublication = {} as any;

describe('the useLocalMediaToggle hook', () => {
  const start = jest.fn();
  const stop = jest.fn();

  it('should indicate enabled when the audio track is live', () => {
    const { result } = renderHook(() => useLocalMediaToggle(mockPublication, start, stop));
    expect(result.current).toEqual([true, expect.any(Function), false]);
  });

  it('should stop audio when track is enabled', () => {
    const { result, rerender } = renderHook((pub) => useLocalMediaToggle(pub, start, stop), {
      initialProps: mockPublication,
    });
    act(() => {
      result.current[1]();
    });
    expect(stop).toHaveBeenCalled();
    expect(start).not.toHaveBeenCalled();
    // it's busy
    expect(result.current[2]).toBe(true);
    // rerender with null ("unpublished")
    act(() => {
      rerender(null);
    });
    expect(result.current[0]).toBe(false);
    expect(result.current[2]).toBe(false);
  });

  it('should start audio when track is disabled', () => {
    const { result, rerender } = renderHook((pub) => useLocalMediaToggle(pub, start, stop), {
      initialProps: null,
    });
    act(() => {
      result.current[1]();
    });
    expect(stop).not.toHaveBeenCalled();
    expect(start).toHaveBeenCalled();
    // it's busy
    expect(result.current[2]).toBe(true);
    // rerender with a publication ("published")
    act(() => {
      rerender(mockPublication);
    });
    expect(result.current[0]).toBe(true);
    expect(result.current[2]).toBe(false);
  });

  it('should time out if the publication never changes after toggle', () => {
    jest.useFakeTimers();

    const { result } = renderHook((pub) => useLocalMediaToggle(pub, start, stop), {
      initialProps: null,
    });
    act(() => {
      result.current[1]();
    });
    expect(result.current[2]).toBe(true);

    act(() => {
      jest.runAllTimers();
    });

    expect(result.current[2]).toBe(false);
  });
});
