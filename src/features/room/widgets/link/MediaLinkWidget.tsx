import * as React from 'react';
import { LinkWidgetData } from '../../../../types/room';
import { makeStyles, Paper, ThemeProvider, Box, Typography } from '@material-ui/core';
import { Draggable } from '../../Draggable';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { WidgetContent } from '../WidgetContent';
import { WidgetResizeContainer } from '../WidgetResizeContainer';
import { WidgetResizeHandle } from '../WidgetResizeHandle';
import { slate } from '../../../../theme/theme';
import { Link } from '../../../../components/Link/Link';
import { useResizeContext } from '../../../../components/ResizeContainer/ResizeContainer';
import { UnsupportedFile } from './UnsupportedFile';
import { truncate } from '../../../../utils/truncate';

export interface IMediaLinkWidgetProps {
  widgetId: string;
  data: Required<LinkWidgetData>;
  onClose: () => void;
}

const useStyles = makeStyles((theme) => ({
  titlebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    color: theme.palette.common.black,
    zIndex: 1,
    backgroundColor: theme.palette.grey[100],
    transition: theme.transitions.create('opacity'),
  },
  resizeContainer: {
    display: 'flex',
  },
  link: {
    flex: 1,
  },
  media: {
    width: '100%',
    height: 'auto',
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
    display: 'block',
    '&:focus': {
      outline: 'none',
      boxShadow: theme.focusRings.primary,
    },
  },
  paper: {
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    '& $titlebar': {
      opacity: 0,
    },
    '&:hover $titlebar': {
      opacity: 1,
    },
  },
}));

/**
 * A different rendering mode for LinkWidget, focused on displaying
 * a piece of media using the full content frame, with resizing
 */
export const MediaLinkWidget: React.FC<IMediaLinkWidgetProps> = ({ widgetId, data, onClose }) => {
  const classes = useStyles();

  return (
    <Draggable id={widgetId}>
      <ThemeProvider theme={slate}>
        <Paper elevation={1} className={classes.paper}>
          {/* Transparent titlebar overlaps content */}
          <WidgetTitlebar title={data.title} className={classes.titlebar} onClose={onClose} />
          <WidgetContent disablePadding>
            <WidgetResizeContainer
              widgetId={widgetId}
              mode="scale"
              minWidth={340}
              minHeight={80}
              maxWidth={1440}
              maxHeight={900}
              className={classes.resizeContainer}
            >
              <Link to={data.url} newTab disableStyling className={classes.link}>
                <MediaLinkMedia
                  src={data.mediaUrl}
                  contentType={data.mediaContentType}
                  title={data.title}
                  className={classes.media}
                />
                {data.description && (
                  <Box p={1}>
                    <Typography variant="caption" title={data.description}>
                      {truncate(data.description, 80)}
                    </Typography>
                  </Box>
                )}
              </Link>
              <WidgetResizeHandle />
            </WidgetResizeContainer>
          </WidgetContent>
        </Paper>
      </ThemeProvider>
    </Draggable>
  );
};

const MediaLinkMedia: React.FC<{ src: string; contentType: string; title?: string; className?: string }> = ({
  src,
  contentType,
  title,
  className,
}) => {
  const { remeasure } = useResizeContext();

  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      const el = ref.current;
      el.addEventListener('resize', remeasure);
      return () => {
        el.removeEventListener('resize', remeasure);
      };
    }
  }, [remeasure]);

  if (contentType.startsWith('image')) {
    return <img src={src} alt={title} onLoad={remeasure} className={className} ref={ref as any} />;
  } else if (contentType.startsWith('video')) {
    return (
      <video src={src} title={title} autoPlay controls loop onLoad={remeasure} className={className} ref={ref as any} />
    );
  } else if (contentType === 'application/pdf') {
    return (
      <iframe
        src={src}
        title={title}
        style={{ minWidth: 400, minHeight: 400, height: '100%', width: '100%' }}
        className={className}
        ref={ref as any}
      />
    );
  } else {
    // TODO: support more.
    return (
      <div className={className}>
        <UnsupportedFile />
      </div>
    );
  }
};
