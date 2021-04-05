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
      mode: 'collaboration',
      renderDimensions: {
        high: { height: 1024, width: 1920 },
        standard: { height: 96, width: 160 },
        low: { height: 96, width: 160 },
      },
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
