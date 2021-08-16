const prisma = require('../prisma');

const getNewState = async (
  modelName,
  criteria,
  stateUpdate,
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

class Data {
  /************************************************/
  /****************** ROOM      *******************/
  /************************************************/
  setRoomState(roomId, newState) {
    return prisma.roomState.upsert({
      where: { roomId },
      create: { state: newState, roomId },
      update: { state: newState },
    });
  }

  async updateRoomState(roomId, stateUpdate, curState = null) {
    return this.setRoomState(
      roomId,
      await getNewState('roomState', { roomId }, stateUpdate, curState),
    );
  }

  async getRoomState(roomId) {
    return await prisma.roomState.findUnique({ where: { roomId } });
  }

  async getRoomWallpaperData(roomId) {
    const state = await this.getRoomState(roomId);
    if (!state.wallpaperId) return null;
    return prisma.wallpaper.findUnique({
      where: { id: BigInt(state.wallpaperId) },
    });
  }

  /************************************************/
  /****************** PARTICIPANTS   **************/
  /************************************************/

  async getParticipantState(actorId) {
    const entry = await prisma.participantState.findUnique({
      where: {
        actorId,
      },
    });
    return entry ? entry.state : null;
  }
  async updateParticipantState(actorId, participantState, curState = null) {
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
  async setParticipantState(actorId, newState) {
    const result = await prisma.participantState.upsert({
      where: { actorId },
      create: newState,
      update: newState,
    });
    return result.state;
  }

  async getRoomParticipantState(roomId, actorId) {
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
    roomId,
    actorId,
    stateUpdate,
    curState = null,
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
  async setRoomParticipantState(roomId, actorId, newState) {
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
  async addWidgetInRoom(
    creatorId,
    roomId,
    type,
    desiredWidgetState,
    desiredRoomWidgetState,
    creator = null,
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
      },
    });

    const model = new shared.models.RoomWidget(
      roomId,
      widget,
      widget.widgetState,
      widget.transform,
    );
    if (creator) {
      model.setCreator(creator);
    }
    return model;
  }

  softDeleteWidget(widgetId, deletingActorId = null) {
    return prisma.widget.update({
      where: { id: widgetId },
      data: {
        deletedAt: shared.db.time.now(),
        deletedBy: deletingActorId,
      },
    });
  }

  eraseWidget(widgetId) {
    return prisma.$transaction([
      prisma.widget.delete({ where: { id: widgetId } }),
      prisma.roomWidget.delete({ where: { widgetId } }),
      prisma.widgetState.delete({ where: { widgetId } }),
      prisma.widgetTransform.delete({ where: { widgetId } }),
    ]);
  }

  async getRoomWidgetState(roomId, widgetId) {
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
    roomId,
    widgetId,
    stateUpdate,
    roomWidgetState = null,
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
  setRoomWidgetState(roomId, widgetId, newState) {
    return prisma.widgetTransform.upsert({
      where: {
        roomId_widgetId: { roomId, widgetId },
      },
      create: { roomId, widgetId, state: newState },
      update: { state: newState },
    });
  }

  async getWidgetState(widgetId) {
    const entry = await prisma.widgetState.findUnique({
      where: { widgetId },
    });
    return entry.state;
  }
  async updateWidgetState(widgetId, stateUpdate, widgetState = null) {
    return this.setWidgetState(
      widgetId,
      await getNewState('widgetState', { widgetId }, stateUpdate, widgetState),
    );
  }
  setWidgetState(widgetId, newState) {
    return prisma.widgetState.upsert({
      where: { widgetId },
      create: { widgetId, state: newState },
      update: { state: newState },
    });
  }
}

module.exports = new Data();
