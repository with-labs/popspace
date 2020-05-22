/**
 * Custom hook intended to publish/unpublish audio/video tracks to achieve switching input sources. The passed in
 * device ids for the active camera and mic are used in the publications and to drive effects that update the
 * audio/video track publications.
 */

import { useCallback, useEffect } from 'react';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useParticipantMetaContext } from '../../withComponents/ParticipantMetaProvider/useParticipantMetaContext';
import { useAVSourcesContext } from '../../withComponents/AVSourcesProvider/useAVSourcesContext';

export function useHandleDeviceChange(activeCameraId: string, activeMicId: string) {
  const {
    room: { localParticipant },
    getLocalVideoTrack,
    getLocalAudioTrack,
  } = useVideoContext();

  const devices = useAVSourcesContext();

  const { updateActiveCamera, updateActiveMic } = useParticipantMetaContext();

  // Callback to unpublish/publish video tracks to achieve a change in the video source device.
  const changeActiveCamera = useCallback(
    (deviceId: string) => {
      if (localParticipant) {
        const pubs = Array.from(localParticipant.videoTracks.values());

        pubs.forEach(pub => {
          localParticipant.unpublishTrack(pub.track);
          // This event will cause the publications array in the `usePublications` hook to update, thus causing the
          // Publications rendered in ParticipantCircle to update, thus removing and detaching the video element
          // previously attached with the other camera.
          localParticipant.emit('trackUnpublished', pub);
          pub.track.stop();
        });

        getLocalVideoTrack(deviceId).then(track => {
          localParticipant.publishTrack(track);
        });
      }
    },
    [getLocalVideoTrack, localParticipant]
  );

  // Effect to unpublish/publish video tracks when the specified active camera id changes.
  useEffect(() => {
    // Have to base the presence of video on the videoTracks property of the localParticipant, rather than the
    // `localTracks` property of the videoContext. For some reason while swapping camera video tracks,
    // videoContext.localTracks doesn't contain any video tracks. Seems that localParticipant.videoTracks may be a
    // better source of truth? This could be a happy accident that makes camera swapping work. More research may be
    // necessary to decide if this is the correct approach.
    if (localParticipant && localParticipant.videoTracks.size) {
      changeActiveCamera(activeCameraId);
    }
  }, [activeCameraId, localParticipant, changeActiveCamera]);

  // Callback to unpublish/publish audio tracks to achieve a change in the audio source device.
  const changeActiveMic = useCallback(
    (deviceId: string) => {
      if (localParticipant) {
        const pubs = Array.from(localParticipant.audioTracks.values());

        pubs.forEach(pub => {
          localParticipant.unpublishTrack(pub.track);
          // This event will cause the publications array in the `usePublications` hook to update, thus causing the
          // Publications rendered in ParticipantCircle to update, thus removing and detaching the audio element
          // previously attached with the other mic.
          localParticipant.emit('trackUnpublished', pub);
          pub.track.stop();
        });

        getLocalAudioTrack(deviceId).then(track => {
          localParticipant.publishTrack(track);
        });
      }
    },
    [localParticipant, getLocalAudioTrack]
  );

  // Effect to unpublish/publish audio tracks when the specified active mic id changes.
  useEffect(() => {
    if (localParticipant && localParticipant.audioTracks.size) {
      changeActiveMic(activeMicId);
    }
  }, [activeMicId, changeActiveMic, localParticipant]);

  // Effect to update the active camera when the available cameras change.
  useEffect(() => {
    if (localParticipant && !devices.cameras.find(cam => cam.deviceId === activeCameraId)) {
      updateActiveCamera(devices.cameras[0]?.deviceId || '');
    }
  }, [localParticipant, devices.cameras, activeCameraId, updateActiveCamera]);

  // Effect to update the active mic when the available mics change.
  useEffect(() => {
    if (localParticipant && !devices.mics.find(mic => mic.deviceId === activeMicId)) {
      updateActiveMic(devices.mics[0]?.deviceId || '');
    }
  }, [localParticipant, devices.mics, activeMicId, updateActiveMic]);
}
