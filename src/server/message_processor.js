const processors = require("./processors/_processors")

const ACTION_BY_EVENT_KIND = {
  "room/addWidget": "create",
  "auth": "auth"
}

const PUBLIC_ACTIONS = {
  "auth": true,
  "ping": true
}

class MessageProcessor {
  constructor(participants) {
    this.participants = participants

    this.participants.setEventHandler(async (event) => {
      const action = ACTION_BY_EVENT_KIND[event.data.kind]
      if(this.processors[action]) {
        if(event._sender.isAuthenticated() || PUBLIC_ACTIONS[action]) {
          try {
            return await this.processors[action].process(event, this.participants)
          } catch(e) {
            return event._sender.sendError(event, lib.ErrorCodes.UNEXPECTED_ERROR, "Something went wrong.")
          }

        } else {
          return event._sender.sendError(event, lib.ErrorCodes.UNAUTHORIZED, "Please authenticate.")
        }
      } else {
        return event._sender.sendError(event, lib.ErrorCodes.MESSAGE_INVALID_FORMAT, `Unrecognized event format ${event._message}.`)
      }
    })

    this.participants.setMessageHandler(async (participant, message) => {
      // relay all unrecgnized messages, but let the participant know this message is not supported
      // participant.send(`Unrecognized message format ${message}. Broadcasting to room. ~withso`)
      this.participants.broadcastFrom(participant, message)
    })

    this.processors = {
      auth: new processors.AuthProcessor(),
      create: new processors.CreateProcessor()
    }
  }
}

module.exports = MessageProcessor
