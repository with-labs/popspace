import { LocalDataTrack, LocalAudioTrack, LocalVideoTrack, TwilioError } from 'twilio-video';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { logger } from '@utils/logger';
import { RoomState } from '@constants/twilio';
import { ReconnectingTwilioRoom } from './ReconnectingTwilioRoom';
import { useLocalTracks } from '../media/hooks/useLocalTracks';
import { useMediaReadiness } from '@providers/media/useMediaReadiness';

function useTrackPublication(
  track: LocalAudioTrack | LocalVideoTrack | LocalDataTrack | null,
  restart: () => any,
  room: ReconnectingTwilioRoom
) {
  const { t } = useTranslation();
  const roomState = room.room?.state;
  const localParticipant = room.room?.localParticipant;
  const isReady = useMediaReadiness((s) => s.isReady);

  useEffect(() => {
    if (roomState !== RoomState.Connected) return;
    if (!localParticipant) return;
    if (!isReady) return;

    if (track) {
      logger.debug(`(re)publishing track ${localParticipant.identity}:${track.name}`);

      const timeout = setTimeout(() => {
        // timed out starting - try restarting.
        logger.debug(
          `Timeout republishing media stream - this indicates a probable bad state. Reconnecting to Twilio.`,
          track.name
        );
        room.reconnect();
      }, 10000);
      const stopTimeout = () => clearTimeout(timeout);
      const publishedPromise = localParticipant
        .publishTrack(track)
        .then(() => {
          logger.debug(`Finished publishing ${track.name}`);
        })
        .catch((err: any) => {
          logger.error(`Error publishing ${track.name}`, err);
          if (err instanceof TwilioError) {
            if (err.code === 53304) {
              // duplicated track name - the track is probably republishing already,
              // try restarting the track.
              restart();
              return;
            }
          }
          // catch-all failures: reconnect the whole room
          room.reconnect();
        })
        .finally(stopTimeout);
      return () => {
        stopTimeout();
        publishedPromise
          .then(() => {
            try {
              logger.debug(`unpublishing track ${localParticipant.identity}:${track.name}`);
              const pub = localParticipant.unpublishTrack(track);
              if (pub) {
                localParticipant.emit('trackUnpublished', pub);
              }
            } catch (err) {
              logger.error(err);
            }
          })
          .catch((err: any) => {
            logger.error(`Error unpublishing track ${track.name}`, err);
          });
      };
    }
  }, [track, localParticipant, roomState, t, isReady, restart, room]);
}

export function useLocalTrackPublications(room: ReconnectingTwilioRoom) {
  const {
    audioTrack,
    restartAudio,
    videoTrack,
    restartVideo,
    screenShareAudioTrack,
    screenShareVideoTrack,
    restartScreenShare,
    dataTrack,
    restartData,
  } = useLocalTracks();

  // for each local track, we declaratively manage publication state with effects.
  // when a track is changed, the old one is unpublished and the new is published.
  //
  // Notably, we want each of these tracks to be published under a specific name
  // so we can reference that elsewhere.

  useTrackPublication(audioTrack, restartAudio, room);
  useTrackPublication(videoTrack, restartVideo, room);
  useTrackPublication(screenShareAudioTrack, restartScreenShare, room);
  useTrackPublication(screenShareVideoTrack, restartScreenShare, room);
  useTrackPublication(dataTrack, restartData, room);
}
