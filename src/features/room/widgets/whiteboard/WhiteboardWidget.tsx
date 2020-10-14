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
import { useTranslation } from 'react-i18next';

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
  },
}));

export const WhiteboardWidget: React.FC<IWhiteboardWidgetProps> = ({ state, onClose, titlebarProps }) => {
  const classes = useStyles();
  const { t } = useTranslation();

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
      <WidgetTitlebar title={t('widgets.whiteboard.title')} onClose={onClose} {...titlebarProps}>
        <IconButton size="small" onClick={handleExport}>
          <CloudDownloadOutlined />
        </IconButton>
      </WidgetTitlebar>
      <WidgetContent className={classes.root} disablePadding>
        <Whiteboard value={state.data.whiteboardState} onChange={handleWhiteboardChange} ref={ref} />
      </WidgetContent>
    </WidgetFrame>
  );
};
