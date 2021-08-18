// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'prisma'.
const prisma = require('../db/prisma');

class RoomWidget {
  static fromWidgetId: any;

  static allInRoom: any;

  _creator: any;
  _creatorDisplayName: any;
  _pgWidget: any;
  _roomId: any;
  _roomWidgetState: any;
  _widgetState: any;

  constructor(
    roomId,
    pgWidget,
    widgetState,
    roomWidgetState,
    creatorDisplayName,
  ) {
    this._roomId = roomId;
    this._pgWidget = pgWidget;
    this._widgetState = widgetState;
    this._roomWidgetState = roomWidgetState;
    this._creatorDisplayName = creatorDisplayName;
  }

  widgetId() {
    return this._pgWidget.id;
  }

  widgetState() {
    return this._widgetState.state || {};
  }

  roomWidgetState() {
    return this._roomWidgetState.state;
  }

  roomId() {
    return this._roomId;
  }

  creatorId() {
    return this._pgWidget.creatorId;
  }

  setCreator(creator) {
    if (!creator) {
      if (this.creatorId()) {
        return;
      } else {
        throw `Invalid null creator - expected creator with id ${this.creatorId()}`;
      }
    }
    if (creator.id != this.creatorId()) {
      throw `Invalid creator (expected ${this.creatorId()}, got ${
        creator ? creator.id : null
      }`;
    }
    this._creator = creator;
  }

  async creator() {
    return (this._creator =
      this._creator ||
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
      (await shared.db.accounts.actorById(this.creatorId())) ||
      {});
  }

  async creatorDisplayName() {
    return (this._creatorDisplayName =
      this._creatorDisplayName || (await this.creator()).displayName);
  }

  async serialize() {
    let baseWidgetData = {
      widget_id: this._pgWidget.id,
      creator_id: this._pgWidget.creatorId,
      type: this._pgWidget.type,
      widget_state: this.widgetState(),
      creator_display_name: await this.creatorDisplayName(),
      transform: this.roomWidgetState(),
    };

    if (this._pgWidget.type === 'CHAT') {
      // if we are chat widget, get the messsages and them to the baseWidgetData
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
      const messages = await shared.db.messages.getNextPageMessages(
        this._pgWidget.id,
        null,
      );
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ messages: any; widget_id: any; creator_id:... Remove this comment to see the full error message
      baseWidgetData = { ...baseWidgetData, messages };
    }

    return baseWidgetData;
  }
}

RoomWidget.fromWidgetId = async (widgetId, roomId) => {
  const pgWidget = await prisma.widget.findUnique({ where: { id: widgetId } });
  const widgetState = await prisma.widgetState.findUnique({
    where: { widgetId },
  });
  const roomWidgetState = await prisma.widgetTransform.findUnique({
    where: { roomId_widgetId: { widgetId, roomId } },
  });

  // @ts-expect-error ts-migrate(2554) FIXME: Expected 5 arguments, but got 4.
  return new RoomWidget(roomId, pgWidget, widgetState, roomWidgetState);
};

RoomWidget.allInRoom = async (roomId) => {
  roomId = parseInt(roomId);
  const widgets = await prisma.widget.findMany({
    where: {
      roomWidget: {
        roomId,
      },
      deletedAt: null,
      archivedAt: null,
    },
    include: {
      creator: true,
      widgetState: true,
      transform: true,
    },
  });

  const result = [];
  for (const widget of widgets) {
    const widgetState = widget.widgetState || {};
    const roomWidgetState = widget.transform || {};
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
    const roomWidget = new shared.models.RoomWidget(
      roomId,
      widget,
      widgetState,
      roomWidgetState,
      widget.creator.displayName,
    );
    result.push(roomWidget);
  }

  return result;
};

module.exports = RoomWidget;
