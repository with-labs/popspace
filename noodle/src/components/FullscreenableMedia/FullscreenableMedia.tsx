import * as React from 'react';
import clsx from 'clsx';
import Publication from '../Publication/Publication';
import { Lightbox } from '../Lightbox/Lightbox';
import { Box, IconButton, makeStyles, useTheme, Paper } from '@material-ui/core';
import { Speaker } from '@material-ui/icons';
import { PublishedMicToggle } from '@features/roomControls/media/PublishedMicToggle';
import { FullscreenExit } from '@material-ui/icons';

import { Spacing } from '@components/Spacing/Spacing';

export interface IFullscreenableMediaProps {
  className?: string;
  placeholderClassName?: string;
  emptyMessage?: React.ReactNode;
  isFullscreen?: boolean;
  onFullscreenExit?: () => void;
  id?: string;
  muted?: boolean;
  videoTrack: MediaStreamTrack | null;
  audioTrack: MediaStreamTrack | null;
}

const useStyles = makeStyles((theme) => ({
  lightbox: {
    // unfortunately MUI manages z-index in style directly :(
    zIndex: `${theme.zIndex.modal} !important` as any,
  },
  content: {
    // make room for the bottom bar
    maxWidth: '95vw',
    maxHeight: '100vh',
    height: '100%',
  },
  controls: {
    right: theme.spacing(3),
    bottom: theme.spacing(3),
    position: 'fixed',
    opacity: 1,
    display: 'block',
  },
  iconButton: {
    borderRadius: theme.shape.borderRadius,
    height: 40,
  },
  hideControls: {
    display: 'none',
    transition: 'opacity 2s ease-out',
    opacity: '0',
  },
  button: {
    height: 40,
  },
  test: {
    color: theme.palette.brandColors.snow.regular,
  },
}));

export const FullscreenableMedia: React.FC<IFullscreenableMediaProps> = ({
  className,
  id,
  isFullscreen,
  onFullscreenExit,
  muted,
  videoTrack,
  audioTrack,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const [showControls, setShowControls] = React.useState(true);

  React.useEffect(() => {
    let timeout: any;

    const handleMouseMove = () => {
      if (showControls) {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => setShowControls(false), 3000);
      } else {
        if (timeout) {
          clearTimeout(timeout);
        }
        setShowControls(true);
        timeout = setTimeout(() => setShowControls(false), 3000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [showControls]);

  const media = (
    <>
      {videoTrack ? (
        <Publication track={videoTrack} isLocal={false} classNames={clsx(classes.test, className)} id={id} />
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
          <Speaker fontSize="large" htmlColor={theme.palette.brandColors.snow.regular} />
        </Box>
      )}
      {audioTrack && (
        <Publication
          track={audioTrack}
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
        <>
          {media}
          <Spacing
            gap={1}
            flexDirection="column"
            className={clsx(classes.controls, { [classes.hideControls]: !showControls })}
            onClick={(event) => event.stopPropagation()}
          >
            <Box component={Paper}>
              <PublishedMicToggle showMicsList={false} className={classes.button} useSmall displayToolTip={false} />
            </Box>
            <Spacing component={Paper} gap={0.25}>
              <IconButton onClick={onFullscreenExit} classes={{ root: classes.iconButton }}>
                <FullscreenExit htmlColor={theme.palette.brandColors.slate.ink} />
              </IconButton>
            </Spacing>
          </Spacing>
        </>
      </Lightbox>
    );
  }

  return media;
};
