/**
 * #ANGLES_EDIT
 *
 * 5/18/2020 WQP: Use activeCameraId from participant meta to pass a camera device id to the video track pub.
 */

import { LocalVideoTrack } from 'twilio-video';
import { useCallback } from 'react';
import useVideoContext from '../useVideoContext/useVideoContext';

import { useParticipantMeta } from '../../withHooks/useParticipantMeta/useParticipantMeta';

export default function useLocalVideoToggle() {
  const {
    room: { localParticipant },
    localTracks,
    getLocalVideoTrack,
  } = useVideoContext();
  const videoTrack = localTracks.find(track => track.name === 'camera') as LocalVideoTrack;
  const { activeCameraId } = useParticipantMeta(localParticipant);

  const toggleVideoEnabled = useCallback(() => {
    if (videoTrack) {
      if (localParticipant) {
        const localTrackPublication = localParticipant.unpublishTrack(videoTrack);
        // TODO: remove when SDK implements this event. See: https://issues.corp.twilio.com/browse/JSDK-2592
        localParticipant.emit('trackUnpublished', localTrackPublication);
      }
      videoTrack.stop();
    } else {
      getLocalVideoTrack(activeCameraId || '').then((track: LocalVideoTrack) => {
        if (localParticipant) {
          localParticipant.publishTrack(track);
        }
      });
    }
  }, [videoTrack, localParticipant, getLocalVideoTrack, activeCameraId]);

  return [!!videoTrack, toggleVideoEnabled] as const;
}
