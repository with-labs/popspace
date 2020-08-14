/**
 * #WITH_EDIT
 *
 * Aug 6, 2020 WQP
 * - Add effect to set the previous device ref to the local particiapnt's active camera id
 */
import { LocalVideoTrack } from 'twilio-video';
import { useCallback, useRef, useState, useEffect } from 'react';
import useVideoContext from '../useVideoContext/useVideoContext';
import { useParticipantMeta } from '../../withHooks/useParticipantMeta/useParticipantMeta';
import { useAVSourcesContext } from '../../withComponents/AVSourcesProvider/useAVSourcesContext';

export default function useLocalVideoToggle() {
  const {
    room: { localParticipant },
    localTracks,
    getLocalVideoTrack,
    removeLocalVideoTrack,
    onError,
  } = useVideoContext();
  const videoTrack = localTracks.find(track => track.name.includes('camera')) as LocalVideoTrack;
  const [isPublishing, setIspublishing] = useState(false);
  const previousDeviceIdRef = useRef<string>();
  const { cameras } = useAVSourcesContext();

  const { activeCameraLabel } = useParticipantMeta(localParticipant);
  const activeCameraId = cameras.find(cam => cam.label === activeCameraLabel)?.deviceId;

  // When the active camera id changes in user meta, update the previous device id ref so that when video is enabled
  // that camera is the one that is enabled
  useEffect(() => {
    previousDeviceIdRef.current = activeCameraId;
  }, [activeCameraId]);

  const toggleVideoEnabled = useCallback(() => {
    if (!isPublishing) {
      if (videoTrack) {
        previousDeviceIdRef.current = videoTrack.mediaStreamTrack.getSettings().deviceId;
        const localTrackPublication = localParticipant?.unpublishTrack(videoTrack);
        // TODO: remove when SDK implements this event. See: https://issues.corp.twilio.com/browse/JSDK-2592
        localParticipant?.emit('trackUnpublished', localTrackPublication);
        removeLocalVideoTrack();
      } else {
        setIspublishing(true);
        getLocalVideoTrack({ deviceId: { exact: previousDeviceIdRef.current } })
          .then((track: LocalVideoTrack) => localParticipant?.publishTrack(track, { priority: 'low' }))
          .catch(onError)
          .finally(() => setIspublishing(false));
      }
    }
  }, [videoTrack, localParticipant, getLocalVideoTrack, isPublishing, onError, removeLocalVideoTrack]);

  return [!!videoTrack, toggleVideoEnabled] as const;
}
