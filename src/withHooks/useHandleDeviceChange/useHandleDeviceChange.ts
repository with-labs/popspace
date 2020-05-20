/**
 * Custom hook intended to publish/unpublish audio/video tracks to achieve switching input sources. The passed in
 * device ids for the active camera and mic are used in the publications and to drive effects that update the
 * audio/video track publications.
 */

import { useCallback, useEffect } from 'react';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { LocalVideoTrack, LocalAudioTrack } from 'twilio-video';

export function useHandleDeviceChange(activeCameraId: string, activeMicId: string) {
  const {
    room: { localParticipant },
    localTracks,
    getLocalVideoTrack,
    getLocalAudioTrack,
  } = useVideoContext();

  const videoTrack = localTracks.find(track => track.name === 'camera') as LocalVideoTrack;
  const audioTrack = localTracks.find(track => track.kind === 'audio') as LocalAudioTrack;

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

        getLocalVideoTrack(deviceId || activeCameraId || '').then(track => {
          localParticipant.publishTrack(track);
        });
      }
    },
    [activeCameraId, getLocalVideoTrack, localParticipant]
  );

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

        getLocalAudioTrack(deviceId || activeMicId || '').then(track => {
          localParticipant.publishTrack(track);
        });
      }
    },
    [activeMicId, localParticipant, getLocalAudioTrack]
  );

  useEffect(() => {
    if (audioTrack) {
      changeActiveMic(activeMicId);
    }
  }, [activeMicId]); // Only run this effect when the active mic id changes.

  useEffect(() => {
    if (videoTrack) {
      changeActiveCamera(activeCameraId);
    }
  }, [activeCameraId]); // Only run this effect when the active camera id changes.

  // TODO Still figuring out the proper way to reconcile changes in devices. Almost worked, but for some reason
  // localParticipant is null when the devicechange event happens.
  // useEffect(() => {
  //   navigator.mediaDevices.ondevicechange = () => {
  //     if (localParticipant) {
  //       console.log('devices changed');
  //       // updateDevices();
  //       getMediaDevices().then(({ cameras, mics, speakers }) => {
  //         updateActiveCamera(cameras[0]?.deviceId || '');
  //         updateActiveMic(mics[0]?.deviceId || '');
  //       });
  //     }
  //   };
  // }, [localParticipant]);
}
