import { makeStyles, Typography } from '@material-ui/core';
import * as React from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { Whiteboard } from '@components/Whiteboard/Whiteboard';
import { useSaveWidget } from '../useSaveWidget';
import { useExport } from './useExport';
import { WidgetContent } from '../WidgetContent';
import { useTranslation } from 'react-i18next';
import { SaveIcon } from '@components/icons/SaveIcon';
import { useWhiteboard } from '@components/Whiteboard/useWhiteboard';
import { WhiteboardTools } from '@components/Whiteboard/WhiteboardTools';
import { WhiteboardState } from '@components/Whiteboard/types';
import { ERASER_COLOR } from '@components/Whiteboard/constants';
import { WidgetTitlebarButton } from '../WidgetTitlebarButton';
import { WidgetType } from '@api/roomState/types/widgets';
import { useWidgetContext } from '../useWidgetContext';
import { ThemeName } from '../../../../theme/theme';
import { SIZE } from './constants';

export interface IWhiteboardWidgetProps {}

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

export const WhiteboardWidget: React.FC<IWhiteboardWidgetProps> = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { widget: state } = useWidgetContext<WidgetType.Whiteboard>();

  const update = useSaveWidget(state.widgetId);

  const handleWhiteboardChange = React.useCallback(
    (s: WhiteboardState) => {
      update({
        whiteboardState: s,
      });
    },
    [update]
  );

  const { whiteboardProps, exportToImageURL, toolsProps, activeColor } = useWhiteboard(
    state.widgetState.whiteboardState,
    handleWhiteboardChange
  );

  const handleExport = useExport(exportToImageURL);

  return (
    <WidgetFrame color={ThemeName.Snow} minWidth={SIZE.width} minHeight={SIZE.height} resizeDisabled>
      <WidgetTitlebar title={<WhiteboardTools {...toolsProps} />}>
        <WidgetTitlebarButton onClick={handleExport} aria-label={t('widgets.whiteboard.export')}>
          <SaveIcon fontSize="inherit" color="inherit" />
        </WidgetTitlebarButton>
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
