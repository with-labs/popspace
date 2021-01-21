class Analytics {
  constructor() {

  }

  async participantCountChanged(newCount) {
    await shared.db.pg.massive.analytics_online_users_count.insert({
      measured_at: shared.db.time.now(),
      users_count: newCount
    })
  }

  async participantJoinedSocketGroup(socketGroup) {
    await shared.db.pg.massive.analytics_room_participant_count.insert({
      measured_at: shared.db.time.now(),
      room_id: socketGroup.getRoom().id,
      participant_count: socketGroup.authenticatedParticipants().length
    })
  }

  async participantLeaving(socketGroup) {
    await shared.db.pg.massive.analytics_room_participant_count.insert({
      measured_at: shared.db.time.now(),
      room_id: socketGroup.getRoom().id,
      participant_count: socketGroup.authenticatedParticipants().length
    })
  }
}

module.exports = Analytics
