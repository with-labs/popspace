const _processors = require("./processors/_processors")

const ACTION_BY_EVENT_KIND = {
  "room/addWidget": "create",
  "room/moveObject": "mutate",
  "room/get": "get",
  "auth": "auth",
  "ping": "ping"
}

const PUBLIC_ACTIONS = {
  "auth": true,
  "ping": true
}

const processors = {
  auth: new _processors.AuthProcessor(),
  create: new _processors.CreateProcessor(),
  mutate: new _processors.MutateProcessor(),
  get: new _processors.GetProcessor()
}

class MessageProcessor {
  constructor(participants) {
    this.participants = participants

    this.participants.setEventHandler(async (event) => {
      const action = ACTION_BY_EVENT_KIND[event.data.kind]
      const sender = event._sender
      if(!processors[action]) {
        return sender.sendError(event, lib.ErrorCodes.MESSAGE_INVALID_FORMAT, `Unrecognized event ${event.data.kind}.`)
      }
      if(!PUBLIC_ACTIONS[action] && !sender.isAuthenticated()) {
        return sender.sendError(event, lib.ErrorCodes.UNAUTHORIZED, "Please authenticate.")
      }
      try {
        return await processors[action].process(event, this.participants)
      } catch(e) {
        log.app.error(`Error processing message: ${e ? e.message : 'null error'}\n${e ? e.stack : ''}`)
        return sender.sendError(event, lib.ErrorCodes.UNEXPECTED_ERROR, "Something went wrong.")
      }
    })

    this.participants.setMessageHandler(async (participant, message) => {
      // Let sender know this format isn't supported?
      // participant.send(`Unrecognized message format ${message}. Broadcasting to room. ~withso`)
      // relay all unrecognized messages?
      this.participants.broadcastFrom(participant, message)
    })
  }
}

module.exports = MessageProcessor
