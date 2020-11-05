import { useParticipant } from '../useParticipant/useParticipant';
import { useLocalParticipant } from '../useLocalParticipant/useLocalParticipant';
import usePublications from '../usePublications/usePublications';
import { SCREEN_SHARE_TRACK_NAME, SCREEN_SHARE_AUDIO_TRACK_NAME } from '../../constants/User';
import { useState, useEffect, useMemo } from 'react';
import {
  LocalVideoTrackPublication,
  LocalAudioTrackPublication,
  LocalParticipant,
  RemoteParticipant,
  RemoteTrackPublication,
  LocalTrackPublication,
} from 'twilio-video';

export interface ScreenShareResult {
  ready: boolean;
  videoPub?: RemoteTrackPublication | LocalTrackPublication;
  audioPub?: RemoteTrackPublication | LocalTrackPublication;
  participant: LocalParticipant | RemoteParticipant | null;
}

/**
 * This declarative hook lets you enforce the presence of a screenshare from a particular
 * user.
 */
export function useScreenSharePublication({
  participantSid,
  keepPublishedOnUnmount,
  onStreamEnd,
  onSourceChange,
}: {
  participantSid: string | null;
  /**
   * For advanced use cases - normally this component is declarative
   * and stops the stream when it is unmounted, but if you want to keep
   * the video stream published after this component is gone, pass `true`.
   * Be sure to clean it up when you're done with it though.
   */
  keepPublishedOnUnmount?: boolean;
  onStreamEnd?: () => void;
  onSourceChange?: (source: RemoteTrackPublication | LocalTrackPublication | null) => void;
}): ScreenShareResult {
  const participant = useParticipant(participantSid);
  const localParticipant = useLocalParticipant();
  const publications = usePublications(participant);
  const videoPub = publications.find((p) => p.trackName === SCREEN_SHARE_TRACK_NAME);
  const audioPub = publications.find((p) => p.trackName === SCREEN_SHARE_AUDIO_TRACK_NAME);
  const [ready, setReady] = useState(false);

  const isLocal = participant === localParticipant;

  // this hook enforces that if the ScreenShare is rendering the local user's screen,
  // the media stream is requested automatically and published to everyone else.
  useEffect(() => {
    /**
     * This is an idempotent function; if the user already has a screen share published
     * it will return that instead of asking to create a new one.
     */
    async function publishScreenShare() {
      let existingScreenVideoTrack: LocalVideoTrackPublication | null = null;
      let existingScreenAudioTrack: LocalAudioTrackPublication | null = null;
      for (const t of localParticipant.videoTracks.values()) {
        if (t.trackName === SCREEN_SHARE_TRACK_NAME) {
          existingScreenVideoTrack = t;
        }
      }
      // if there's an existing video track, look for audio too before bailing early
      if (existingScreenVideoTrack) {
        for (const t of localParticipant.audioTracks.values()) {
          if (t.trackName === SCREEN_SHARE_AUDIO_TRACK_NAME) {
            existingScreenAudioTrack = t;
          }
        }

        return {
          videoTrack: existingScreenVideoTrack,
          audioTrack: existingScreenAudioTrack,
        };
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        // if the user allows audio, an audio stream track will also be created
        audio: {
          // sure, why not?
          echoCancellation: true,
        },
      });
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      const videoPublication = await localParticipant.publishTrack(videoTrack, {
        name: SCREEN_SHARE_TRACK_NAME,
        logLevel: 'debug',
      });
      const audioPublication = audioTrack
        ? await localParticipant.publishTrack(audioTrack, {
            name: SCREEN_SHARE_AUDIO_TRACK_NAME,
            logLevel: 'debug',
          })
        : null;

      // handles when the user manually kills their screenshare from the overlay or
      // otherwise disconnects unexpectedly
      videoTrack.addEventListener('ended', () => {
        localParticipant.unpublishTrack(videoTrack);
        localParticipant.emit('trackUnpublished', videoPublication);

        if (audioTrack) {
          localParticipant.unpublishTrack(audioTrack);
          if (audioPublication) {
            localParticipant.emit('trackUnpublished', audioPublication);
          }
        }

        videoTrack.stop();
        audioTrack.stop();
        onStreamEnd?.();
      });

      return {
        videoTrack: videoPublication,
        audioTrack: audioPublication,
      };
    }

    if (isLocal) {
      const newPubPromise = publishScreenShare();

      newPubPromise
        // when the stream is ready, set the flag. This tells the hook caller
        // when it's safe to consider a source "legit"
        .then(() => setReady(true))
        // if an error is thrown, call the stream end listener as if the stream
        // was killed.
        .catch(() => {
          onStreamEnd?.();
        });

      if (keepPublishedOnUnmount) {
        // don't return a cleanup handler
        return;
      }

      // for the effect cleanup, we stop and unpublish the track.
      return () => {
        // wait for new publication to complete, if it does.
        newPubPromise
          .then(({ videoTrack, audioTrack }) => {
            if (!videoTrack) return;

            localParticipant.unpublishTrack(videoTrack.track);
            localParticipant.emit('trackUnpublished', videoTrack);
            ((videoTrack.track as unknown) as MediaStreamTrack).stop();
            if (audioTrack) {
              localParticipant.unpublishTrack(audioTrack.track);
              localParticipant.emit('trackUnpublished', audioTrack);
              ((audioTrack.track as unknown) as MediaStreamTrack).stop();
            }
          })
          .catch((err) => {
            console.error(err);
            // nothing to do, nothing to clean up.
          });
      };
    }
  }, [localParticipant, isLocal, keepPublishedOnUnmount, onStreamEnd]);

  useEffect(() => {
    // only trigger source change callback if the screenshare
    // has been initialized
    if (ready) {
      onSourceChange?.(videoPub ?? null);
    }
  }, [videoPub, ready, onSourceChange]);

  return useMemo(
    () => ({
      participant,
      videoPub,
      audioPub,
      ready,
    }),
    [participant, videoPub, audioPub, ready]
  );
}
