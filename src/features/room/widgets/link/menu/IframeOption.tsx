import { ListItemIcon, ListItemText, MenuItem, MenuItemProps } from '@material-ui/core';
import { Fullscreen, FullscreenExit } from '@material-ui/icons';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useCanvasObject } from '@providers/canvas/CanvasObject';
import { WidgetType } from '@roomState/types/widgets';
import { useWidgetContext } from '../../useWidgetContext';
import { INITIAL_SIZE_FRAME } from '../constants';

export interface IIframeOptionProps extends Omit<MenuItemProps, 'button'> {}

export const IframeOption = React.forwardRef<HTMLLIElement, IIframeOptionProps>((props, ref) => {
  const { t } = useTranslation();

  const {
    save,
    widget: {
      widgetState: { showIframe },
    },
  } = useWidgetContext<WidgetType.Link>();

  const { resize } = useCanvasObject();

  const toggleIframe = React.useCallback(() => {
    const showIframeNow = !showIframe; // simple toggle
    save({
      showIframe: showIframeNow,
    });
    // resize the frame to be larger after toggling
    if (showIframeNow) {
      setTimeout(() => {
        resize(INITIAL_SIZE_FRAME, true);
      }, 10);
    }
  }, [showIframe, save, resize]);

  return (
    <MenuItem button onClick={toggleIframe} ref={ref} {...props}>
      <ListItemIcon>{showIframe ? <FullscreenExit /> : <Fullscreen />}</ListItemIcon>
      <ListItemText>{showIframe ? t('widgets.link.collapse') : t('widgets.link.expandInline')}</ListItemText>
    </MenuItem>
  );
});
