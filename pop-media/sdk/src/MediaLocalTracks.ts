import EventEmitter from 'events';
import { logger } from './logger';

import { TrackType } from './MediaProvider';
import { SoundMeter } from './SoundMeter';

export interface MediaLocalTracksEvents {
  trackStarting: (trackType: TrackType) => void;
  trackStopping: (trackType: TrackType) => void;
  localMicVolumeThresholdChange: (exceedsThreshold: boolean) => void;
}

export declare interface MediaLocalTracks {
  on<Event extends keyof MediaLocalTracksEvents>(
    ev: Event,
    cb: MediaLocalTracksEvents[Event],
  ): this;
  off<Event extends keyof MediaLocalTracksEvents>(
    ev: Event,
    cb: MediaLocalTracksEvents[Event],
  ): this;
  emit<Event extends keyof MediaLocalTracksEvents>(
    ev: Event,
    ...args: Parameters<MediaLocalTracksEvents[Event]>
  ): boolean;
}

/**
 * Manages the creation and state-keeping of local
 * media tracks
 */
export class MediaLocalTracks extends EventEmitter {
  private _tracks: Record<TrackType, MediaStreamTrack | null> = {
    [TrackType.Camera]: null,
    [TrackType.Microphone]: null,
    [TrackType.Screen]: null,
    [TrackType.ScreenAudio]: null,
  };

  private _localMicSoundMeter;

  constructor(localMicVolumeThreshold: number = 0.01) {
    super();
    this._localMicSoundMeter = new SoundMeter(localMicVolumeThreshold);
    this._localMicSoundMeter.on(
      'thresholdStatusChange',
      (exceedsThreshold: boolean) => {
        this.emit('localMicVolumeThresholdChange', exceedsThreshold);
      },
    );
  }

  get tracks() {
    return this._tracks;
  }

  get cameraTrack(): MediaStreamTrack | null {
    return this._tracks[TrackType.Camera];
  }
  get microphoneTrack(): MediaStreamTrack | null {
    return this._tracks[TrackType.Microphone];
  }
  get screenTracks(): {
    video: MediaStreamTrack | null;
    audio: MediaStreamTrack | null;
  } {
    return {
      video: this._tracks[TrackType.Screen],
      audio: this._tracks[TrackType.ScreenAudio],
    };
  }
  get screenTrack(): MediaStreamTrack | null {
    return this._tracks[TrackType.Screen];
  }
  get screenAudioTrack(): MediaStreamTrack | null {
    return this._tracks[TrackType.ScreenAudio];
  }

  startCamera = async (
    deviceId: string | null,
    constraints: MediaTrackConstraints = {},
  ) => {
    if (this._tracks[TrackType.Camera]) {
      const current = this._tracks[TrackType.Camera]!;
      if (constraints) {
        await current.applyConstraints(constraints);
      }
      return current;
    }
    this.emit('trackStarting', TrackType.Camera);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        deviceId: deviceId ?? undefined,
        ...constraints,
      },
    });
    const track = stream.getVideoTracks()[0] || null;
    this._tracks[TrackType.Camera] = track;
    track.addEventListener('ended', () => {
      logger.debug('[LocalTracks] camera track ended');
      this._tracks[TrackType.Camera] = null;
    });
    return track;
  };
  stopCamera = () => {
    if (!this._tracks[TrackType.Camera]) return;
    this.emit('trackStopping', TrackType.Camera);
    this._tracks[TrackType.Camera]!.stop();
    this._tracks[TrackType.Camera] = null;
  };
  startMicrophone = async (
    deviceId: string | null,
    constraints: MediaTrackConstraints = {},
  ) => {
    if (this._tracks[TrackType.Microphone]) {
      const current = this._tracks[TrackType.Microphone]!;
      if (constraints) {
        await current.applyConstraints(constraints);
      }
      return current;
    }
    this.emit('trackStarting', TrackType.Microphone);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceId ?? undefined,
      },
      video: false,
    });
    const track = stream.getAudioTracks()[0] || null;
    this._tracks[TrackType.Microphone] = track;
    track.addEventListener('ended', () => {
      logger.debug('[LocalTracks] microphone track ended');
      this._tracks[TrackType.Microphone] = null;
      this._localMicSoundMeter.disconnect();
    });

    this._localMicSoundMeter.connectToStream(stream);
    return track;
  };
  stopMicrophone = () => {
    if (!this._tracks[TrackType.Microphone]) return;
    this.emit('trackStopping', TrackType.Microphone);
    this._tracks[TrackType.Microphone]!.stop();
    this._tracks[TrackType.Microphone] = null;
    this._localMicSoundMeter.disconnect();
  };
  startScreenShare = async (constraints: MediaStreamConstraints = {}) => {
    if (this._tracks[TrackType.Screen] && !constraints) {
      return {
        video: this._tracks[TrackType.Screen]!,
        audio: this._tracks[TrackType.ScreenAudio],
      };
      // can't change constraints on a running screenshare, re-request it
    } else if (this._tracks[TrackType.Screen] && constraints) {
      await this.stopScreenShare();
    }
    this.emit('trackStarting', TrackType.Screen);
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
      ...constraints,
    });
    const screenTrack = stream.getVideoTracks()[0] || null;
    const screenAudioTrack = stream.getAudioTracks()[0] || null;
    // not ideal to put this here but we don't know whether the user selected
    // audio or not until the getDisplayMedia is already done...
    if (screenAudioTrack) {
      this.emit('trackStarting', TrackType.ScreenAudio);
    }
    this._tracks[TrackType.Screen] = screenTrack;
    this._tracks[TrackType.ScreenAudio] = screenAudioTrack;
    screenTrack.addEventListener('ended', () => {
      logger.debug('[LocalTracks] screen track ended');
      this._tracks[TrackType.Screen] = null;
      this.emit('trackStopping', TrackType.Screen);
    });
    screenAudioTrack?.addEventListener('ended', () => {
      logger.debug('[LocalTracks] screen audio track ended');
      this._tracks[TrackType.ScreenAudio] = null;
      this.emit('trackStopping', TrackType.ScreenAudio);
    });
    return {
      video: screenTrack,
      audio: screenAudioTrack,
    };
  };
  stopScreenShare = () => {
    if (!this._tracks[TrackType.Screen]) return;
    this.emit('trackStopping', TrackType.Screen);
    this._tracks[TrackType.Screen]!.stop();
    if (this._tracks[TrackType.ScreenAudio]) {
      this.emit('trackStopping', TrackType.ScreenAudio);
      this._tracks[TrackType.ScreenAudio]?.stop();
    }
    this._tracks[TrackType.Screen] = null;
    this._tracks[TrackType.ScreenAudio] = null;
  };

  stopAll = () => {
    this.stopCamera();
    this.stopMicrophone();
    this.stopScreenShare();
  };
}

declare global {
  interface MediaDevices {
    getDisplayMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
  }
}
