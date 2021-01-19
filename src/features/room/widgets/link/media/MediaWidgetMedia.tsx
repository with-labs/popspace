import { makeStyles } from '@material-ui/core';
import useMergedRef from '@react-hook/merged-ref';
import clsx from 'clsx';
import * as React from 'react';
import { SpatialAudio } from '../../../../../components/SpatialAudio/SpatialAudio';
import { SpatialVideo } from '../../../../../components/SpatialVideo/SpatialVideo';
import { WidgetMediaState, WidgetType } from '../../../../../roomState/types/widgets';
import { MediaControls, useBindMediaControls } from '../../common/MediaControls';
import { useWidgetContext } from '../../useWidgetContext';
import { UnsupportedFile } from './UnsupportedFile';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: 'relative',
    '&:hover, &:focus': {
      '& > $videoControls': {
        visibility: 'visible',
        pointerEvents: 'initial',
      },
    },
  },
  hiddenAudio: {
    height: 0,
  },
  videoControls: {
    position: 'absolute',
    left: theme.spacing(1),
    bottom: theme.spacing(1),
    right: theme.spacing(1),
    top: 'auto',
    visibility: 'hidden',
    pointerEvents: 'none',
    zIndex: 5,

    '&:focus-within': {
      visibility: 'visible',
      pointerEvents: 'initial',
    },
  },
  audioControls: {
    width: 300,
  },
  video: {
    width: '100%',
    height: 'auto',
    display: 'block',
    objectFit: 'cover',
    borderRadius: 14,
  },
}));

export const MediaLinkMedia = React.forwardRef<
  HTMLVideoElement | HTMLAudioElement | HTMLImageElement,
  {
    className?: string;
    widgetId: string;
  }
>(({ className, widgetId }, ref) => {
  const classes = useStyles();

  const {
    widget: { widgetState },
    save,
  } = useWidgetContext<WidgetType.Link>();
  const { mediaUrl, mediaContentType, title, mediaState } = widgetState;

  const onMediaStateChanged = React.useCallback(
    (ms: WidgetMediaState) => {
      save({
        mediaState: ms,
      });
    },
    [save]
  );

  const [mediaRef, mediaControlsProps] = useBindMediaControls(mediaState, onMediaStateChanged, {
    allowFullscreen: !!mediaContentType?.startsWith('video'),
  });

  if (mediaContentType?.startsWith('image')) {
    return <img src={mediaUrl} alt={title} className={className} ref={ref as any} />;
  } else if (mediaContentType?.startsWith('video')) {
    return (
      <div className={clsx(classes.wrapper, className)}>
        <SpatialVideo
          objectKind="widget"
          objectId={widgetId}
          src={mediaUrl}
          title={title}
          controls={false}
          className={classes.video}
          ref={useMergedRef(mediaRef, ref as React.Ref<HTMLVideoElement>)}
        />
        <MediaControls {...mediaControlsProps} className={classes.videoControls} />
      </div>
    );
  } else if (mediaContentType?.startsWith('audio')) {
    return (
      <div className={className}>
        <SpatialAudio
          objectKind="widget"
          objectId={widgetId}
          src={mediaUrl}
          title={title}
          controls={false}
          className={classes.hiddenAudio}
          ref={useMergedRef(mediaRef, ref as React.Ref<HTMLAudioElement>)}
        />
        <MediaControls {...mediaControlsProps} className={classes.audioControls} />
      </div>
    );
  } else {
    // TODO: support more?
    return (
      <div className={className}>
        <UnsupportedFile />
      </div>
    );
  }
});
