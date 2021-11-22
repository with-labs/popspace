import _models from '../../models/_models';
import prisma from '../prisma';
import time from '../time';

const getNewState = async (
  modelName: string,
  criteria: any,
  stateUpdate: any,
  curState = null,
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
    curState = (
      await prisma[modelName].findUnique({
        where: criteria,
      })
    ).state;
  }
  return Object.assign(curState || {}, stateUpdate);
};

export class Data {
  /************************************************/
  /****************** ROOM      *******************/
  /************************************************/
  // TODO: RoomState typing
  setRoomState(roomId: bigint, newState: any) {
    return prisma.roomState.upsert({
      where: { roomId },
      create: { state: newState, roomId },
      update: { state: newState },
    });
  }

  async updateRoomState(
    roomId: bigint,
    stateUpdate: any,
    curState: any = null,
  ) {
    return this.setRoomState(
      roomId,
      await getNewState('roomState', { roomId }, stateUpdate, curState),
    );
  }

  async getRoomState(roomId: bigint) {
    return await prisma.roomState.findUnique({ where: { roomId } });
  }

  async getRoomWallpaperData(roomId: bigint) {
    const state = await this.getRoomState(roomId);
    if (!state.wallpaperId) return null;
    return prisma.wallpaper.findUnique({
      where: { id: BigInt(state.wallpaperId) },
    });
  }

  /************************************************/
  /****************** PARTICIPANTS   **************/
  /************************************************/

  async getParticipantState(actorId: bigint) {
    const entry = await prisma.participantState.findUnique({
      where: {
        actorId,
      },
    });
    return entry ? entry.state : null;
  }
  // TODO: ParticipantState typing
  async updateParticipantState(
    actorId: bigint,
    participantState: any,
    curState: any = null,
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
  async setParticipantState(actorId: bigint, newState: any) {
    const result = await prisma.participantState.upsert({
      where: { actorId },
      create: newState,
      update: newState,
    });
    return result.state;
  }

  async getRoomParticipantState(roomId: bigint, actorId: bigint) {
    const entry = await prisma.participantTransform.findUnique({
      where: {
        roomId_actorId: {
          roomId,
          actorId,
        },
      },
    });
    return entry ? entry.state : null;
  }

  async updateRoomParticipantState(
    roomId: bigint,
    actorId: bigint,
    stateUpdate: any,
    curState: any = null,
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
  async setRoomParticipantState(
    roomId: bigint,
    actorId: bigint,
    newState: any,
  ) {
    const entry = await prisma.participantTransform.upsert({
      where: {
        roomId_actorId: { roomId, actorId },
      },
      create: { roomId, actorId, state: newState },
      update: { state: newState },
    });
    return entry && entry.state;
  }

  /************************************************/
  /****************** WIDGETS   *******************/
  /************************************************/
  // TODO: WidgetState typing
  // TODO: WidgetTransform typing
  // TODO: creator typing
  async addWidgetInRoom(
    creatorId: bigint,
    roomId: bigint,
    type: string,
    desiredWidgetState: any,
    desiredRoomWidgetState: any,
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
            state: desiredWidgetState,
          },
        },
        transform: {
          create: {
            state: desiredRoomWidgetState,
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

  softDeleteWidget(widgetId: bigint, deletingActorId: bigint | null = null) {
    return prisma.widget.update({
      where: { id: widgetId },
      data: {
        deletedAt: time.now(),
        deletedBy: deletingActorId,
      },
    });
  }

  eraseWidget(widgetId: bigint) {
    return prisma.$transaction([
      prisma.widget.delete({ where: { id: widgetId } }),
      prisma.roomWidget.deleteMany({ where: { widgetId } }),
      prisma.widgetState.delete({ where: { widgetId } }),
      prisma.widgetTransform.deleteMany({ where: { widgetId } }),
    ]);
  }

  async getRoomWidgetState(roomId: bigint, widgetId: bigint) {
    const entry = await prisma.widgetTransform.findUnique({
      where: {
        roomId_widgetId: {
          roomId,
          widgetId,
        },
      },
    });
    return entry && entry.state;
  }

  async updateRoomWidgetState(
    roomId: bigint,
    widgetId: bigint,
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
  setRoomWidgetState(roomId: bigint, widgetId: bigint, newState: any) {
    return prisma.widgetTransform.upsert({
      where: {
        roomId_widgetId: { roomId, widgetId },
      },
      create: { roomId, widgetId, state: newState },
      update: { state: newState },
    });
  }

  async getWidgetState(widgetId: bigint) {
    const entry = await prisma.widgetState.findUnique({
      where: { widgetId },
    });
    return entry.state;
  }
  async updateWidgetState(
    widgetId: bigint,
    stateUpdate: any,
    widgetState: any = null,
  ) {
    return this.setWidgetState(
      widgetId,
      await getNewState('widgetState', { widgetId }, stateUpdate, widgetState),
    );
  }
  setWidgetState(widgetId: bigint, newState: any) {
    return prisma.widgetState.upsert({
      where: { widgetId },
      create: { widgetId, state: newState },
      update: { state: newState },
    });
  }
}

export default new Data();
