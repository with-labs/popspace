import { reducer, actions, initialState, selectors } from './roomSlice';
import { WidgetType } from '../../types/room';

describe('redux roomSlice state', () => {
  it('enforces boundaries on object movement', () => {
    const createAction = actions.addWidget({
      position: { x: 0, y: 0 },
      widget: {
        kind: 'widget',
        type: WidgetType.Link,
        data: {
          title: 'foo',
          url: 'bar',
        },
        isDraft: false,
        participantSid: 'a',
      },
    });
    const todo = [
      createAction,
      actions.moveObject({
        id: createAction.payload.widget.id,
        // out of bounds
        position: { x: 2000, y: 2000 },
      }),
    ];

    const result = todo.reduce(reducer, initialState);

    expect(
      selectors.createPositionSelector(createAction.payload.widget.id)({
        room: result,
      } as any)
    ).toEqual({
      x: 1200,
      y: 1200,
    });
  });

  it('imports widgets and settings from file, preserving people and drafts', () => {
    const importAction = actions.importRoom({
      positions: {
        a: {
          position: { x: 0, y: 0 },
        },
        b: {
          position: { x: 5, y: -50 },
          size: { width: 30, height: 30 },
        },
      },
      widgets: {
        a: {
          id: 'a',
          kind: 'widget',
          participantSid: '329',
          isDraft: false,
          type: WidgetType.Link,
          data: {
            title: 'Hello world',
            url: 'https://google.com',
          },
        },
        b: {
          id: 'b',
          kind: 'widget',
          participantSid: '324',
          isDraft: false,
          type: WidgetType.StickyNote,
          data: {
            text: 'hi',
            author: 'me',
          },
        },
      },
      bounds: { width: 1000, height: 1000 },
      wallpaperUrl: 'https://foobar.com/wall.png',
    });

    // import overwrites existing state
    const result = reducer(
      {
        zOrder: [],
        syncedFromPeer: false,
        widgets: {
          c: {
            id: 'c',
            kind: 'widget',
            participantSid: '1',
            isDraft: false,
            type: WidgetType.ScreenShare,
            data: {},
          },
          // a draft to preserve
          d: {
            id: 'd',
            kind: 'widget',
            participantSid: '2',
            isDraft: true,
            type: WidgetType.StickyNote,
            data: {
              text: '',
              author: 'me',
            },
          },
        },
        positions: {
          c: {
            position: { x: 0, y: 0 },
          },
          d: {
            position: { x: 5, y: 5 },
          },
          me: {
            position: { x: 100, y: 100 },
          },
        },
        people: {
          me: {
            id: 'me',
            kind: 'person',
            avatar: 'dog',
            emoji: null,
            status: '',
          },
        },
        bounds: { width: 2500, height: 2500 },
        useSpatialAudio: true,
        wallpaperUrl: 'https://a.so/b.png',
        isCustomWallpaper: false,
      },
      importAction
    );

    expect(result).toEqual({
      positions: {
        a: {
          position: { x: 0, y: 0 },
        },
        b: {
          position: { x: 5, y: -50 },
          size: { width: 30, height: 30 },
        },
        d: {
          position: { x: 5, y: 5 },
        },
        me: {
          position: { x: 100, y: 100 },
        },
      },
      widgets: {
        a: {
          id: 'a',
          kind: 'widget',
          participantSid: '329',
          isDraft: false,
          type: WidgetType.Link,
          data: {
            title: 'Hello world',
            url: 'https://google.com',
          },
        },
        b: {
          id: 'b',
          kind: 'widget',
          participantSid: '324',
          isDraft: false,
          type: WidgetType.StickyNote,
          data: {
            text: 'hi',
            author: 'me',
          },
        },
        d: {
          id: 'd',
          kind: 'widget',
          participantSid: '2',
          isDraft: true,
          type: WidgetType.StickyNote,
          data: {
            text: '',
            author: 'me',
          },
        },
      },
      people: {
        me: {
          id: 'me',
          kind: 'person',
          avatar: 'dog',
          emoji: null,
          status: '',
        },
      },
      bounds: { width: 1000, height: 1000 },
      wallpaperUrl: 'https://foobar.com/wall.png',
    });
  });
});
