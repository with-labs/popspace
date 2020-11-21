const Processor = require("./processor")

class AuthProcessor extends Processor {
  async process(event, participants) {
    switch(event.data.kind) {
      case "auth":
        return this.authenticate(event, participants)
      default:
        return event._sender.sendError(
          event,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${event.kind}`
        )
    }
  }

  async authenticate(event, participants) {
    const success = await event._sender.authenticate(event.data.payload.token, event.data.payload.roomId)
    if(success) {
      // TODO: I want to make these events into objects to abstract away the data structure
      const roomData = await this.getRoomData(event.data.payload.roomId, participants)
      return event._sender.sendResponse(event, {
        kind: "auth",
        success: true,
        roomData: roomData
      })
    } else {
      return event._sender.sendError(
        event,
        lib.ErrorCodes.AUTH_FAILED,
        "Invalid credentials",
        { kind: "auth"}
      )
    }
  }

  async getRoomData(roomId, participants) {
    const result = {}

    result.widgets = await this.getWidgets(roomId)
    result.participants = await participants.serialize()
    result.room = {
      wallpaper: "",
      id: 0,
      displayName: "xyz"
    }

    return result
  }

  async getWidgets(roomId) {
    const widgets = await shared.db.pg.massive.query(`
      SELECT
        widgets.id AS id
      FROM
        widgets JOIN room_widgets ON widgets.id = room_widgets.widget_id
      WHERE
        room_widgets.roomId = $1
        AND
        widgets.deleted_at IS NULL
        AND
        widgets.archived_at IS NULL
    `, [roomId])
    return widgets
  }

}

module.exports = AuthProcessor
