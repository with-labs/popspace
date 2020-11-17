const Processor = require("./processor")

class CreateProcessor extends Processor {
  process(event) {
    switch(event.objectType) {
      case 'widget':
        this.createWidget(event)
        break
      default:
        throw `Create object type not supported: ${event.objectType}`
    }
  }

  createWidget(event) {
    const room = await
    return await shared.pg.massive.withTransaction(async (tx) => {
      const widget = await tx.widgets.insert({})
      await tx.room_widgets.insert({widget_id: widget.id, room_id: event.room_id})
    })

    await shared.pg.massive.wid
  }
}

module.exports = CreateProcessor
