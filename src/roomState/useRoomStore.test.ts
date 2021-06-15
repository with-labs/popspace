import { useRoomStore } from './useRoomStore';
import { SocketConnection } from './SocketConnection';
import { WidgetType } from './types/widgets';
import { omit } from 'lodash';
import { IncomingAuthResponseMessage } from './types/socketProtocol';

jest.mock('./SocketConnection');
jest.mock('@utils/logger');
jest.mock('mixpanel-browser');

describe('the central room state store (useRoomStore)', () => {
  it('can connect and disconnect from sockets', () => {
    const socket = new SocketConnection('mockUrl');
    const api = useRoomStore.getState().api;

    const initialWallpaperUrl = useRoomStore.getState().state.wallpaperUrl;

    // connect to first socket
    api.connect(socket);
    expect(socket.on).toHaveBeenCalledWith('message', expect.anything());

    // make a test change
    function changeWallpaper() {
      api.updateRoomState({
        wallpaperUrl: 'some-url',
      });
    }
    changeWallpaper();

    // connect to a different socket
    const secondSocket = new SocketConnection('mockUrl');
    api.connect(secondSocket);
    // original socket is disconnected
    expect(socket.off).toHaveBeenCalledWith('message', expect.anything());
    // new socket is connected
    expect(secondSocket.on).toHaveBeenCalledWith('message', expect.anything());
    // room is reset
    expect(useRoomStore.getState().state.wallpaperUrl).toBe(initialWallpaperUrl);

    // make another test change
    changeWallpaper();

    // disconnect
    api.leave();
    expect(secondSocket.close).toHaveBeenCalled();
    // room is reset
    expect(useRoomStore.getState().state.wallpaperUrl).toBe(initialWallpaperUrl);
  });

  describe('when connected', () => {
    const socket = new SocketConnection('mock-url');
    const api = useRoomStore.getState().api;

    beforeEach(() => {
      api.connect(socket);
    });

    afterEach(() => {
      api.leave();
    });

    describe('room initialization flow', () => {
      it('receives init event from server and populates store', () => {
        const init: IncomingAuthResponseMessage = {
          kind: 'auth.response',
          sender: {
            userId: 'someone',
            sessionId: 'session-id',
          },
          payload: {
            self: {
              authenticated: true,
              sessionId: 'session-id',
              actor: {
                id: 'cat-id',
              },
              participantState: {
                displayName: 'Cat',
                avatarName: 'cat',
              },
            },
            participants: [
              {
                authenticated: true,
                sessionId: 'session-id',
                actor: {
                  id: 'cat-id',
                },
                participantState: {
                  displayName: 'Cat',
                  avatarName: 'cat',
                },
                transform: {
                  position: { x: 0, y: 0 },
                  size: { width: 140, height: 140 },
                },
              },
            ],
            displayName: 'room',
            roomData: {
              id: 'room-id',
              state: {
                backgroundColor: '#ffffff',
                wallpaperRepeats: false,
                wallpaperUrl: 'https://with.so/wallpapers/board.png',
                isCustomWallpaper: true,
                zOrder: [],
              },
              widgets: [
                {
                  type: WidgetType.StickyNote,
                  ownerId: 'cat-id',
                  ownerDisplayName: 'Cat',
                  widgetId: 'widget-1',
                  widgetState: {
                    text: 'something',
                  },
                  transform: {
                    position: { x: 0, y: 0 },
                    size: { width: 240, height: 240 },
                  },
                },
              ],
            },
          },
        };

        socket.emit('message', init);

        expect(useRoomStore.getState()).toEqual({
          api: expect.anything(),
          socket: expect.anything(),
          id: 'room-id',
          displayName: 'room',
          widgets: {
            'widget-1': {
              type: WidgetType.StickyNote,
              widgetId: 'widget-1',
              ownerId: 'cat-id',
              ownerDisplayName: 'Cat',
              widgetState: {
                text: 'something',
              },
            },
          },
          sessionLookup: {
            'session-id': 'cat-id',
          },
          users: {
            'cat-id': {
              authenticated: true,
              id: 'cat-id',
              participantState: {
                displayName: 'Cat',
                avatarName: 'cat',
              },
              sessionIds: expect.any(Set),
            },
          },
          state: {
            ...init.payload.roomData.state,
          },
          widgetPositions: {
            'widget-1': {
              position: { x: 0, y: 0 },
              size: { width: 240, height: 240 },
            },
          },
          userPositions: {
            'cat-id': {
              position: { x: 0, y: 0 },
              size: { width: 140, height: 140 },
            },
          },
          sessionId: 'session-id',
          cursors: {},
        });
      });
    });

    describe('user operations', () => {
      beforeEach(() => {
        // preload participant data
        useRoomStore.setState({
          id: 'room-id',
          users: {
            user1: {
              authenticated: true,
              sessionIds: new Set(['session-id']),
              participantState: {
                displayName: 'Cat',
                avatarName: 'cat',
              },
              id: 'user1',
            },
            user2: {
              authenticated: true,
              sessionIds: new Set(['other-session']),
              participantState: {
                displayName: 'Bunny',
                avatarName: 'bunny',
              },
              id: 'user2',
            },
          },
          sessionLookup: {
            'session-id': 'user1',
            'other-session': 'user2',
          },
          userPositions: {
            user1: {
              position: { x: 0, y: 0 },
              size: { width: 140, height: 140 },
            },
            user2: {
              position: { x: 10, y: -30 },
              size: { width: 140, height: 140 },
            },
          },
        });
      });

      it('moves self, sending to server', async () => {
        const payload = {
          position: { x: 50, y: 25 },
        };
        await api.transformSelf(payload);

        expect(useRoomStore.getState().userPositions.user1.position).toEqual({
          x: 50,
          y: 25,
        });
        expect(socket.sendAndWaitForResponse).toHaveBeenCalledWith({
          kind: 'transformSelf',
          payload: {
            transform: {
              position: { x: 50, y: 25 },
              size: { width: 140, height: 140 },
            },
          },
        });
      });

      it('adds a new user from the server', () => {
        socket.emit('message', {
          kind: 'participantJoined',
          sender: {
            userId: 'new-user',
            sessionId: 'new-session',
          },
          payload: {
            authenticated: true,
            participantState: {
              displayName: 'New User',
              avatarName: 'bear',
            },
            sessionId: 'new-session',
            transform: {
              position: { x: 10, y: 0 },
              size: { width: 140, height: 140 },
            },
            actor: {
              id: 'new-user',
            },
          },
        });

        expect(useRoomStore.getState().users['new-user']).toEqual({
          id: 'new-user',
          participantState: {
            displayName: 'New User',
            avatarName: 'bear',
          },
          authenticated: true,
          sessionIds: expect.any(Set),
        });
        expect(useRoomStore.getState().users['new-user'].sessionIds).toContain('new-session');
        expect(useRoomStore.getState().sessionLookup['new-session']).toEqual('new-user');
        expect(useRoomStore.getState().userPositions['new-user']).toEqual({
          position: { x: 10, y: 0 },
          size: { width: 140, height: 140 },
        });
      });

      it('adds a second session for an existing user', () => {
        socket.emit('message', {
          kind: 'participantJoined',
          sender: {
            userId: 'user1',
            sessionId: 'new-session',
          },
          payload: {
            authenticated: true,
            participantState: {
              displayName: 'User 1',
              avatarName: 'bear',
            },
            sessionId: 'new-session',
            transform: {
              position: { x: 10, y: 0 },
              size: { width: 140, height: 140 },
            },
            actor: {
              id: 'user1',
            },
          },
        });

        expect(useRoomStore.getState().users['user1']).toEqual({
          id: 'user1',
          participantState: {
            displayName: 'User 1',
            avatarName: 'bear',
          },
          authenticated: true,
          sessionIds: expect.any(Set),
        });
        expect(useRoomStore.getState().users['user1'].sessionIds).toContain('new-session');
        expect(useRoomStore.getState().users['user1'].sessionIds).toContain('session-id');
        expect(useRoomStore.getState().sessionLookup['new-session']).toEqual('user1');
        expect(useRoomStore.getState().sessionLookup['session-id']).toEqual('user1');
      });

      it('removes a session from a user with two sessions', () => {
        socket.emit('message', {
          kind: 'participantJoined',
          sender: {
            userId: 'user1',
            sessionId: 'new-session',
          },
          payload: {
            authenticated: true,
            participantState: {
              displayName: 'User 1',
              avatarName: 'bear',
            },
            sessionId: 'new-session',
            transform: {
              position: { x: 10, y: 0 },
              size: { width: 140, height: 140 },
            },
            actor: {
              id: 'user1',
            },
          },
        });

        socket.emit('message', {
          kind: 'participantLeft',
          sender: {
            userId: 'user1',
            sessionId: 'session-id',
          },
          payload: {
            sessionId: 'session-id',
          },
        });

        expect(useRoomStore.getState().users['user1']).toEqual({
          id: 'user1',
          participantState: {
            displayName: 'User 1',
            avatarName: 'bear',
          },
          authenticated: true,
          sessionIds: expect.any(Set),
        });
        expect(useRoomStore.getState().users['user1'].sessionIds).toContain('new-session');
        expect(useRoomStore.getState().users['user1'].sessionIds).not.toContain('session-id');
        expect(useRoomStore.getState().sessionLookup['new-session']).toEqual('user1');
        expect(useRoomStore.getState().sessionLookup).not.toHaveProperty('session-id');
      });

      it('removes a user after the last session is ended', () => {
        socket.emit('message', {
          kind: 'participantLeft',
          sender: {
            userId: 'user1',
            sessionId: 'session-id',
          },
          payload: {
            sessionId: 'session-id',
          },
        });

        expect(useRoomStore.getState().users).not.toHaveProperty('user1');
        expect(useRoomStore.getState().userPositions).not.toHaveProperty('user1');
        expect(useRoomStore.getState().sessionLookup).not.toHaveProperty('session-id');
      });

      it('responds to server user update of another user', () => {
        socket.emit('message', {
          kind: 'participantUpdated',
          sender: {
            userId: 'user2',
            sessionId: 'other-session',
          },
          payload: {
            authenticated: true,
            participantState: {},
            sessionId: 'other-session',
            actor: {
              id: 'user2',
            },
          },
        });

        expect(useRoomStore.getState().users.user2).toEqual({
          authenticated: true,
          id: 'user2',
          participantState: {
            displayName: 'Bunny',
            avatarName: 'bunny',
          },
          sessionIds: expect.any(Set),
        });
      });

      it('responds to server user movement', () => {
        socket.emit('message', {
          kind: 'participantTransformed',
          sender: {
            userId: 'user1',
            sessionId: 'session-id',
          },
          payload: {
            transform: {
              position: { x: -50, y: -50 },
              size: { width: 140, height: 140 },
            },
          },
        });

        expect(useRoomStore.getState().userPositions.user1).toEqual({
          position: { x: -50, y: -50 },
          size: { width: 140, height: 140 },
        });
      });
    });

    describe('widget operations', () => {
      beforeEach(() => {
        // preload widget data
        useRoomStore.setState({
          id: 'room-id',
          widgets: {
            widget1: {
              type: WidgetType.Link,
              ownerId: 'some-user',
              ownerDisplayName: 'Some user',
              widgetId: 'widget1',
              widgetState: { url: 'something', title: 'Something' },
            },
          },
          widgetPositions: {
            widget1: {
              position: { x: 0, y: 0 },
              size: { width: 140, height: 140 },
            },
          },
        });
      });

      it('creates a widget, waiting for server response before changing state', () => {
        const payload = {
          type: WidgetType.StickyNote as const,
          transform: {
            position: { x: 0, y: 0 },
            size: { width: 100, height: 200 },
          },
          widgetState: {
            text: 'something',
          },
        };
        (socket.sendAndWaitForResponse as jest.Mock).mockResolvedValueOnce({
          payload: {
            ...payload,
            widgetId: 'mock_widget_id',
          },
        });
        api.addWidget(payload);

        expect(socket.sendAndWaitForResponse).toHaveBeenCalledWith({
          kind: 'createWidget',
          payload,
        });

        const widget = {
          ...payload,
          widgetId: 'mock-widget-id',
          ownerId: 'someone',
          ownerDisplayName: 'Someone',
        };

        socket.emit('message', {
          kind: 'widgetCreated',
          sender: {
            userId: 'someone',
            sessionId: 'f',
          },
          payload: widget,
        });

        expect(useRoomStore.getState().widgets['mock-widget-id']).toEqual(omit(widget, 'transform'));
        expect(useRoomStore.getState().widgetPositions['mock-widget-id']).toEqual(widget.transform);
        // adds the id to the end of the zorder
        expect(useRoomStore.getState().state.zOrder[useRoomStore.getState().state.zOrder.length - 1]).toEqual(
          widget.widgetId
        );
      });

      it('moves a widget, sending to server', async () => {
        const payload = {
          widgetId: 'widget1',
          position: { x: 50, y: 25 },
        };
        await api.moveWidget(payload);

        expect(useRoomStore.getState().widgetPositions.widget1.position).toEqual({
          x: 50,
          y: 25,
        });
        expect(socket.sendAndWaitForResponse).toHaveBeenCalledWith({
          kind: 'transformWidget',
          payload: {
            widgetId: 'widget1',
            transform: {
              position: { x: 50, y: 25 },
            },
          },
        });
      });

      it('resizes a widget, sending to server', () => {
        const payload = {
          widgetId: 'widget1',
          size: { width: 150, height: 250 },
        };
        api.resizeWidget(payload);

        expect(useRoomStore.getState().widgetPositions.widget1.size).toEqual({
          width: 150,
          height: 250,
        });
        expect(socket.send).toHaveBeenCalledWith({
          kind: 'transformWidget',
          payload: {
            widgetId: 'widget1',
            transform: {
              size: { width: 150, height: 250 },
            },
          },
        });
      });

      it('updates a widget, sending to server', () => {
        api.updateWidget({
          widgetId: 'widget1',
          widgetState: {
            title: 'foo bar',
          },
        });

        expect(useRoomStore.getState().widgets.widget1.widgetState).toEqual({
          title: 'foo bar',
          url: 'something',
        });
      });

      it('deletes a widget, sending to server', () => {
        const payload = {
          widgetId: 'widget1',
        };
        api.deleteWidget(payload);

        expect(useRoomStore.getState().widgets.widget1).toBeFalsy();
        expect(socket.send).toHaveBeenCalledWith({
          kind: 'deleteWidget',
          payload,
        });
        expect(useRoomStore.getState().state.zOrder.includes(payload.widgetId)).toBe(false);
      });

      it('responds to a server widget move', () => {
        socket.emit('message', {
          kind: 'widgetTransformed',
          sender: {
            userId: 'user1',
            sessionId: 'session-id',
          },
          payload: {
            widgetId: 'widget1',
            transform: {
              position: { x: 100, y: 100 },
              size: { width: 50, height: 50 },
            },
          },
        });

        expect(useRoomStore.getState().widgetPositions.widget1).toEqual({
          position: { x: 100, y: 100 },
          size: { width: 50, height: 50 },
        });
      });

      it('responds to a server widget delete', () => {
        socket.emit('message', {
          kind: 'widgetDeleted',
          sender: {
            userId: 'user1',
            sessionId: 'session-id',
          },
          payload: {
            widgetId: 'widget1',
          },
        });

        expect(useRoomStore.getState().widgets).not.toHaveProperty('widget1');
        expect(useRoomStore.getState().widgetPositions).not.toHaveProperty('widget1');
      });

      it('responds to a server widget update', () => {
        socket.emit('message', {
          kind: 'widgetUpdated',
          sender: {
            userId: 'user1',
            sessionId: 'session-id',
          },
          payload: {
            widgetId: 'widget1',
            widgetState: {
              url: 'some other url',
            },
            ownerId: 'some-user',
            ownerDisplayName: 'Some user',
            type: WidgetType.Link,
          },
        });

        expect(useRoomStore.getState().widgets.widget1).toEqual({
          widgetId: 'widget1',
          ownerId: 'some-user',
          ownerDisplayName: 'Some user',
          type: WidgetType.Link,
          widgetState: {
            url: 'some other url',
            title: 'Something',
          },
        });
      });
    });

    describe('room operations', () => {
      it('updates room wallpaper', () => {
        socket.emit('message', {
          kind: 'roomStateUpdated',
          sender: {
            userId: 'anyone',
            sessionId: 'doesntmatter',
          },
          payload: {
            wallpaperUrl: 'some url',
            width: 2400,
            height: 2400,
          },
        });

        expect(useRoomStore.getState().state.wallpaperUrl).toEqual('some url');
      });
    });

    it('ignores unknown messages from server', () => {
      expect(() => {
        socket.emit('message', {
          kind: 'foo',
          payload: {},
        } as any);
      }).not.toThrow();
    });
  });
});
