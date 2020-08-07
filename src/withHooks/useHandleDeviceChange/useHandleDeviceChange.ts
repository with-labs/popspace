/**
 * Custom hook intended to publish/unpublish audio/video tracks to achieve switching input sources. The passed in
 * device ids for the active camera and mic are used in the publications and to drive effects that update the
 * audio/video track publications.
 */

import { useEffect } from 'react';
import Cookie from 'js-cookie';

import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useParticipantMetaContext } from '../../withComponents/ParticipantMetaProvider/useParticipantMetaContext';
import { useAVSourcesContext } from '../../withComponents/AVSourcesProvider/useAVSourcesContext';

import { LocalAudioTrack, LocalVideoTrack } from 'twilio-video';

export function useHandleDeviceChange(activeCameraId: string, activeMicId: string) {
  const {
    room: { localParticipant },
    localTracks,
  } = useVideoContext();

  const devices = useAVSourcesContext();

  const { updateActiveCamera, updateActiveMic } = useParticipantMetaContext();

  const audioTrack = localTracks.find(track => track.kind === 'audio') as LocalAudioTrack;
  const videoTrack = localTracks.find(track => track.kind === 'video') as LocalVideoTrack;

  // Effect to unpublish/publish video tracks when the specified active camera id changes.
  useEffect(() => {
    if (videoTrack) {
      videoTrack.restart({ deviceId: activeCameraId });
    }
  }, [activeCameraId, videoTrack]);

  // Effect to unpublish/publish audio tracks when the specified active mic id changes.
  useEffect(() => {
    if (audioTrack) {
      audioTrack.restart({ deviceId: activeMicId });
    }
  }, [activeMicId, audioTrack]);

  // Effect to update the active camera when the available cameras change.
  useEffect(() => {
    if (localParticipant) {
      // If there is a participant attempt to find a previously set camera id.
      const prefCamId = Cookie.get('vidPref');
      const prefCam = prefCamId && devices.cameras.find(cam => cam.deviceId === prefCamId);
      if (prefCam) {
        // Previous camera id was set and device is connected. Use that one.
        updateActiveCamera(prefCam.deviceId);
      } else {
        // Otherwise, just grab the first in the list of cameras
        updateActiveCamera(devices.cameras[0]?.deviceId || '');
      }
    } else if (!localParticipant && videoTrack) {
      // Otherwise if there is video but no participant, just restart the video track so that a camera is working.
      videoTrack.restart({ deviceId: devices.cameras[0]?.deviceId || '' });
    }
  }, [localParticipant, devices.cameras, activeCameraId, updateActiveCamera, videoTrack]);

  // Effect to update the active mic when the available mics change.
  useEffect(() => {
    if (localParticipant) {
      // If there is a participant attempt to find a previously set mic id.
      const prefMicId = Cookie.get('micPref');
      const prefMic = prefMicId && devices.mics.find(mic => mic.deviceId === prefMicId);
      if (prefMic) {
        // Previous mic id was set and device is connected. Use that one.
        updateActiveMic(prefMic.deviceId);
      } else {
        // Otherwise, just grab the first in the list of mics.
        updateActiveMic(devices.cameras[0]?.deviceId || '');
      }
    } else if (audioTrack) {
      // Otherwise, if there is audio but no participant, just restart the audio track so that a mic is working.
      audioTrack.restart({ deviceId: devices.mics[0]?.deviceId || '' });
    }
  }, [localParticipant, devices.mics, activeMicId, updateActiveMic, audioTrack]);
}
