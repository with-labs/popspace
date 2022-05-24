class Analytics {
  constructor() {
    this.roomUsageIdByParticipantId = {}
    this.voiceUsageIdByParticipantId = {}
    this.videoUsageIdByParticipantId = {}
  }

  async participantCountChanged(newCount) {
    await shared.db.prisma.analyticsTotalParticipantCount.create({
      data: {
        measuredAt: shared.db.time.now(),
        count: newCount
      }
    })
  }

  async participantJoinedSocketGroup(socketGroup) {
    await shared.db.prisma.analyticsRoomParticipantCount.create({
      data: {
        measuredAt: shared.db.time.now(),
        roomId: socketGroup.getRoom().id,
        participantCount: socketGroup.authenticatedParticipants().length
      }
    })
  }

  async participantLeft(socketGroup) {
    await shared.db.prisma.analyticsRoomParticipantCount.create({
      data: {
        measuredAt: shared.db.time.now(),
        roomId: socketGroup.getRoom().id,
        participantCount: socketGroup.authenticatedParticipants().length
      }
    })
  }

  async beginSession(participant, socketGroup) {
    const roomUsageEntry = await shared.db.prisma.analyticsRoomUsage.create({
      data: {
        roomId: participant.roomId(),
        actorId: participant.actorId(),
        participantId: participant.sessionId(),
        beganAt: shared.db.time.now(),
        lastHeartbeatAt: shared.db.time.now()
      }
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
    await shared.db.prisma.analyticsRoomUsage.update({
      where: {id: entryId},
      data: {lastHeartbeatAt: shared.db.time.now()}
    })
  }

  async toggleVoice(event) {
    const toggleEntry = await shared.db.prisma.analyticsMicUsage.create({
      data: {
        roomId: event.roomId(),
        actorId: event.actorId(),
        participantId: event.sessionId(),
        isToggledOn: event.payload().isOn,
        toggledAt: shared.db.time.now(),
        lastHeartbeatAt: shared.db.time.now()
      }
    })

    this.voiceUsageIdByParticipantId[event.sessionId()] = toggleEntry.id
  }

  async updateVoiceDuration(participant) {
    const entryId = this.voiceUsageIdByParticipantId[participant.sessionId()]
    if(!entryId){

      return
    }

    await shared.db.prisma.analyticsMicUsage.update({
      where: {id: entryId},
      data: {lastHeartbeatAt: shared.db.time.now()}
    })
  }

  async toggleVideo(event) {
    const toggleEntry = await shared.db.prisma.analyticsCameraUsage.create({
      data:{
        roomid: event.roomId(),
        actorId: event.actorId(),
        participantId: event.sessionId(),
        isToggledOn: event.payload().isOn,
        toggledAt: shared.db.time.now(),
        lastHeartbeatAt: shared.db.time.now()
      }
    })

    this.videoUsageIdByParticipantId[event.sessionId()] = toggleEntry.id
  }

  async updateVideoDuration(participant) {
    const entryId = this.videoUsageIdByParticipantId[participant.sessionId()]
    if(!entryId){
      return
    }

    await shared.db.prisma.analyticsCameraUsage.update({
      where: {id: entryId},
      data: {lastHeartbeatAt: shared.db.time.now()}
    })
  }
}

module.exports = Analytics
