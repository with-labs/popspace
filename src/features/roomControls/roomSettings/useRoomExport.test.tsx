import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { useRoomExport } from './useRoomExport';

describe('useRoomExport hook', () => {
  it('returns room widgets, positions, and wallpaper', async () => {
    const store = createStore(() => ({
      room: {
        wallpaperUrl: 'https://foobar.com/wall.png',
        bounds: { width: 2500, height: 2500 },
        widgets: {
          a: {
            id: 'a',
            kind: 'widget',
            data: {
              something: 'hello',
            },
          },
          b: {
            id: 'b',
            kind: 'widget',
            isDraft: true,
          },
        },
        positions: {
          a: {
            position: { x: 100, y: 50 },
            size: { width: 30, height: 80 },
          },
          me: {
            position: { x: 50, y: 50 },
          },
        },
        people: {
          me: {
            hello: 'world',
          },
        },
      },
    }));

    const { result } = renderHook(() => useRoomExport(), {
      wrapper: (p) => <Provider store={store} {...p} />,
    });

    expect(result.current).toEqual({
      wallpaperUrl: 'https://foobar.com/wall.png',
      bounds: { width: 2500, height: 2500 },
      widgets: {
        a: {
          id: 'a',
          kind: 'widget',
          data: {
            something: 'hello',
          },
        },
      },
      positions: {
        a: {
          position: { x: 100, y: 50 },
          size: { width: 30, height: 80 },
        },
      },
    });
  });
});
