import * as React from 'react';
import { RemoteTrackPublication, LocalTrackPublication } from 'twilio-video';
import Publication from '../Publication/Publication';
import { ScreenSharePlaceholder } from './ScreenSharePlaceholder';
import { Lightbox } from '../Lightbox/Lightbox';
import { useParticipant } from '../../hooks/useParticipant/useParticipant';
import { useNamedTrack } from '../../hooks/useNamedTrack/useNamedTrack';
import { SCREEN_SHARE_TRACK_NAME, SCREEN_SHARE_AUDIO_TRACK_NAME } from '../../constants/User';

export interface IScreenShareProps {
  participantSid: string | null;
  onSourceChange?: (publication: RemoteTrackPublication | LocalTrackPublication | null) => void;
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
}

/**
 * this component acts as a declarative way to display a user's screen share -
 * simply mounting the component with the ID of a particular user will request
 * a screen share from that user to populate the component. If the user rejects,
 * or disconnects their share, the
 */
export const ScreenShare: React.FC<IScreenShareProps> = ({
  participantSid,
  className,
  emptyMessage,
  id,
  isFullscreen,
  onFullscreenExit,
  placeholderClassName,
  onSourceChange,
  muted,
  objectId,
}) => {
  const participant = useParticipant(participantSid);
  const videoPub = useNamedTrack(participant, SCREEN_SHARE_TRACK_NAME);
  const audioPub = useNamedTrack(participant, SCREEN_SHARE_AUDIO_TRACK_NAME);

  React.useEffect(() => {
    onSourceChange?.(videoPub);
  }, [videoPub, onSourceChange]);

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
      <Lightbox open onClose={onFullscreenExit} onClick={onFullscreenExit}>
        {media}
      </Lightbox>
    );
  }

  return media;
};
