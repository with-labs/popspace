import EventEmitter from 'events';
import { logger } from './logger';
import {
  isMediaDeniedError,
  isMediaDismissedError,
  isSystemPermissionsError,
} from './mediaErrors';

import { MediaLocalTracks } from './MediaLocalTracks';
import {
  MediaProvider,
  MediaProviderEvents,
  MediaState,
  TrackType,
} from './MediaProvider';
import {
  MediaTokenProvider,
  TokenProviderConnectionParams,
} from './MediaTokenProvider';
import {
  LocalStoragePreferredDeviceStorage,
  PreferredDeviceStorage,
} from './PreferredDeviceStorage';

export interface MediaServiceOptions<TokenProvider extends MediaTokenProvider> {
  providers: Record<string, MediaProvider>;
  tokenProvider: TokenProvider;
  preferredDeviceStorage?: PreferredDeviceStorage;
  localMicVolumeThreshold?: number;
  defaultCameraConstraints?: MediaTrackConstraints;
  defaultMicrophoneConstraints?: MediaTrackConstraints;
  defaultScreenConstraints?: MediaStreamConstraints;
}

export interface MediaServiceEvents extends MediaProviderEvents {
  providerChanged: (connectionInfo: {
    providerName: string;
    token: string;
  }) => void;
  mediaDevicesChanged: (devices: MediaDeviceInfo[]) => void;
  preferredCameraDeviceIdChanged: (deviceId: string | null) => void;
  preferredMicrophoneDeviceIdChanged: (deviceId: string | null) => void;
  localTrackStarting: (trackType: TrackType) => void;
  localTrackStarted: (trackType: TrackType) => void;
  localTrackStopping: (trackType: TrackType) => void;
  localTrackStopped: (trackType: TrackType) => void;
  deviceAccessDenied: (trackType: TrackType, error: Error) => void;
  participantSpeakingStateChanged: (
    participantId: string,
    speaking: boolean,
  ) => void;
}

export declare interface MediaService<
  TokenProvider extends MediaTokenProvider<any>,
> {
  on<Event extends keyof MediaServiceEvents>(
    ev: Event,
    cb: MediaServiceEvents[Event],
  ): this;
  off<Event extends keyof MediaServiceEvents>(
    ev: Event,
    cb: MediaServiceEvents[Event],
  ): this;
  emit<Event extends keyof MediaServiceEvents>(
    ev: Event,
    ...args: Parameters<MediaServiceEvents[Event]>
  ): boolean;
}

export class MediaService<
  TokenProvider extends MediaTokenProvider<any>,
> extends EventEmitter {
  private providers: Record<string, MediaProvider>;
  private tokenProvider: MediaTokenProvider;
  private localTracks: MediaLocalTracks;
  private _activeProviderName: string = 'PopStage';
  private _preferredDeviceId: Record<string, string | null> = {
    [TrackType.Camera]: null,
    [TrackType.Microphone]: null,
  };
  private preferredDeviceStorage: PreferredDeviceStorage;
  private _mediaDevices: MediaDeviceInfo[] = [];
  private _isStartingMediaType = {
    [TrackType.Camera]: false,
    [TrackType.Microphone]: false,
    [TrackType.Screen]: false,
    [TrackType.ScreenAudio]: false,
  };
  private participantSpeakingStates = new Map<string, boolean>();
  private _defaultCameraConstraints?: MediaTrackConstraints;
  private _defaultMicrophoneConstraints?: MediaTrackConstraints;
  private _defaultScreenConstraints?: MediaStreamConstraints;
  private _hasStartedAnyDevice = false;

  constructor({
    providers,
    tokenProvider,
    preferredDeviceStorage = new LocalStoragePreferredDeviceStorage(),
    localMicVolumeThreshold = 0.002,
    defaultCameraConstraints,
    defaultMicrophoneConstraints,
    defaultScreenConstraints,
  }: MediaServiceOptions<TokenProvider>) {
    super();
    this.providers = providers;
    this.tokenProvider = tokenProvider;
    this.preferredDeviceStorage = preferredDeviceStorage;
    this._defaultCameraConstraints = defaultCameraConstraints;
    this._defaultMicrophoneConstraints = defaultMicrophoneConstraints;
    this._defaultScreenConstraints = defaultScreenConstraints;
    this.localTracks = new MediaLocalTracks(localMicVolumeThreshold);

    // re-emit local track events
    this.localTracks.on('trackStarting', (trackType) => {
      this.emit('localTrackStarting', trackType);
    });
    this.localTracks.on('trackStopping', (trackType) => {
      this.emit('localTrackStopping', trackType);
    });

    // sync media devices when permissions change
    if (typeof window !== 'undefined') {
      this._preferredDeviceId[TrackType.Camera] =
        this.preferredDeviceStorage.getDeviceId(TrackType.Camera) || null;
      this._preferredDeviceId[TrackType.Microphone] =
        this.preferredDeviceStorage.getDeviceId(TrackType.Microphone) || null;

      this.syncMediaDevices();
      // Safari!
      if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
        navigator.permissions
          .query({
            name: 'camera' as any,
          })
          .then((permissionStatus) => {
            permissionStatus.addEventListener('change', this.syncMediaDevices);
          })
          .catch((err) => {
            // ignore - sorry FireFox.
          });
        navigator.permissions
          .query({
            name: 'microphone' as any,
          })
          .then((permissionStatus) => {
            permissionStatus.addEventListener('change', this.syncMediaDevices);
          })
          .catch((err) => {
            // ignore - sorry FireFox.
          });
      }
    }

    this.localTracks.on(
      'localMicVolumeThresholdChange',
      this.handleLocalSpeakingChange,
    );
  }

  get providerName() {
    return this._activeProviderName;
  }

  /**
   * Call to connect to a media provider. If the service is already connected
   * to a different provider, it will switch providers.
   */
  connect = async (
    connectionParams: TokenProviderConnectionParams<TokenProvider>,
  ) => {
    if (!this.providers[connectionParams.providerName]) {
      throw new Error(
        `No media provider named "${connectionParams.providerName}" exists`,
      );
    }

    const token = await this.tokenProvider.getToken(connectionParams);
    this.emit('providerChanged', {
      token,
      providerName: connectionParams.providerName,
    });
    await this.activeProvider?.disconnect();
    this.cleanupProviderEvents();
    this._activeProviderName = connectionParams.providerName;
    if (!this.activeProvider) {
      throw new Error(
        `Failed to start provider [${connectionParams.providerName}]`,
      );
    }
    this.handleProviderEvents(this.activeProvider);
    await this.activeProvider.connect(token, this.localTracks.tracks);
  };

  private cleanupProviderEvents = () => {};
  private createEcho = (eventType: keyof MediaProviderEvents) => {
    return (...params: any[]) => {
      logger.debug('[Media] ', eventType, ...params);
      this.emit(eventType, ...(params as any));
    };
  };
  private handleProviderEvents = (provider: MediaProvider) => {
    const echoCancels = new Array<() => {}>();
    (
      [
        'connecting',
        'connected',
        'disconnected',
        'reconnecting',
        'error',
        'warning',
        'trackStarted',
        'trackStopped',
        'remoteTrackStarted',
        'remoteTrackStopped',
        'participantConnected',
        'participantDisconnected',
      ] as const
    ).forEach((eventType) => {
      const echo = this.createEcho(eventType);
      provider.on(eventType, echo);
      echoCancels.push(() => provider.off(eventType, echo));
    });
    provider.on('trackStopped', this.handleTrackStopped);
    provider.on('message', this.handleMessage);
    this.cleanupProviderEvents = () => {
      echoCancels.forEach((cancel) => cancel());
      provider.off('trackStopped', this.handleTrackStopped);
      provider.off('message', this.handleMessage);
    };
  };

  private get activeProvider(): MediaProvider | null {
    return this.providers[this._activeProviderName];
  }

  public get mediaState() {
    return this.activeProvider?.mediaState || MediaState.Disconnected;
  }

  disconnect = async (endStreams = true) => {
    await this.activeProvider?.disconnect();
    if (endStreams) {
      this.localTracks.stopAll();
    }
  };

  /** Media device management */
  private syncMediaDevices = () => {
    if (typeof navigator !== 'undefined' && 'mediaDevices' in navigator) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          this._mediaDevices = devices;
          this.emit('mediaDevicesChanged', devices);
        })
        .catch((err) => {
          this.emit('error', err);
        });
    }
  };
  getMediaDevices(
    trackType?: TrackType.Camera | TrackType.Microphone,
  ): MediaDeviceInfo[] {
    if (!trackType) {
      return this._mediaDevices;
    }
    return this._mediaDevices.filter((dev) =>
      trackType === TrackType.Camera
        ? dev.kind === 'videoinput'
        : dev.kind === 'audioinput',
    );
  }

  setPreferredCameraDeviceId = async (deviceId: string | null) => {
    this._preferredDeviceId[TrackType.Camera] = deviceId;
    this.preferredDeviceStorage.setDeviceId(TrackType.Camera, deviceId);

    this.emit('preferredCameraDeviceIdChanged', deviceId);
    // restart the camera track if it's active
    if (this.localTracks.cameraTrack) {
      await this.stopCamera();
      await this.startCamera();
    }
  };

  setPreferredMicrophoneDeviceId = async (deviceId: string | null) => {
    this._preferredDeviceId[TrackType.Microphone] = deviceId;
    this.preferredDeviceStorage.setDeviceId(TrackType.Microphone, deviceId);

    this.emit('preferredMicrophoneDeviceIdChanged', deviceId);
    // restart the mic track if it's active
    if (this.localTracks.microphoneTrack) {
      await this.stopMicrophone();
      await this.startMicrophone();
    }
  };

  getPreferredCameraDeviceId(): string | null {
    return this._preferredDeviceId[TrackType.Camera];
  }

  getPreferredMicrophoneDeviceId(): string | null {
    return this._preferredDeviceId[TrackType.Microphone];
  }

  startCamera = async (constraints = this._defaultCameraConstraints) => {
    if (this._isStartingMediaType[TrackType.Camera]) {
      return;
    }

    this._isStartingMediaType[TrackType.Camera] = true;
    try {
      const track = await this.localTracks.startCamera(
        this._preferredDeviceId[TrackType.Camera],
        constraints,
      );
      await this.activeProvider?.startMediaInternal(TrackType.Camera, track);
      this._isStartingMediaType[TrackType.Camera] = false;
      this.emit('localTrackStarted', TrackType.Camera);

      if (!this._hasStartedAnyDevice) {
        this._hasStartedAnyDevice = true;
        this.syncMediaDevices();
      }
    } catch (error: any) {
      if (
        isMediaDeniedError(error) ||
        isMediaDismissedError(error) ||
        isSystemPermissionsError(error)
      ) {
        this.emit('deviceAccessDenied', TrackType.Camera, error);
      }
      throw error;
    } finally {
      this._isStartingMediaType[TrackType.Camera] = false;
    }
  };

  stopCamera = async () => {
    this.localTracks.stopCamera();
    await this.activeProvider?.stopMediaInternal(TrackType.Camera);
    this._isStartingMediaType[TrackType.Camera] = false;
    this.emit('localTrackStopped', TrackType.Camera);
  };

  startMicrophone = async (
    constraints = this._defaultMicrophoneConstraints,
  ) => {
    if (this._isStartingMediaType[TrackType.Microphone]) {
      return;
    }

    this._isStartingMediaType[TrackType.Microphone] = true;
    try {
      const track = await this.localTracks.startMicrophone(
        this._preferredDeviceId[TrackType.Microphone],
        constraints,
      );
      await this.activeProvider?.startMediaInternal(
        TrackType.Microphone,
        track,
      );
      this._isStartingMediaType[TrackType.Microphone] = false;
      this.emit('localTrackStarted', TrackType.Microphone);

      if (!this._hasStartedAnyDevice) {
        this._hasStartedAnyDevice = true;
        this.syncMediaDevices();
      }
    } catch (error: any) {
      if (
        isMediaDeniedError(error) ||
        isMediaDismissedError(error) ||
        isSystemPermissionsError(error)
      ) {
        this.emit('deviceAccessDenied', TrackType.Camera, error);
      } else {
        throw error;
      }
    } finally {
      this._isStartingMediaType[TrackType.Microphone] = false;
    }
  };

  stopMicrophone = async () => {
    this.localTracks.stopMicrophone();
    await this.activeProvider?.stopMediaInternal(TrackType.Microphone);
    this._isStartingMediaType[TrackType.Microphone] = false;
    this.emit('localTrackStopped', TrackType.Microphone);
  };

  startScreenShare = async (constraints = this._defaultScreenConstraints) => {
    if (this._isStartingMediaType[TrackType.Screen]) {
      return;
    }

    this._isStartingMediaType[TrackType.Screen] = true;
    try {
      const tracks = await this.localTracks.startScreenShare(constraints);
      // not ideal to fire this after the getUserMedia, but there's no way
      // to know whether the user ticks the audio box or not before...
      if (tracks.audio) {
        this._isStartingMediaType[TrackType.ScreenAudio] = true;
      }
      if (this.activeProvider) {
        let promises: Promise<any>[] = [];
        promises.push(
          this.activeProvider
            .startMediaInternal(TrackType.Screen, tracks.video)
            .then(() => {
              this._isStartingMediaType[TrackType.Screen] = false;
              this.emit('localTrackStarted', TrackType.Screen);
            }),
        );
        if (tracks.audio) {
          promises.push(
            this.activeProvider
              .startMediaInternal(TrackType.Screen, tracks.audio)
              .then(() => {
                this._isStartingMediaType[TrackType.ScreenAudio] = false;
                this.emit('localTrackStarted', TrackType.ScreenAudio);
              }),
          );
        }

        await Promise.all(promises);
      }
    } catch (error: any) {
      if (
        isMediaDeniedError(error) ||
        isMediaDismissedError(error) ||
        isSystemPermissionsError(error)
      ) {
        this.emit('deviceAccessDenied', TrackType.Screen, error);
      } else {
        throw error;
      }
    } finally {
      this._isStartingMediaType[TrackType.Screen] = false;
      this._isStartingMediaType[TrackType.ScreenAudio] = false;
    }
  };

  stopScreenShare = async () => {
    const isStreamingAudio = !!this.localTracks.screenAudioTrack;
    this.localTracks.stopScreenShare();
    await this.activeProvider?.stopMediaInternal(TrackType.Screen);
    this._isStartingMediaType[TrackType.Screen] = false;
    this._isStartingMediaType[TrackType.ScreenAudio] = false;
    this.emit('localTrackStopped', TrackType.Screen);
    if (isStreamingAudio) {
      this.emit('localTrackStopped', TrackType.ScreenAudio);
    }
  };

  stopTrack = async (track: TrackType) => {
    switch (track) {
      case TrackType.Camera:
        await this.stopCamera();
        break;
      case TrackType.Microphone:
        await this.stopMicrophone();
        break;
      case TrackType.Screen:
      case TrackType.ScreenAudio:
        await this.stopScreenShare();
        break;
    }
  };

  getIsLocalTrackStarting(trackType: TrackType): boolean {
    return this._isStartingMediaType[trackType];
  }

  getParticipantTrack = (participantId: string, trackType: TrackType) => {
    return this.activeProvider?.getParticipantTrack(participantId, trackType);
  };

  getLocalTrack = (trackType: TrackType) => {
    return this.localTracks.tracks[trackType];
  };

  get localParticipantId() {
    return this.activeProvider?.localParticipantId || null;
  }

  getParticipantIds = () => {
    return this.activeProvider?.getParticipantIds() || [];
  };

  getParticipantSpeakingState = (participantId: string) => {
    return this.participantSpeakingStates.get(participantId) ?? false;
  };

  private handleLocalSpeakingChange = (isSpeaking: boolean) => {
    if (!this.localParticipantId) return;
    this.participantSpeakingStates.set(this.localParticipantId, isSpeaking);
    this.emit(
      'participantSpeakingStateChanged',
      this.localParticipantId,
      isSpeaking,
    );
    this.activeProvider?.broadcastMessage(
      serializeSpeakingStateMessage(this.localParticipantId, isSpeaking),
    );
  };

  private handleMessage = (sourceParticipantId: string, message: string) => {
    if (message.startsWith('speaking:')) {
      const { participantId, status } =
        deserializeSpeakingStateMessage(message);
      this.participantSpeakingStates.set(participantId, status);
      this.emit('participantSpeakingStateChanged', participantId, status);
    } else {
      // public facing message
      this.emit('message', sourceParticipantId, message);
    }
  };

  private handleTrackStopped = (participantId: string, track: TrackType) => {
    this.participantSpeakingStates.set(participantId, false);
    this.emit('participantSpeakingStateChanged', participantId, false);
  };

  broadcastMessage = (message: string) => {
    this.activeProvider?.broadcastMessage(message);
  };
}

function serializeSpeakingStateMessage(participantId: string, status: boolean) {
  return `speaking:${participantId}:${status}`;
}
function deserializeSpeakingStateMessage(message: string) {
  const [, participantId, status] = message.split(':');
  return { participantId, status: status === 'true' };
}
