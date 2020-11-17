import * as React from 'react';
import { RemoteTrackPublication, LocalTrackPublication } from 'twilio-video';
import Publication from '../Publication/Publication';
import { ScreenSharePlaceholder } from './ScreenSharePlaceholder';
import { Lightbox } from '../Lightbox/Lightbox';
import { useScreenSharePublication } from '../../hooks/useScreenShare/useScreenShare';

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
  muted?: boolean;
  /**
   * If this ScreenShare video is associated with a particular object, like a widget or user,
   * you can pass its ID to enable spatial audio.
   */
  objectId?: string;
  /**
   * For advanced use cases - normally this component is declarative
   * and stops the stream when it is unmounted, but if you want to keep
   * the video stream published after this component is gone, pass `true`.
   * Be sure to clean it up when you're done with it though.
   */
  keepPublishedOnUnmount?: boolean;
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
  muted,
  objectId,
}) => {
  const { participant, videoPub, audioPub, ready } = useScreenSharePublication({
    participantSid,
    keepPublishedOnUnmount,
    onStreamEnd,
  });

  React.useEffect(() => {
    // don't notify of stream change if the streams haven't
    // even been initialized yet (i.e. the initial `null` blank state)
    if (!ready) return;

    onSourceChange?.(videoPub || null);
  }, [onSourceChange, videoPub, ready]);

  if (!participant || !videoPub) {
    return <ScreenSharePlaceholder className={placeholderClassName || className} message={emptyMessage} />;
  }

  const media = (
    <>
      <Publication publication={videoPub} isLocal={false} classNames={className} id={id} />
      {audioPub && (
        <Publication
          objectId={objectId}
          publication={audioPub}
          isLocal={false}
          classNames={className}
          disableAudio={muted}
          // when fullscreen, always use full volume
          disableSpatialAudio={isFullscreen}
          id={`${id}-audio`}
        />
      )}
    </>
  );

  if (isFullscreen) {
    return (
      <Lightbox open onClose={onFullscreenExit} onClick={onFullscreenExit} disableAutoFocus disableEnforceFocus>
        {media}
      </Lightbox>
    );
  }

  return media;
};
