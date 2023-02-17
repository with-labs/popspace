import { Actor, Widget, WidgetState, WidgetTransform } from '@prisma/client';

import accounts from '../db/accounts';
import messages from '../db/messages/messages';
import prisma from '../db/prisma';

class RoomWidget {
  static fromWidgetId = async (widgetId: number, roomId: number) => {
    const pgWidget = await prisma.widget.findUnique({
      where: { id: widgetId },
      include: { creator: { select: { displayName: true } } },
    });
    const widgetState = await prisma.widgetState.findUnique({
      where: { widgetId },
    });
    const roomWidgetState = await prisma.widgetTransform.findUnique({
      where: { roomId_widgetId: { widgetId, roomId } },
    });

    return new RoomWidget(
      roomId,
      pgWidget,
      widgetState,
      roomWidgetState,
      pgWidget.creator.displayName,
    );
  };

  static allInRoom = async (roomId: number) => {
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
      // FIXME: this seems gross
      const widgetState = widget.widgetState || ({} as any);
      const roomWidgetState = widget.transform || ({} as any);
      const roomWidget = new RoomWidget(
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

  _creator: Actor;
  _creatorDisplayName: string;
  _pgWidget: Widget;
  _roomId: number;
  _roomWidgetState: WidgetTransform;
  _widgetState: WidgetState;

  constructor(
    roomId: number,
    pgWidget: Widget,
    widgetState: WidgetState,
    roomWidgetState: WidgetTransform,
    creatorDisplayName: string,
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

  widgetState(): { [key: string]: any } {
    return this._widgetState.state ? JSON.parse(this._widgetState.state) : {};
  }

  roomWidgetState(): { [key: string]: any } {
    return this._roomWidgetState.state
      ? JSON.parse(this._roomWidgetState.state)
      : {};
  }

  roomId() {
    return this._roomId;
  }

  creatorId() {
    return this._pgWidget.creatorId;
  }

  setCreator(creator: Actor) {
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

  // FIXME: this seems gross
  async creator() {
    return (this._creator =
      this._creator ||
      (await accounts.actorById(this.creatorId())) ||
      ({} as any));
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
      const associatedMessages = await messages.getNextPageMessages(
        this._pgWidget.id,
        null,
      );
      return { ...baseWidgetData, messages: associatedMessages };
    }

    return baseWidgetData;
  }
}

export default RoomWidget;
