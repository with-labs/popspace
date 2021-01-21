class Analytics {
  constructor() {

  }

  async participantCountChanged(newCount) {
    await shared.db.analytics_online_users_count.insert({
      measured_at: shared.db.time.now(),
      users_count: newCount
    })
  }

  async participantAuthorized(participant) {
    const socketGroup = participant.getSocketGroup()
    if(!socketGroup) {
      log.app.error(`Reporting authenticated participant, but socketGroup is null ${participant.sessionName()}`)
      return
    }
    await shared.db.analytics_room_participant_count.insert({
      measured_at: shared.db.time.now(),
      room_id: socketGroup.getRoom().id,
      participant_count: socketGroup.authenticatedParticipants().length
    })
  }

  async participantLeaving(participant) {
    const socketGroup = participant.getSocketGroup()
    if(!socketGroup) {
      log.app.error(`Reporting participant leaving, but socketGroup is null ${participant.sessionName()}`)
      return
    }
    await shared.db.analytics_room_participant_count.insert({
      measured_at: shared.db.time.now(),
      room_id: socketGroup.getRoom().id,
      participant_count: socketGroup.authenticatedParticipants().length - 1
    })
  }
}

module.exports = Analytics
