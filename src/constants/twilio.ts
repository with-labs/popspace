import { ConnectOptions } from 'twilio-video';

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

export enum MediaTrackEvent {
  Stopped = 'stopped',
  Enabled = 'enabled',
  Disabled = 'disabled',
}

// See: https://media.twiliocdn.com/sdk/js/video/releases/2.0.0/docs/global.html#ConnectOptions
// for available connection options.
export const TWILIO_CONNECTION_OPTIONS: ConnectOptions = {
  bandwidthProfile: {
    video: {
      // Using grid mode for equal bandwidth priority between all parties.
      // For more detailed information on grid, see
      // https://www.twilio.com/docs/video/tutorials/using-bandwidth-profile-api#grid-mode
      mode: 'grid',
    },
  },
  dominantSpeaker: false,
  maxAudioBitrate: 48000,
  // disabled since we don't use it - we could re-enable this to
  // display network quality level to users, but without using it it just
  // wastes CPU cycles
  // networkQuality: { local: 1, remote: 1 },
  preferredVideoCodecs: [{ codec: 'VP8', simulcast: true }],
  // don't connect any tracks by default
  tracks: [],
};
