const Processor = require("./processor")

class MutateProcessor extends Processor {
  async process(event, participants) {
    switch(event.data.kind) {
      case "room/moveObject":
        return this.moveObject(event, participants)
      case "room/state":
        return this.updateRoomState(event, participants)
      default:
        return event._sender.sendError(
          event,
          lib.ErrorCodes.EVENT_TYPE_INVALID,
          `Unrecognized event type: ${event.data.kind}`
        )
    }
  }

  async moveObject(event, participants) {
    const widget = event.data.payload
    try {
      const x = parseInt(widget.roomState.position.x), y = parseInt(widget.roomState.position.y)
    } catch {
      return event._sender.sendError(event, lib.ErrorCodes.MESSAGE_INVALID_FORMAT, `Must specify x,y for moveObject.`)
    }
    const result = await lib.roomData.updateWidgetRoomState(widget.widget_id, event._sender.room.id, widget.roomState)
    participants.rebroadcast(event)
    event._sender.sendResponse(event, {kind: "room/moveObject", payload: widget})
  }

  async updateWidgetRoomState(event, participants) {
    const widget = event.data.payload.widget
    const result = await lib.roomData.updateWidgetRoomState(widget.widget_id, event._sender.room.id, widget.roomState)
    participants.rebroadcast(event)
    event._sender.sendResponse(event, {kind: "room/updateWidget", payload: widget})
  }

  async updateWidgetState(event, participants) {
    const widget = event.data.payload.widget
    const result = await lib.roomData.updateWidgetState(widget.widget_id, event._sender.room.id, widget.widgetState)
    participants.rebroadcast(event)
    event._sender.sendResponse(event, {kind: "room/updateWidget", payload: widget})
  }
}

module.exports = MutateProcessor
