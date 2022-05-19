/**
 * A higher-level grouping of two media tracks -
 * one for audio, one for video. Either one might be missing.
 */
export type Stream = {
  /**
   * this is defined by the code creating the Stream construct, but should be unique
   * among other Streams - suggestions: video pub sid, audio pub sid, user sid + name, etc.
   */
  id: string;
  videoTrack: MediaStreamTrack | null;
  audioTrack: MediaStreamTrack | null;
  participantId: string;
  kind: 'av' | 'screen';
};
