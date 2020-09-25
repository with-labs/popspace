import { LocalVideoTrack, RemoteVideoTrack, TwilioError } from 'twilio-video';
import { ErrorTypes } from './constants/ErrorType';

declare module 'twilio-video' {
  interface LocalParticipant {
    setBandwidthProfile: (bandwidthProfile: BandwidthProfileOptions) => void;
    publishTrack(track: LocalTrack, options?: { priority: Track.Priority }): Promise<LocalTrackPublication>;
  }

  interface VideoCodecSettings {
    simulcast?: boolean;
  }

  interface LocalVideoTrack {
    isSwitchedOff: undefined;
    setPriority: undefined;
  }

  interface RemoteVideoTrack {
    isSwitchedOff: boolean;
    setPriority: (priority: Track.Priority | null) => void;
  }

  interface VideoBandwidthProfileOptions {
    trackSwitchOffMode?: 'predicted' | 'detected' | 'disabled';
  }
}

declare global {
  interface MediaDevices {
    getDisplayMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
  }
}

export type Callback = (...args: any[]) => void;

export type ErrorCallback = (error: TwilioError) => void;

export type IVideoTrack = LocalVideoTrack | RemoteVideoTrack;

export type LocationTuple = [number, number];

// data types from the backend
export type RoomInfo = {
  id: string;
  name: string;
  owner_id: string;
  priority_level: number;
};

export type UserInfo = {
  avatar_url: string | null;
  created_at: string;
  display_name: string;
  email: string;
  first_name: string;
  last_name: string;
  id: string;
  newsletter_opt_in: boolean;
};

// TODO: update error object once we bring that into line
export type ErrorInfo = {
  errorType: ErrorTypes;
  error?: { [key: string]: any };
};
