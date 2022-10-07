import _models from '../../models/_models';
import prisma from '../prisma';
import time from '../time';

const getNewState = async <S extends object>(
  modelName: string,
  criteria: any,
  stateUpdate: Partial<S>,
  curState: S | null = null,
) => {
  /*
    This is quite abstract, but it helps cut down repetition for
    state updates.

    We'd like state updates to be non-overriding usually,
    i.e. something like {a: 1, b: 2} updated with {a: 4, c: 3} should
    result in {a: 4, b: 2, c: 3}, vs {a: 4, c: 3}.

    To do that, we currently first fetch the state,
    then do an Object.assign().

    This update could maybe be done more efficiently with JSONB,
    since it supports setting fields via JSONB_SET
    https://www.postgresql.org/docs/9.5/functions-json.html

    For now performance is not a bottleneck, and it's not clear
    whether that optimization would really improve things significantly.

    If we do run into bottlenecks, it may be that explicitly
    extracting JSON fields into columns will be the best solution.
  */
  if (!curState) {
    curState = JSON.parse(
      (
        await prisma[modelName].findUnique({
          where: criteria,
        })
      ).state,
    );
  }
  return Object.assign(curState || {}, stateUpdate);
};

export class Data {
  /************************************************/
  /****************** ROOM      *******************/
  /************************************************/
  // TODO: RoomState typing
  setRoomState<S extends object>(roomId: number, newState: S) {
    return prisma.roomState.upsert({
      where: { roomId },
      create: { state: JSON.stringify(newState), roomId },
      update: { state: JSON.stringify(newState) },
    });
  }

  async updateRoomState<S extends object>(
    roomId: number,
    stateUpdate: Partial<S>,
    curState: S | null = null,
  ) {
    return this.setRoomState(
      roomId,
      await getNewState('roomState', { roomId }, stateUpdate, curState),
    );
  }

  async getRoomState(roomId: number) {
    return await prisma.roomState.findUnique({ where: { roomId } });
  }

  async getRoomWallpaperData(roomId: number) {
    const state = await this.getRoomState(roomId);
    if (!state.wallpaperId) return null;
    return prisma.wallpaper.findUnique({
      where: { id: state.wallpaperId },
    });
  }

  /************************************************/
  /****************** PARTICIPANTS   **************/
  /************************************************/

  async getParticipantState(actorId: number) {
    const entry = await prisma.participantState.findUnique({
      where: {
        actorId,
      },
    });
    return entry ? JSON.parse(entry.state) : null;
  }
  // TODO: ParticipantState typing
  async updateParticipantState<S extends object>(
    actorId: number,
    participantState: Partial<S>,
    curState: S = null,
  ) {
    return this.setParticipantState(
      actorId,
      await getNewState(
        'participantState',
        { actorId },
        participantState,
        curState,
      ),
    );
  }
  async setParticipantState<S extends object>(actorId: number, newState: S) {
    const result = await prisma.participantState.upsert({
      where: { actorId },
      create: {
        actorId,
        state: JSON.stringify(newState),
      },
      update: {
        state: JSON.stringify(newState),
      },
    });
    return JSON.parse(result.state);
  }

  async getRoomParticipantState(roomId: number, actorId: number) {
    const entry = await prisma.participantTransform.findUnique({
      where: {
        roomId_actorId: {
          roomId,
          actorId,
        },
      },
    });
    return entry ? JSON.parse(entry.state) : null;
  }

  async updateRoomParticipantState<S extends object>(
    roomId: number,
    actorId: number,
    stateUpdate: Partial<S>,
    curState: S | null = null,
  ) {
    return this.setRoomParticipantState(
      roomId,
      actorId,
      await getNewState(
        'participantTransform',
        {
          roomId_actorId: {
            roomId,
            actorId,
          },
        },
        stateUpdate,
        curState,
      ),
    );
  }
  async setRoomParticipantState<S extends object>(
    roomId: number,
    actorId: number,
    newState: S,
  ) {
    const entry = await prisma.participantTransform.upsert({
      where: {
        roomId_actorId: { roomId, actorId },
      },
      create: { roomId, actorId, state: JSON.stringify(newState) },
      update: { state: JSON.stringify(newState) },
    });
    return entry && entry.state && JSON.parse(entry.state);
  }

  /************************************************/
  /****************** WIDGETS   *******************/
  /************************************************/
  // TODO: WidgetState typing
  // TODO: WidgetTransform typing
  // TODO: creator typing
  async addWidgetInRoom<WS extends object, RWS extends object>(
    creatorId: number,
    roomId: number,
    type: string,
    desiredWidgetState: WS,
    desiredRoomWidgetState: RWS,
    creator: any = null,
  ) {
    const widget = await prisma.widget.create({
      data: {
        creatorId,
        type,
        roomWidget: {
          create: {
            roomId,
          },
        },
        widgetState: {
          create: {
            state: JSON.stringify(desiredWidgetState),
          },
        },
        transform: {
          create: {
            state: JSON.stringify(desiredRoomWidgetState),
            roomId,
          },
        },
      },
      include: {
        widgetState: true,
        transform: true,
        creator: {
          select: {
            displayName: true,
          },
        },
      },
    });

    const model = new _models.RoomWidget(
      roomId,
      widget,
      widget.widgetState,
      widget.transform,
      widget.creator.displayName,
    );
    if (creator) {
      model.setCreator(creator);
    }
    return model;
  }

  softDeleteWidget(widgetId: number, deletingActorId: number | null = null) {
    return prisma.widget.update({
      where: { id: widgetId },
      data: {
        deletedAt: time.now(),
        deletedBy: deletingActorId,
      },
    });
  }

  eraseWidget(widgetId: number) {
    return prisma.$transaction([
      prisma.widget.delete({ where: { id: widgetId } }),
      prisma.roomWidget.deleteMany({ where: { widgetId } }),
      prisma.widgetState.delete({ where: { widgetId } }),
      prisma.widgetTransform.deleteMany({ where: { widgetId } }),
    ]);
  }

  async getRoomWidgetState(roomId: number, widgetId: number) {
    const entry = await prisma.widgetTransform.findUnique({
      where: {
        roomId_widgetId: {
          roomId,
          widgetId,
        },
      },
    });
    return entry && JSON.parse(entry.state);
  }

  async updateRoomWidgetState(
    roomId: number,
    widgetId: number,
    stateUpdate: any,
    roomWidgetState: any = null,
  ) {
    return this.setRoomWidgetState(
      roomId,
      widgetId,
      await getNewState(
        'widgetTransform',
        {
          roomId_widgetId: {
            roomId,
            widgetId,
          },
        },
        stateUpdate,
        roomWidgetState,
      ),
    );
  }
  setRoomWidgetState<S extends object>(
    roomId: number,
    widgetId: number,
    newState: S,
  ) {
    return prisma.widgetTransform.upsert({
      where: {
        roomId_widgetId: { roomId, widgetId },
      },
      create: { roomId, widgetId, state: JSON.stringify(newState) },
      update: { state: JSON.stringify(newState) },
    });
  }

  async getWidgetState(widgetId: number): Promise<object> {
    const entry = await prisma.widgetState.findUnique({
      where: { widgetId },
    });
    return JSON.parse(entry.state);
  }
  async updateWidgetState<S extends object>(
    widgetId: number,
    stateUpdate: Partial<S>,
    widgetState: S = null,
  ) {
    return this.setWidgetState(
      widgetId,
      await getNewState('widgetState', { widgetId }, stateUpdate, widgetState),
    );
  }
  setWidgetState<S extends object>(widgetId: number, newState: S) {
    return prisma.widgetState.upsert({
      where: { widgetId },
      create: { widgetId, state: JSON.stringify(newState) },
      update: { state: JSON.stringify(newState) },
    });
  }
}

export default new Data();
