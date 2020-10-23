import { makeStyles, IconButton, Typography } from '@material-ui/core';
import * as React from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { WhiteboardWidgetState } from '../../../../types/room';
import { Whiteboard } from '../../../../withComponents/Whiteboard/Whiteboard';
import { useSaveWidget } from '../useSaveWidget';
import { useExport } from './useExport';
import { WidgetContent } from '../WidgetContent';
import { useTranslation } from 'react-i18next';
import { SaveIcon } from '../../../../withComponents/icons/SaveIcon';
import { useWhiteboard } from '../../../../withComponents/Whiteboard/useWhiteboard';
import { WhiteboardTools } from '../../../../withComponents/Whiteboard/WhiteboardTools';
import { WhiteboardState } from '../../../../withComponents/Whiteboard/types';
import { ERASER_COLOR } from '../../../../withComponents/Whiteboard/constants';

export interface IWhiteboardWidgetProps {
  state: WhiteboardWidgetState;
  /**
   * Called when the user hits the X to close the widget
   */
  onClose: () => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
  },
  eraserNotice: {
    position: 'absolute',
    bottom: theme.spacing(1),
    left: 0,
    width: '100%',
    textAlign: 'center',
    pointerEvents: 'none',
  },
}));

export const WhiteboardWidget: React.FC<IWhiteboardWidgetProps> = ({ state, onClose }) => {
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

  const { whiteboardProps, exportToImageURL, toolsProps, activeColor } = useWhiteboard(
    state.data.whiteboardState,
    handleWhiteboardChange
  );

  const handleExport = useExport(exportToImageURL);

  return (
    <WidgetFrame color="snow" widgetId={state.id} minWidth={720} minHeight={480} maxWidth={720}>
      <WidgetTitlebar title={<WhiteboardTools {...toolsProps} />} onClose={onClose}>
        <IconButton size="small" onClick={handleExport}>
          <SaveIcon fontSize="inherit" color="inherit" />
        </IconButton>
      </WidgetTitlebar>
      <WidgetContent className={classes.root} disablePadding>
        <Whiteboard {...whiteboardProps} />
        {activeColor === ERASER_COLOR && (
          <Typography variant="caption" className={classes.eraserNotice}>
            {t('widgets.whiteboard.doubleTapEraserToClear')}
          </Typography>
        )}
      </WidgetContent>
    </WidgetFrame>
  );
};
