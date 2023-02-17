class UpdateProcessor {
  async process(hermesEvent) {
    switch(hermesEvent.kind()) {
      case "transformWidget":
        return await this.updateWidgetRoomState(hermesEvent)
      case "updateWidget":
        return await this.updateWidgetState(hermesEvent)
      case "transformSelf":
        return await this.updateRoomParticipantState(hermesEvent)
      case "updateSelf":
        return await this.updateParticipantState(hermesEvent)
      case "updateSelfDisplayName":
        return await this.updateActorDisplayName(hermesEvent)
      case "updateSelfAvatarName":
        return await this.updateActorAvatarName(hermesEvent)
      case "updateSelfActor":
        /* DEPRECATED - use updateSelfDisplayName and updateSelfAvatarName instead*/
        return await this.tempUpdateDisplayAndAvatarName(hermesEvent)
      case "updateRoomState":
        return await this.updateRoomState(hermesEvent)
      case "updateWallpaper":
        return await this.updateWallpaper(hermesEvent)
      case "undoLastWidgetDelete":
        return await this.undoLastWidgetDelete(hermesEvent)
      default:
        return await hermesEvent.senderParticipant().sendError(
          hermesEvent,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${hermesEvent.kind()}`
        )
    }
  }

  async updateWidgetRoomState(event) {
    const widget = event.payload()
    const sender = event.senderParticipant()
    const result = await shared.db.room.data.updateRoomWidgetState(event.roomId(), parseInt(widget.widgetId), widget.transform)
    sender.respondAndBroadcast(event, "widgetTransformed")
  }

  async updateWidgetState(event) {
    const widget = event.payload()
    const sender = event.senderParticipant()
    const result = await shared.db.room.data.updateWidgetState(parseInt(widget.widgetId), widget.widgetState)
    sender.respondAndBroadcast(event, "widgetUpdated")
  }

  async updateRoomParticipantState(event) {
    const sender = event.senderParticipant()
    return sender.updateTransform(event.payload().transform, event)
  }

  async updateParticipantState(event) {
    const sender = event.senderParticipant()
    return sender.updateState(event.payload().participantState, event)
  }

  async updateRoomState(event) {
    const sender = event.senderParticipant()
    await shared.db.room.data.updateRoomState(event.roomId(), event.payload())
    sender.respondAndBroadcast(event, "roomStateUpdated")
  }

  /* DEPRECATED - use updateSelfDisplayName and updateSelfAvatarName instead*/
  async tempUpdateDisplayAndAvatarName(event) {
    log.error.warn("Deprecated use of tempUpdateDisplayAndAvatarName")
    const payload = event.payload()
    if(payload.displayName) {
      this.updateActorDisplayName(event)
    }
    if(payload.avatarName) {
      this.updateActorAvatarName(event)
    }
  }

  async updateActorDisplayName(event) {
    const sender = event.senderParticipant()
    return sender.updateDisplayName(event.payload().displayName, event)
  }

  async updateActorAvatarName(event) {
    const sender = event.senderParticipant()
    return sender.updateAvatarName(event.payload().avatarName, event)
  }

  async updateWallpaper(event) {
    const sender = event.senderParticipant()
    const wallpaperId = event.payload().wallpaperId
    const userCanAccess = await shared.db.wallpapers.canUserAccessWallpaper(sender.actorId(), wallpaperId)
    if (!userCanAccess) {
      return sender.sendError(event, lib.ErrorCodes.UNAUTHORIZED, "You do not have permission to access this wallpaper")
    }
    const updatedRooms = await shared.db.prisma.roomState.update({
      where: { roomId: event.roomId() },
      data: {
        wallpaperId
      }
    })
    if (updatedRooms.length === 0) {
      return sender.sendError(event, lib.ErrorCodes.ROOM_NOT_FOUND, "No such room", { roomId: event.roomId() })
    }
    const wallpaperData = await shared.db.prisma.wallpaper.findUnique({ where: { id: wallpaperId } })
    sender.sendResponse(event, { wallpaper: wallpaperData })
    sender.broadcastPeerEvent("wallpaperUpdated", { wallpaper: wallpaperData })
  }

  async undoLastWidgetDelete(event) {
    const sender = event.senderParticipant()
    const roomId = event.roomId()

    // update the last deleted widget by this user in this room within the last 8 minutes
    // to set deleted_at to null
    const eightMinutesAgo = new Date(Date.now() - 8 * 60 * 1000)

    const toUpdate = await shared.db.prisma.widget.findFirst({
      where: {
        roomWidget: {
          roomId: parseInt(roomId),
        },
        deletedAt: {
          gte: eightMinutesAgo
        },
        deletedBy: parseInt(sender.actorId())
      },
      orderBy: {
        deletedAt: "desc"
      },
      select: {
        id: true
      }
    })
    if (toUpdate) {
      const updated = await shared.db.prisma.widget.update({
        where: { id: toUpdate.id },
        data: {
          deletedAt: null
        },
      })

      if (updated) {
        // assemble the full model
        const roomWidget = await shared.models.RoomWidget.fromWidgetId(updated.id, roomId)
        const serialized = await roomWidget.serialize()

        sender.sendResponse(event, serialized, "widgetCreated")
        sender.broadcastPeerEvent("widgetCreated", serialized)
      }
    }
  }
}

module.exports = UpdateProcessor
