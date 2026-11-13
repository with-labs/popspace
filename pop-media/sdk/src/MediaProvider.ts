import EventEmitter from 'events';
import { logger } from './logger';

export enum TrackType {
  Camera = 'camera',
  Microphone = 'microphone',
  Screen = 'screen',
  ScreenAudio = 'screen-audio',
}

export enum MediaState {
  Connecting = 'connecting',
  Connected = 'connected',
  Reconnecting = 'reconnecting',
  Disconnected = 'disconnected',
}

export type MediaProviderSid = string | number;

export interface MediaProviderEvents {
  /**
   * These are optional errors you may want to pay attention to, but
   * which won't cause anything to crash by default. They may indicate
   * a problem with your provider implementation.
   */
  warning: (error: Error) => void;
  connecting: () => void;
  connected: () => void;
  reconnecting: () => void;
  disconnected: () => void;
  error: (error: Error) => void;
  remoteTrackStarted: (participantId: string, trackType: TrackType) => void;
  remoteTrackStopped: (participantId: string, trackType: TrackType) => void;
  trackStarted: (participantId: string, trackType: TrackType) => void;
  trackStopped: (participantId: string, trackType: TrackType) => void;
  participantConnected: (participantId: string) => void;
  participantDisconnected: (participantId: string) => void;
  message: (sourceParticipantId: string, message: string) => void;
}

export declare interface MediaProvider {
  on<Event extends keyof MediaProviderEvents>(
    ev: Event,
    cb: MediaProviderEvents[Event],
  ): this;
  off<Event extends keyof MediaProviderEvents>(
    ev: Event,
    cb: MediaProviderEvents[Event],
  ): this;
  emit<Event extends keyof MediaProviderEvents>(
    ev: Event,
    ...args: Parameters<MediaProviderEvents[Event]>
  ): boolean;
}

export abstract class MediaProvider extends EventEmitter {
  private _mediaState: MediaState = MediaState.Disconnected;

  get mediaState() {
    return this._mediaState;
  }

  connect = async (
    accessToken: string,
    localTracks: Record<TrackType, MediaStreamTrack | null>,
  ) => {
    this._mediaState = MediaState.Connecting;
    this.emit('connecting');
    await this.connectToRoom(accessToken, localTracks);
    this._mediaState = MediaState.Connected;
    this.emit('connected');
  };

  disconnect = async () => {
    if (this._mediaState === MediaState.Disconnected) {
      return;
    }
    await this.disconnectFromRoom();
    this._mediaState = MediaState.Disconnected;
    this.emit('disconnected');
  };

  /** Room state management */
  protected onDisconnect = () => {
    this._mediaState = MediaState.Disconnected;
    this.emit('disconnected');
  };
  protected onReconnecting = () => {
    this._mediaState = MediaState.Reconnecting;
    this.emit('reconnecting');
  };
  protected onReconnect = () => {
    this._mediaState = MediaState.Connected;
    this.emit('connected');
  };

  get localParticipantId() {
    const sid = this.getLocalParticipantSid();
    if (!sid) return null;
    return this.getParticipantIdFromSid(sid);
  }

  /**
   * Starting and stopping local media devices
   */
  async startMediaInternal(trackType: TrackType, track: MediaStreamTrack) {
    const localParticipantSid = this.getLocalParticipantSid();
    if (!localParticipantSid) return;
    await this.publishLocalMedia(trackType, track);
    const participantId = this.localParticipantId;
    if (!participantId) {
      // local participant SID has not been assigned yet
      logger.debug(
        `[MediaProvider] media started but local participant SID not yet assigned`,
      );
      return;
    }
    this.emit('trackStarted', participantId, trackType);
  }
  async stopMediaInternal(trackType: TrackType) {
    const localParticipantSid = this.getLocalParticipantSid();
    if (!localParticipantSid) return;
    const trackSid = this.getParticipantTrackSidByType(
      localParticipantSid,
      trackType,
    );
    if (!trackSid) {
      return;
    }
    await this.unpublishLocalMedia(trackSid, trackType);
    const participantId = this.localParticipantId;
    if (!participantId) {
      // local participant SID has not been assigned yet
      return;
    }
    this.emit('trackStopped', participantId, trackType);
  }

  getParticipantTrack(
    participantId: string,
    trackType: TrackType,
  ): MediaStreamTrack | null {
    // map participant ID to media ID
    const participantSid = this.getParticipantSidFromId(participantId);
    if (!participantSid) {
      return null;
    }
    // find the track by type
    const trackSid = this.getParticipantTrackSidByType(
      participantSid,
      trackType,
    );
    if (!trackSid) {
      return null;
    }
    const track = this.getMediaStreamTrack(participantSid, trackSid);
    return track;
  }

  protected onTrackSubscribed = (
    participantSid: MediaProviderSid,
    trackType: TrackType,
  ) => {
    const participantId = this.getParticipantIdFromSid(participantSid);
    if (!participantId) {
      this.emit(
        'warning',
        new Error(
          'Track published from unrecognized participant ' +
            participantSid +
            ', cannot start track',
        ),
      );
      return;
    }
    this.emit('remoteTrackStarted', participantId, trackType);
    this.emit('trackStarted', participantId, trackType);
  };

  protected onTrackUnsubscribed = (
    participantSid: MediaProviderSid,
    trackType: TrackType,
  ) => {
    const participantId = this.getParticipantIdFromSid(participantSid);
    if (!participantId) {
      this.emit(
        'warning',
        new Error(
          'Track unpublished from unrecognized participant ' +
            participantSid +
            ', cannot stop track',
        ),
      );
      return;
    }
    this.emit('remoteTrackStopped', participantId, trackType);
    this.emit('trackStopped', participantId, trackType);
  };

  protected onLocalTrackPublished = (trackType: TrackType) => {
    const localSid = this.getLocalParticipantSid();
    const localId = localSid && this.getParticipantIdFromSid(localSid);
    if (localId) {
      this.emit('trackStarted', localId, trackType);
    }
  };

  protected onLocalTrackUnpublished = (trackType: TrackType) => {
    const localSid = this.getLocalParticipantSid();
    const localId = localSid && this.getParticipantIdFromSid(localSid);
    if (localId) {
      this.emit('trackStopped', localId, trackType);
    }
  };

  /** Participant management */

  private _participantSidAssociationMap = new Map<string, MediaProviderSid>();
  /**
   * You must call this method when a new participant joins to associate
   * their internal media provider ID (such as a Twilio SID) with the
   * external app ID for the participant according to the consumer.
   */
  private associateParticipantWithId = (
    participantSid: MediaProviderSid,
    participantId: string,
  ) => {
    this._participantSidAssociationMap.set(participantId, participantSid);
    this._participantSidToIdCache.set(participantSid, participantId);
  };
  private getParticipantSidFromId = (participantId: string) => {
    return this._participantSidAssociationMap.get(participantId) ?? null;
  };

  getParticipantIds = () => {
    return Array.from(this._participantSidAssociationMap.keys());
  };

  protected onParticipantConnected = (
    participantSid: MediaProviderSid,
    participantId: string,
  ) => {
    this.associateParticipantWithId(participantSid, participantId);
    this.emit('participantConnected', participantId);
  };

  protected onParticipantDisconnected = (participantSid: MediaProviderSid) => {
    const participantId = this._participantSidToIdCache.get(participantSid);
    if (participantId) {
      this._participantSidAssociationMap.delete(participantId);
      this._participantSidToIdCache.delete(participantSid);
      this.emit('participantDisconnected', participantId);
    } else {
      this.emit(
        'warning',
        new Error('Unrecognized participant disconnected ' + participantSid),
      );
    }
  };

  /**
   * This cache is necessary specifically for disconnects.
   * We can't rely on the implemented provider to still 'remember' a
   * participant after they disconnect, but we still need to lookup their
   * ID. So we cache the reverse lookup of SID->ID, then evict once
   * they're disconnected.
   */
  private _participantSidToIdCache = new Map<MediaProviderSid, string>();

  /**
   * Messages
   */
  broadcastMessage = (message: string) => {
    this.sendMessage(message);
  };

  protected onMessage = (
    sourceParticipantSid: MediaProviderSid,
    message: string,
  ) => {
    const participantId = this.getParticipantIdFromSid(sourceParticipantSid);
    if (!participantId) {
      this.emit(
        'warning',
        new Error(
          'Message received from unrecognized participant ' +
            sourceParticipantSid +
            ', cannot process message',
        ),
      );
      return;
    }
    this.emit('message', participantId, message);
  };

  /**
   * Implement logic to retrieve a native MediaStreamTrack from the associated
   * ID according to your media provider (like a Twilio SID, etc).
   */
  protected abstract getMediaStreamTrack(
    participantSid: MediaProviderSid,
    trackSid: MediaProviderSid,
  ): MediaStreamTrack | null;
  /**
   * @returns the media ID for the started track
   */
  protected abstract publishLocalMedia(
    trackType: TrackType,
    track: MediaStreamTrack,
  ): Promise<MediaProviderSid>;
  protected abstract unpublishLocalMedia(
    trackSid: MediaProviderSid,
    trackType: TrackType,
  ): Promise<void>;
  protected abstract connectToRoom(
    accessToken: string,
    localTracks: Record<TrackType, MediaStreamTrack | null>,
  ): Promise<void>;
  protected abstract disconnectFromRoom(): Promise<void>;
  protected abstract getLocalParticipantSid(): MediaProviderSid | null;
  protected abstract getParticipantTrackSids(
    participantSid: MediaProviderSid,
  ): MediaProviderSid[];

  // conversion of provider identifiers to external identifiers
  protected abstract getParticipantIdFromSid(
    participantSid: MediaProviderSid,
  ): string | null;
  protected abstract getTrackTypeFromTrackSid(
    participantSid: MediaProviderSid,
    trackSid: MediaProviderSid,
  ): TrackType | null;

  // you can override this to provide a more efficient access method!
  protected getParticipantTrackSidByType(
    participantSid: MediaProviderSid,
    trackType: TrackType,
  ) {
    const trackSids = this.getParticipantTrackSids(participantSid);
    const trackSid = trackSids.find(
      (sid) => this.getTrackTypeFromTrackSid(participantSid, sid) === trackType,
    );
    if (!trackSid) {
      return null;
    }
    return trackSid;
  }

  protected abstract sendMessage(message: string): void;
}
