import { media } from '.';
import { TrackType } from '@withso/pop-media-sdk';
import { useEffect, useState } from 'react';

export function useCameraControl() {
  const cameraTrack = useLocalTrack(TrackType.Camera);
  const isPublishing = useIsLocalTrackStarting(TrackType.Camera);
  const preferredCameraDeviceId = usePreferredCameraDeviceId();

  const toggleCamera = async () => {
    if (cameraTrack) {
      media.stopCamera();
    } else {
      media.startCamera();
    }
  };

  const cameras = useMediaDevices('video');

  return {
    isPublishing,
    selectedDeviceId: preferredCameraDeviceId,
    toggle: toggleCamera,
    track: cameraTrack,
    devices: cameras,
  };
}

export function useMicControl() {
  const micTrack = useLocalTrack(TrackType.Microphone);
  const isPublishing = useIsLocalTrackStarting(TrackType.Microphone);
  const preferredMicrophoneDeviceId = usePreferredMicrophoneDeviceId();

  const toggleMic = async () => {
    if (micTrack) {
      media.stopMicrophone();
    } else {
      media.startMicrophone();
    }
  };

  const mics = useMediaDevices('audio');

  return {
    isPublishing,
    selectedDeviceId: preferredMicrophoneDeviceId,
    toggle: toggleMic,
    track: micTrack,
    devices: mics,
  };
}

export function useConnectedParticipantIds() {
  const [participantIds, setParticipantIds] = useState(() => media.getParticipantIds());

  useEffect(() => {
    function refreshParticipantIds() {
      setParticipantIds(media.getParticipantIds());
    }
    media.on('participantConnected', refreshParticipantIds);
    media.on('participantDisconnected', refreshParticipantIds);
    return () => {
      media.removeListener('participantConnected', refreshParticipantIds);
      media.removeListener('participantDisconnected', refreshParticipantIds);
    };
  }, []);

  return participantIds;
}

export function useIsLocalTrackStarting(trackType: TrackType) {
  const [isLocalTrackStarting, setIsLocalTrackStarting] = useState(media.getIsLocalTrackStarting(trackType));

  useEffect(() => {
    function refreshIsStarting(incomingTrackType: TrackType) {
      if (incomingTrackType !== trackType) {
        return;
      }
      setIsLocalTrackStarting(media.getIsLocalTrackStarting(trackType));
    }
    media.on('localTrackStarting', refreshIsStarting);
    media.on('localTrackStarted', refreshIsStarting);
    return () => {
      media.off('localTrackStarting', refreshIsStarting);
      media.off('localTrackStarted', refreshIsStarting);
    };
  }, [trackType]);

  return isLocalTrackStarting;
}

export function useLocalTrack(trackType: TrackType) {
  const [track, setTrack] = useState<MediaStreamTrack | null>(media.getLocalTrack(trackType));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    function refreshTrack(incomingTrackType: TrackType) {
      if (trackType !== incomingTrackType) {
        return;
      }
      setTrack(media.getLocalTrack(trackType));
    }
    media.on('localTrackStarted', refreshTrack);
    media.on('localTrackStopped', refreshTrack);
    return () => {
      media.off('localTrackStarted', refreshTrack);
      media.off('localTrackStopped', refreshTrack);
    };
  }, [trackType]);

  return track;
}

export function useMediaDevices(deviceKind: 'audio' | 'video') {
  const [sources, setSources] = useState<MediaDeviceInfo[]>(media.getMediaDevices(`${deviceKind}input`));
  useEffect(() => {
    const refreshDevices = () => {
      setSources(media.getMediaDevices(`${deviceKind}input`));
    };
    media.on('mediaDevicesChanged', refreshDevices);
    return () => {
      media.off('mediaDevicesChanged', refreshDevices);
    };
  }, [deviceKind]);

  return sources;
}

export function useParticipantTrack(participantId: string, trackType: TrackType) {
  const [track, setTrack] = useState<MediaStreamTrack | null>(media.getParticipantTrack(participantId, trackType));

  useEffect(() => {
    function refreshTrack(publisherParticipantId: string, incomingTrackType: TrackType) {
      if (participantId !== publisherParticipantId || trackType !== incomingTrackType) {
        return;
      }
      setTrack(media.getParticipantTrack(participantId, trackType));
    }
    media.on('trackStarted', refreshTrack);
    media.on('trackStopped', refreshTrack);
    return () => {
      media.off('trackStarted', refreshTrack);
      media.off('trackStopped', refreshTrack);
    };
  }, [participantId, trackType]);

  return track;
}

export function usePreferredCameraDeviceId() {
  const [preferredDeviceId, setPreferredDeviceId] = useState<string | null>(() => media.getPreferredCameraDeviceId());
  useEffect(() => {
    media.on('preferredCameraDeviceIdChanged', setPreferredDeviceId);
    return () => {
      media.off('preferredCameraDeviceIdChanged', setPreferredDeviceId);
    };
  }, []);

  return preferredDeviceId;
}

export function usePreferredMicrophoneDeviceId() {
  const [preferredDeviceId, setPreferredDeviceId] = useState<string | null>(() =>
    media.getPreferredMicrophoneDeviceId()
  );
  useEffect(() => {
    media.on('preferredMicrophoneDeviceIdChanged', setPreferredDeviceId);
    return () => {
      media.off('preferredMicrophoneDeviceIdChanged', setPreferredDeviceId);
    };
  }, []);

  return preferredDeviceId;
}
