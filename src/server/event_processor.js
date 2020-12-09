const _processors = require("./processors/_processors")

const ACTION_BY_EVENT_KIND = {
  "room/addWidget": "create",
  "room/moveObject": "mutate",
  "room/getRoom": "get",
  "room/getWidget": "get",
  "auth": "auth",
  "ping": "ping",
  "echo": "echo"
}

const PUBLIC_ACTIONS = {
  "auth": true,
  "ping": true
}

const processors = {
  auth: new _processors.AuthProcessor(),
  create: new _processors.CreateProcessor(),
  mutate: new _processors.MutateProcessor(),
  get: new _processors.GetProcessor(),
  echo: new _processors.EchoProcessor()
}

class EventProcessor {
  constructor(participants) {
    this.participants = participants

    this.participants.setEventHandler(async (mercuryEvent) => {
      const action = ACTION_BY_EVENT_KIND[mercuryEvent.kind()]
      const sender = mercuryEvent.senderParticipant()
      if(!processors[action]) {
        return sender.sendError(mercuryEvent, lib.ErrorCodes.MESSAGE_INVALID_FORMAT, `Unrecognized event ${mercuryEvent.kind()}.`)
      }
      if(!PUBLIC_ACTIONS[action] && !sender.isAuthenticated()) {
        return sender.sendError(mercuryEvent, lib.ErrorCodes.UNAUTHORIZED, "Please authenticate.")
      }
      try {
        return await processors[action].process(mercuryEvent, this.participants)
      } catch(e) {
        log.app.error(`Error processing message: ${e ? e.message : 'null error'}\n${e ? e.stack : ''}`)
        return sender.sendError(mercuryEvent, lib.ErrorCodes.UNEXPECTED_ERROR, "Something went wrong.", {message: e.message, stack: e.stack})
      }
    })

  }
}

module.exports = EventProcessor
