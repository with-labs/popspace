import * as React from 'react';
import { RemoteTrackPublication, LocalTrackPublication } from 'twilio-video';
import Publication from '../Publication/Publication';
import { Lightbox } from '../Lightbox/Lightbox';
import { Box, makeStyles } from '@material-ui/core';
import { Speaker } from '@material-ui/icons';

export interface IFullscreenableMediaProps {
  className?: string;
  placeholderClassName?: string;
  emptyMessage?: React.ReactNode;
  isFullscreen?: boolean;
  onFullscreenExit?: () => void;
  id?: string;
  muted?: boolean;
  videoPublication: RemoteTrackPublication | LocalTrackPublication | null;
  audioPublication: RemoteTrackPublication | LocalTrackPublication | null;
  /**
   * If this ScreenShare video is associated with a particular object, like a widget or user,
   * you can pass its ID to enable spatial audio.
   */
  objectId?: string;
}

const useStyles = makeStyles((theme) => ({
  lightbox: {
    // unfortunately MUI manages z-index in style directly :(
    zIndex: `${theme.zIndex.modal - 2} !important` as any,
  },
  content: {
    // make room for the bottom bar
    maxWidth: '95vw',
    maxHeight: 'calc(95vh - 128px)',
  },
}));

export const FullscreenableMedia: React.FC<IFullscreenableMediaProps> = ({
  className,
  id,
  isFullscreen,
  onFullscreenExit,
  muted,
  objectId,
  videoPublication,
  audioPublication,
}) => {
  const classes = useStyles();

  const media = (
    <>
      {videoPublication ? (
        <Publication publication={videoPublication} isLocal={false} classNames={className} id={id} />
      ) : (
        <Box
          className={className}
          minWidth={32}
          minHeight={32}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Speaker fontSize="large" />
        </Box>
      )}
      {audioPublication && (
        <Publication
          objectId={objectId}
          publication={audioPublication}
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
      <Lightbox
        open
        onClose={onFullscreenExit}
        onClick={onFullscreenExit}
        disableAutoFocus
        disableEnforceFocus
        contentClassName={classes.content}
        className={classes.lightbox}
      >
        {media}
      </Lightbox>
    );
  }

  return media;
};
