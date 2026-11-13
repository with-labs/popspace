import { logger } from './logger';
import {
  LocalTrackPublication,
  Participant,
  RemoteParticipant,
  Room,
  RoomEvent,
  RoomOptions,
  Track,
  TrackPublication,
} from 'livekit-client';

import {
  MediaProvider,
  MediaProviderSid,
  TrackType,
} from '@withso/pop-media-sdk';

const liveKitSourceMap = {
  [TrackType.Camera]: Track.Source.Camera,
  [TrackType.Microphone]: Track.Source.Microphone,
  [TrackType.Screen]: Track.Source.ScreenShare,
  [TrackType.ScreenAudio]: Track.Source.ScreenShareAudio,
};
const trackTypeMap = {
  [Track.Source.Camera]: TrackType.Camera,
  [Track.Source.Microphone]: TrackType.Microphone,
  [Track.Source.ScreenShare]: TrackType.Screen,
  [Track.Source.ScreenShareAudio]: TrackType.ScreenAudio,
};

export class LiveKitProvider extends MediaProvider {
  private _room: Room | null = null;

  constructor(private endpoint: string, private roomOptions: RoomOptions = {}) {
    super();
  }

  protected connectToRoom = async (
    mediaToken: string,
    localTracks: Record<TrackType, MediaStreamTrack | null>,
  ) => {
    const room = new Room({
      ...this.roomOptions,
      // this is necessary to enforce to maintain SDK behavior consistency
      stopLocalTrackOnUnpublish: false,
    });
    this._room = room;

    logger.debug(
      '[LiveKit] connected, local participant SID',
      room.localParticipant.sid,
    );

    room.on(RoomEvent.Disconnected, this.handleDisconnect);
    room.on(RoomEvent.Reconnected, this.handleReconnect);
    room.on(RoomEvent.Reconnecting, this.handleReconnecting);
    room.on(RoomEvent.ParticipantConnected, this.handleParticipantConnected);
    room.on(
      RoomEvent.ParticipantDisconnected,
      this.handleParticipantDisconnected,
    );
    room.on(RoomEvent.TrackSubscribed, this.handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed);
    room.on(RoomEvent.DataReceived, this.handleData);
    room.on(RoomEvent.LocalTrackPublished, this.handleLocalTrackPublished);
    room.on(RoomEvent.LocalTrackUnpublished, this.handleLocalTrackUnpublished);

    await room.connect(this.endpoint, mediaToken);

    // immediately trigger connection events for all existing participants
    this.handleParticipantConnected(room.localParticipant);
    for (const participant of room.remoteParticipants.values()) {
      this.handleParticipantConnected(participant);
    }

    // immediately publish local tracks
    await Promise.all(
      Object.entries(localTracks).map(async ([trackType, track]) => {
        if (track) {
          await this.startMediaInternal(trackType as TrackType, track);
          logger.debug('[LiveKit] published initial local track', trackType);
        }
      }),
    );
  };

  private handleDisconnect = () => {
    logger.debug('[LiveKit] disconnected');
    this.onDisconnect();
  };

  private handleReconnecting = () => {
    logger.debug('[LiveKit] reconnecting');
    this.onReconnecting();
  };

  private handleReconnect = () => {
    logger.debug('[LiveKit] reconnected');
    this.onReconnect();
  };

  private handleParticipantConnected = (participant: Participant) => {
    logger.debug(`[LiveKit] participant connected: ${participant.sid}`);
    // get the participant ID - it's stored as their identity
    const appId = participant.identity;
    this.onParticipantConnected(participant.sid, appId);
    // immediately trigger start events for all participant tracks
    for (const track of participant.trackPublications.values()) {
      if (track.track) {
        this.handleTrackSubscribed(track.track, track, participant);
      }
    }
  };

  private handleParticipantDisconnected = (participant: Participant) => {
    logger.debug(`[LiveKit] participant disconnected: ${participant.sid}`);
    this.onParticipantDisconnected(participant.sid);
    // immediately trigger end events for all participant tracks
    for (const track of participant.trackPublications.values()) {
      if (track.track) {
        this.handleTrackUnsubscribed(track.track, track, participant);
      }
    }
  };

  private getTrackType = (track: TrackPublication) => {
    if (track.source === Track.Source.Unknown || !track.source) {
      // try the name...
      return track.trackName as TrackType;
    }
    return trackTypeMap[track.source];
  };

  private handleTrackSubscribed = (
    track: Track,
    pub: TrackPublication,
    participant: Participant,
  ) => {
    logger.debug(
      `[LiveKit] track subscribed: ${track.sid} by ${participant.sid}. MediaStreamTrack ID: ${track.mediaStreamTrack.id}`,
    );
    if (!track.sid) {
      // TODO: what?
      logger.error('[LiveKit] track has no SID');
      return;
    }
    const trackType = this.getTrackType(pub);
    this.onTrackSubscribed(participant.sid, trackType);
  };

  private handleTrackUnsubscribed = (
    track: Track,
    pub: TrackPublication,
    participant: Participant,
  ) => {
    logger.debug(
      `[LiveKit] track unsubscribed: ${track.sid} by ${participant.sid}`,
    );
    if (!track.sid) {
      // TODO: what?
      logger.error('[LiveKit] track has no SID');
      return;
    }
    const trackType = this.getTrackType(pub);
    if (!trackType) {
      logger.warn(
        '[LiveKit] track unsubscribed but track type not recognized',
        track.sid,
        participant.sid,
      );
      return;
    }
    this.onTrackUnsubscribed(participant.sid, trackType);
  };

  protected disconnectFromRoom = async () => {
    if (this._room) {
      this._room.disconnect(false);
      // act as if our own participant disconnected - LiveKit will not fire these
      // events like it would for remote participants
      this.handleParticipantDisconnected(this._room.localParticipant);
      this._room = null;
    }
  };

  getMediaStreamTrack = (participantSid: string, trackSid: string) => {
    if (!this._room) return null;

    const participant = this.getParticipantBySid(participantSid);
    if (!participant) {
      logger.warn(`[LiveKit] Participant with sid ${participantSid} not found`);
      return null;
    }

    const mediaTrackPub = participant.trackPublications.get(trackSid) ?? null;
    if (!mediaTrackPub) {
      logger.warn(`[LiveKit] Media track with sid ${trackSid} not found`);
      return null;
    }

    return mediaTrackPub.track?.mediaStreamTrack ?? null;
  };

  protected getLocalParticipantSid = () => {
    return this._room?.localParticipant.sid ?? null;
  };

  protected publishLocalMedia = async (
    trackType: TrackType,
    mediaTrack: MediaStreamTrack,
  ) => {
    if (!this._room) {
      throw new Error('Cannot start media before room is connected');
    }

    const pub = await this._room.localParticipant.publishTrack(mediaTrack, {
      name: trackType,
      source: liveKitSourceMap[trackType],
    });
    logger.debug(
      '[LiveKit] published track',
      pub.trackSid,
      liveKitSourceMap[trackType],
    );
    return pub.trackSid;
  };

  protected unpublishLocalMedia = async (trackSid: string) => {
    if (!this._room) return;

    const pub = this._room.localParticipant.trackPublications.get(trackSid);
    if (!pub?.track) return;
    logger.debug('[LiveKit] unpublished track', pub.trackSid);
    this._room.localParticipant.unpublishTrack(pub.track);
  };

  private handleLocalTrackPublished = async (pub: LocalTrackPublication) => {
    const trackType = this.getTrackType(pub);
    if (this._room) {
      this.onLocalTrackPublished(trackType);
    }
  };
  private handleLocalTrackUnpublished = async (pub: LocalTrackPublication) => {
    const trackType = this.getTrackType(pub);
    if (this._room) {
      this.onLocalTrackUnpublished(trackType);
    }
  };

  private getParticipantBySid = (sid: string): Participant | null => {
    if (!this._room) return null;

    if (this._room.localParticipant.sid === sid) {
      return this._room.localParticipant;
    }

    // remote participants are keyed by identity, not SID
    for (const participant of this._room.remoteParticipants.values()) {
      if (participant.sid === sid) return participant;
    }
    return null;
  };

  protected getParticipantIdFromSid = (sid: MediaProviderSid) => {
    return this.getParticipantBySid(sid as string)?.identity ?? null;
  };

  protected getTrackTypeFromTrackSid = (
    participantSid: MediaProviderSid,
    trackSid: MediaProviderSid,
  ) => {
    if (!this._room) return null;

    const participant = this.getParticipantBySid(participantSid as string);
    const pub = participant?.trackPublications.get(trackSid as string);

    if (!pub?.track) return null;
    return this.getTrackType(pub);
  };

  protected getParticipantTrackSids = (participantSid: MediaProviderSid) => {
    if (!this._room) return [];

    const participant = this.getParticipantBySid(participantSid as string);
    if (!participant) return [];

    return Array.from(participant.trackPublications.keys());
  };

  private textEncoder = new TextEncoder();
  sendMessage(message: string): void {
    if (!this._room) return;
    this._room.localParticipant.publishData(
      this.textEncoder.encode(message),
      { reliable: false },
    );
  }

  private textDecoder = new TextDecoder('utf-8');
  private handleData = (
    message: Uint8Array,
    participant: RemoteParticipant | undefined,
  ) => {
    if (!participant) {
      logger.warn('[LiveKit] data received from unknown participant');
      return;
    }
    this.onMessage(participant.sid, this.textDecoder.decode(message));
  };
}
