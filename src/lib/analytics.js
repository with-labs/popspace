class Analytics {
  constructor() {
    this.roomUsageIdByParticipantId = {}
    this.voiceUsageIdByParticipantId = {}
    this.videoUsageIdByParticipantId = {}
  }

  async participantCountChanged(newCount) {
    await shared.db.pg.massive.analytics_total_participant_counts.insert({
      measured_at: shared.db.time.now(),
      count: newCount
    })
  }

  async participantJoinedSocketGroup(socketGroup) {
    await shared.db.pg.massive.analytics_room_participant_count.insert({
      measured_at: shared.db.time.now(),
      room_id: socketGroup.getRoom().id,
      participant_count: socketGroup.authenticatedParticipants().length
    })
  }

  async participantLeft(socketGroup) {
    await shared.db.pg.massive.analytics_room_participant_count.insert({
      measured_at: shared.db.time.now(),
      room_id: socketGroup.getRoom().id,
      participant_count: socketGroup.authenticatedParticipants().length
    })
  }

  async beginSession(participant, socketGroup) {
    const roomUsageEntry = await shared.db.pg.massive.analytics_room_usage.insert({
      room_id: participant.roomId(),
      actor_id: participant.actorId(),
      participant_id: participant.sessionId(),
      began_at: shared.db.time.now(),
      last_heartbeat_at: shared.db.time.now()
    })
    /*
      Since participant_ids reset between hermes run, we can't rely on them
      to identify a usage session.

      So instead, every time beginSession() is called, remember the id of
      the analytics entry. That in-memory store will be reset if participant ids are reset,
      and even if we have the same participant_id - we'll know it maps to
      a different analytics entry.
    */
    this.roomUsageIdByParticipantId[participant.sessionId()] = roomUsageEntry.id
  }

  async updateSessionLength(participant) {
    const entryId = this.roomUsageIdByParticipantId[participant.sessionId()]
    if(!entryId) {
      return
    }
    await shared.db.pg.massive.analytics_room_usage.update(
      {id: entryId},
      {last_heartbeat_at: shared.db.time.now()}
    )
  }

  async toggleVoice(event) {
    const toggleEntry = await shared.db.pg.massive.analytics_voice_usage.insert({
      room_id: event.roomId(),
      actor_id: event.actorId(),
      participant_id: event.sessionId(),
      is_toggled_on: event.payload().is_on,
      toggled_at: shared.db.time.now(),
      last_heartbeat_at: shared.db.time.now()
    })

    this.voiceUsageIdByParticipantId[event.sessionId()] = toggleEntry.id
  }

  async updateVoiceDuration(participant) {
    const entryId = this.voiceUsageIdByParticipantId[participant.sessionId()]
    if(!entryId){
      return
    }

    await shared.db.pg.massive.analytics_voice_usage.update(
      {id: entryId},
      {last_heartbeat_at: shared.db.time.now()}
    )
  }

  async toggleVideo(event) {
    const toggleEntry = await shared.db.pg.massive.analytics_video_usage.insert({
      room_id: event.roomId(),
      actor_id: event.actorId(),
      participant_id: event.sessionId(),
      is_toggled_on: event.payload().is_on,
      toggled_at: shared.db.time.now(),
      last_heartbeat_at: shared.db.time.now()
    })

    this.videoUsageIdByParticipantId[event.sessionId()] = toggleEntry.id
  }

  async updateVideoDuration(participant) {
    const entryId = this.videoUsageIdByParticipantId[participant.sessionId()]
    if(!entryId){
      return
    }

    await shared.db.pg.massive.analytics_video_usage.update(
      {id: entryId},
      {last_heartbeat_at: shared.db.time.now()}
    )
  }
}

module.exports = Analytics
