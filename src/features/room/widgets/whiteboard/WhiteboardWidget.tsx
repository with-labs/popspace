import { Box, makeStyles } from '@material-ui/core';
import * as React from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar, WidgetTitlebarProps } from '../WidgetTitlebar';
import { WhiteboardWidgetState } from '../../../../types/room';

export interface IWhiteboardWidgetProps {
  state: WhiteboardWidgetState;
  /**
   * Called when the user hits the X to close the widget
   */
  onClose: () => void;
  /**
   * Attach extra props to the titlebar - for instance
   * binding it to a drag gesture
   */
  titlebarProps?: Partial<WidgetTitlebarProps>;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    overflow: 'hidden',
    height: '40vh',
    width: '45vw',
    [theme.breakpoints.down('md')]: {
      bottom: 0,
      right: 10,
      height: '35vh',
      width: `calc(100vw - 20px)`,
    },
  },
  frame: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 10,
    border: 'none',
  },
  matte: {
    position: 'absolute',
    overflow: 'hidden',
    top: -100,
    bottom: 0,
    left: -200,
    right: -200,
    background: 'white',
  },
}));

export const WhiteboardWidget: React.FC<IWhiteboardWidgetProps> = ({ state, onClose, titlebarProps }) => {
  const classes = useStyles();

  // makes sure this won't change over the component's lifetime
  const { current: staticWhiteboardId } = React.useRef(state.data.whiteboardId);

  return (
    <WidgetFrame color="turquoise">
      <WidgetTitlebar title="Whiteboard" onClose={onClose} {...titlebarProps} />
      <Box className={classes.root}>
        <div className={classes.frame}>
          <div className={classes.matte}>
            <iframe
              title="whiteboard-widget"
              src={`${window.location.protocol}//witeboard.com/${staticWhiteboardId}`}
              scrolling="no"
              width="100%"
              height="100%"
            />
          </div>
        </div>
      </Box>
    </WidgetFrame>
  );
};
