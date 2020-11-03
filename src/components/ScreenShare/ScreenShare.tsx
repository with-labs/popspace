import * as React from 'react';
import { useParticipant } from '../../hooks/useParticipant/useParticipant';
import usePublications from '../../hooks/usePublications/usePublications';
import { RemoteTrackPublication, LocalTrackPublication } from 'twilio-video';
import { SCREEN_SHARE_TRACK_NAME } from '../../constants/User';
import Publication from '../Publication/Publication';
import { ScreenSharePlaceholder } from './ScreenSharePlaceholder';
import { useLocalParticipant } from '../../hooks/useLocalParticipant/useLocalParticipant';
import { Lightbox } from '../Lightbox/Lightbox';

export interface IScreenShareProps {
  participantSid: string | null;
  onSourceChange?: (publication: RemoteTrackPublication | LocalTrackPublication | null) => void;
  onStreamEnd?: () => void;
  className?: string;
  placeholderClassName?: string;
  emptyMessage?: React.ReactNode;
  isFullscreen?: boolean;
  onFullscreenExit?: () => void;
  id?: string;
  /**
   * For advanced use cases - normally this component is declarative
   * and stops the stream when it is unmounted, but if you want to keep
   * the video stream published after this component is gone, pass `true`.
   * Be sure to clean it up when you're done with it though.
   */
  keepPublishedOnUnmount?: boolean;
}

function useScreenSharePublication({
  participantSid,
  keepPublishedOnUnmount,
  onStreamEnd,
}: {
  participantSid: string | null;
  keepPublishedOnUnmount: boolean;
  onStreamEnd?: () => void;
}) {
  const participant = useParticipant(participantSid);
  const localParticipant = useLocalParticipant();
  const publications = usePublications(participant);
  const screenSharePub = publications.find((p) => p.trackName === SCREEN_SHARE_TRACK_NAME);
  const [ready, setReady] = React.useState(false);

  const isLocal = participant === localParticipant;

  // this hook enforces that if the ScreenShare is rendering the local user's screen,
  // the media stream is requested automatically and published to everyone else.
  React.useEffect(() => {
    /**
     * This is an idempotent function; if the user already has a screen share published
     * it will return that instead of asking to create a new one.
     */
    async function publishScreenShare() {
      for (const t of localParticipant.videoTracks.values()) {
        if (t.trackName === SCREEN_SHARE_TRACK_NAME) {
          return t;
        }
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        // not supported yet - we'd need another track for audio and manage that...
        audio: false,
      });
      const track = stream.getTracks()[0];

      const pub = await localParticipant.publishTrack(track, {
        name: SCREEN_SHARE_TRACK_NAME,
        logLevel: 'debug',
      });

      // handles when the user manually kills their screenshare from the overlay or
      // otherwise disconnects unexpectedly
      track.addEventListener('ended', () => {
        localParticipant.unpublishTrack(track);
        localParticipant.emit('trackUnpublished', pub);
        track.stop();
        onStreamEnd?.();
      });

      return pub;
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
          .then((newPub) => {
            if (!newPub) return;

            console.debug('Cleaning up screenshare stream');

            localParticipant.unpublishTrack(newPub.track);
            localParticipant.emit('trackUnpublished', newPub);
            ((newPub.track as unknown) as MediaStreamTrack).stop();
          })
          .catch(() => {
            // nothing to do, nothing to clean up.
          });
      };
    }
  }, [localParticipant, isLocal, keepPublishedOnUnmount, onStreamEnd]);

  return [participant, screenSharePub, ready] as const;
}

/**
 * this component acts as a declarative way to display a user's screen share -
 * simply mounting the component with the ID of a particular user will request
 * a screen share from that user to populate the component. If the user rejects,
 * or disconnects their share, the
 */
export const ScreenShare: React.FC<IScreenShareProps> = ({
  participantSid,
  onSourceChange,
  className,
  emptyMessage,
  id,
  isFullscreen,
  onFullscreenExit,
  placeholderClassName,
  keepPublishedOnUnmount = false,
  onStreamEnd,
}) => {
  const [participant, pub, ready] = useScreenSharePublication({ participantSid, keepPublishedOnUnmount, onStreamEnd });

  React.useEffect(() => {
    // don't notify of stream change if the streams haven't
    // even been initialized yet (i.e. the initial `null` blank state)
    if (!ready) return;

    onSourceChange?.(pub || null);
  }, [onSourceChange, pub, ready]);

  if (!participant || !pub) {
    return <ScreenSharePlaceholder className={placeholderClassName || className} message={emptyMessage} />;
  }

  const video = (
    <Publication participant={participant} publication={pub} isLocal={false} classNames={className} id={id} />
  );

  if (isFullscreen) {
    return (
      <Lightbox open onClose={onFullscreenExit}>
        {video}
      </Lightbox>
    );
  }

  return video;
};
