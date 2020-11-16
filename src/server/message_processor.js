class MessageProcessor {
  constructor(participants) {
    this.participants = participants
    this.participants.setMessageHandler((participant, message) => {
      console.log(`Received ${message}`)
      this.participants.broadcastFrom(participant, message)
    })
  }

}

module.exports = MessageProcessor
