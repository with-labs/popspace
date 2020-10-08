import { makeStyles, IconButton } from '@material-ui/core';
import * as React from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar, WidgetTitlebarProps } from '../WidgetTitlebar';
import { WhiteboardWidgetState } from '../../../../types/room';
import { Whiteboard, WhiteboardState } from '../../../../withComponents/Whiteboard/Whiteboard';
import { useSaveWidget } from '../useSaveWidget';
import { CloudDownloadOutlined } from '@material-ui/icons';
import { useExport } from './useExport';
import { WidgetContent } from '../WidgetContent';
import { WidgetResizeHandle } from '../WidgetResizeHandle';

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
  root: {},
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

  const update = useSaveWidget(state.id);

  const handleWhiteboardChange = React.useCallback(
    (s: WhiteboardState) => {
      update({
        whiteboardState: s,
      });
    },
    [update]
  );

  const { ref, handleExport } = useExport();

  return (
    <WidgetFrame color="turquoise">
      <WidgetTitlebar title="Whiteboard" onClose={onClose} {...titlebarProps}>
        <IconButton size="small" onClick={handleExport}>
          <CloudDownloadOutlined />
        </IconButton>
      </WidgetTitlebar>
      <WidgetContent className={classes.root}>
        <Whiteboard value={state.data.whiteboardState} onChange={handleWhiteboardChange} ref={ref} />
      </WidgetContent>
      <WidgetResizeHandle />
    </WidgetFrame>
  );
};
