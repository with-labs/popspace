const processors = require("./processors/_processors")

const ACTION_BY_EVENT_KIND = {
  "room/addWidget": "create",
  "auth": "auth"
}

const PUBLIC_ACTIONS = {
  "auth": true
}

class MessageProcessor {
  constructor(participants) {
    this.participants = participants

    this.participants.setEventHandler(async (event) => {
      const action = ACTION_BY_EVENT_KIND[event.kind]
      if(this.processors[action]) {
        if(event.sender.isAuthenticated() || PUBLIC_ACTIONS[action]) {
          return await this.processors[action].process(event, this.participants)
        } else {
          event.sender.sendError(lib.ErrorCodes.UNAUTHORIZED, "Please authenticate.")
        }
      } else {
        // Eventually we'll stop re-broadcasting all events, and only allow whitelisted ones
        event.sender.send("Unrecognized event format. Broadcasting to room. ~withso")
        this.participants.broadcastFrom(participant, event.message)
      }
    })

    this.participants.setMessageHandler(async (participant, message) => {
      // relay all unrecgnized messages, but let the participant know this message is not supported
      participant.send("Unrecognized message format. Broadcasting to room. ~withso")
      this.participants.broadcastFrom(participant, message)
    })

    this.processors = {
      auth: new processors.AuthProcessor(),
      create: new processors.CreateProcessor()
    }
  }
}

module.exports = MessageProcessor
