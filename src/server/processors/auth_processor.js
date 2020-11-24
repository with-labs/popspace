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
      const authData = await this.getAuthData(event, participants)
      return event._sender.sendResponse(event, {
        kind: "auth",
        success: true,
        authData: authData
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

  async getAuthData(event, participants) {
    const user = event._sender.user
    const room = {}
    room.widgets = await this.getWidgets(event.data.payload.roomId)
    room.participants = await participants.serialize()
    room.id = 0
    room.state = {}
    return { room, user }
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
