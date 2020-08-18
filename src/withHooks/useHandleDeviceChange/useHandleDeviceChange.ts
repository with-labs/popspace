/**
 * Custom hook intended to restart audio/video tracks to achieve switching input sources. The passed in
 * device labels for the active camera and mic are used in the publications and to drive effects that update the
 * audio/video track publications.
 */

import { useEffect, useMemo } from 'react';
import Cookie from 'js-cookie';

import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useParticipantMetaContext } from '../../withComponents/ParticipantMetaProvider/useParticipantMetaContext';
import { useAVSourcesContext } from '../../withComponents/AVSourcesProvider/useAVSourcesContext';

import { LocalAudioTrack, LocalVideoTrack } from 'twilio-video';

export function useHandleDeviceChange(activeCameraLabel: string, activeMicLabel: string) {
  const {
    room: { localParticipant },
    localTracks,
  } = useVideoContext();

  const devices = useAVSourcesContext();

  const { updateActiveCamera, updateActiveMic } = useParticipantMetaContext();

  const audioTrack = localTracks.find(track => track.kind === 'audio') as LocalAudioTrack;
  const videoTrack = localTracks.find(track => track.name.includes('camera')) as LocalVideoTrack;

  const activeCameraId = useMemo(() => devices.cameras.find(cam => cam.label === activeCameraLabel)?.deviceId, [
    devices.cameras,
    activeCameraLabel,
  ]);
  const activeMicId = useMemo(() => devices.mics.find(mic => mic.label === activeMicLabel)?.deviceId, [
    devices.mics,
    activeMicLabel,
  ]);

  // Effect to restart the video track when the specified active camera id changes.
  useEffect(() => {
    if (videoTrack) {
      videoTrack.restart({ deviceId: activeCameraId });
    }
  }, [activeCameraId, videoTrack]);

  // Effect to update the active camera when the available cameras change.
  useEffect(() => {
    // Attempt to find a previously set camera that is currently connected.
    const prefCamId = Cookie.get('vidPref');
    const nextCam = devices.cameras.find(cam => cam.label === prefCamId) || devices.cameras[0];

    if (nextCam) {
      if (localParticipant) {
        // Update acitve camera in data store. Will precipitate a device switch/restart with the hook above.
        updateActiveCamera(nextCam.label);
      } else if (!localParticipant && videoTrack) {
        // Otherwise if there is video but no participant, just restart the video track so that a camera is working.
        videoTrack.restart({ deviceId: nextCam.deviceId });
      }
    }
  }, [localParticipant, devices.cameras, updateActiveCamera, videoTrack]);

  // Effect to restart the audio track when the specified active mic id changes.
  useEffect(() => {
    if (audioTrack) {
      audioTrack.restart({ deviceId: activeMicId });
    }
  }, [activeMicId, audioTrack]);

  // Effect to update the active mic when the available mics change.
  useEffect(() => {
    // Attempt to find a previously set mic that is currently connected. Fall back to first mic.
    const prefMicId = Cookie.get('micPref');
    const nextMic = devices.mics.find(mic => mic.label === prefMicId) || devices.mics[0];

    if (nextMic) {
      if (localParticipant) {
        // Update active mic in data store. Will precipitate a device switch/restart with the hook above.
        updateActiveMic(nextMic.label);
      } else if (audioTrack) {
        // Otherwise, if there is audio but no participant, just restart the audio track so that a mic is working.
        audioTrack.restart({ deviceId: nextMic.deviceId });
      }
    }
  }, [localParticipant, devices.mics, updateActiveMic, audioTrack]);
}
