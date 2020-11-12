export enum RoomState {
  Connected = 'connected',
  Reconnecting = 'reconnecting',
  Disconnected = 'disconnected',
}

export enum RoomEvent {
  TrackMessage = 'trackMessage',
  Disconnected = 'disconnected',
  TrackPublished = 'trackPublished',
  TrackDisabled = 'trackDisabled',
  TrackEnabled = 'trackEnabled',
  ParticipantConnected = 'participantConnected',
  ParticipantDisconnected = 'participantDisconnected',
  ParticipantReconnected = 'participantReconnected',
  ParticipantReconnecting = 'participantReconnecting',
  Reconnected = 'reconnected',
  Reconnecting = 'reconnecting',
  RecordingStarted = 'recordingStarted',
  RecordingStopped = 'recordingStopped',
  TrackDimensionsChanged = 'trackDimensionsChanged',
  TrackStarted = 'trackStarted',
  TrackSubscribed = 'trackSubscribed',
  TrackSwitchedOff = 'trackSwitchedOff',
  TrackSwitchedOn = 'trackSwitchedOn',
  TrackSubscriptionFailed = 'trackSubscriptionFailed',
  TrackPublishPriorityChanged = 'trackPublishPriorityChanged',
  TrackUnpublished = 'trackUnpublished',
  TrackUnsubscribed = 'trackUnsubscribed',
  DominantSpeakerChanged = 'dominantSpeakerChanged',
}

export enum ParticipantState {
  Connected = 'connected',
  Reconnecting = 'reconnecting',
}
