import { RemoteTrackPublication, LocalTrackPublication } from 'twilio-video';

/**
 * A higher-level grouping of two Twilio publications -
 * one for audio, one for video. Either one might be missing.
 */
export type Stream = {
  /**
   * this is defined by the code creating the Stream construct, but should be unique
   * among other Streams - suggestions: video pub sid, audio pub sid, user sid + name, etc.
   */
  id: string;
  videoPublication: RemoteTrackPublication | LocalTrackPublication | null;
  audioPublication: RemoteTrackPublication | LocalTrackPublication | null;
  participantIdentity: string;
  kind: 'av' | 'screen';
};
