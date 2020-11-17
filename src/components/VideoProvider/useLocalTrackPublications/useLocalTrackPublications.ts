import { LocalDataTrack, LocalAudioTrack, LocalVideoTrack } from 'twilio-video';
import { useEffect } from 'react';
import { useLocalTracks } from '../../LocalTracksProvider/useLocalTracks';
import { useAppState } from '../../../state';
import { useTranslation } from 'react-i18next';
import { logger } from '../../../utils/logger';
import useRoomState from '../../../hooks/useRoomState/useRoomState';
import { useLocalParticipant } from '../../../hooks/useLocalParticipant/useLocalParticipant';
import { RoomState } from '../../../constants/twilio';

function useTrackPublication(track: LocalAudioTrack | LocalVideoTrack | LocalDataTrack | null) {
  const { setError } = useAppState();
  const { t } = useTranslation();
  const roomState = useRoomState();
  const localParticipant = useLocalParticipant();

  useEffect(() => {
    if (roomState !== RoomState.Connected) return;
    if (!localParticipant) return;

    if (track) {
      const timeout = setTimeout(() => {
        setError(new Error(t('error.messages.catastrophicMediaError')));
      }, 10000);
      const stopTimeout = () => clearTimeout(timeout);
      const publishedPromise = localParticipant.publishTrack(track).finally(stopTimeout);
      return () => {
        stopTimeout();
        publishedPromise
          .then(() => {
            try {
              const pub = localParticipant.unpublishTrack(track);
              if (pub) {
                localParticipant.emit('trackUnpublished', pub);
              }
            } catch (err) {
              logger.error(err);
            }
          })
          .catch((err) => {
            setError(err);
          });
      };
    }
  }, [track, localParticipant, roomState, setError, t]);
}

export function useLocalTrackPublications() {
  const { audioTrack, videoTrack, screenShareAudioTrack, screenShareVideoTrack, dataTrack } = useLocalTracks();

  // for each local track, we declaratively manage publication state with effects.
  // when a track is changed, the old one is unpublished and the new is published.
  //
  // Notably, we want each of these tracks to be published under a specific name
  // so we can reference that elsewhere.

  useTrackPublication(audioTrack);
  useTrackPublication(videoTrack);
  useTrackPublication(screenShareAudioTrack);
  useTrackPublication(screenShareVideoTrack);
  // name doesn't really matter for data track
  useTrackPublication(dataTrack);
}
