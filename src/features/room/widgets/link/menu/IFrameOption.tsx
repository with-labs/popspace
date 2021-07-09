import { WidgetType } from '@api/roomState/types/widgets';
import { ListItemIcon, ListItemText, MenuItem, MenuItemProps } from '@material-ui/core';
import { Fullscreen, FullscreenExit } from '@material-ui/icons';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useWidgetContext } from '../../useWidgetContext';

export interface IIFrameOptionProps extends Omit<MenuItemProps, 'button'> {}

export const IFrameOption = React.forwardRef<HTMLLIElement, IIFrameOptionProps>((props, ref) => {
  const { t } = useTranslation();

  const {
    save,
    widget: {
      widgetState: { showIframe },
    },
  } = useWidgetContext<WidgetType.Link>();

  const toggleIframe = React.useCallback(() => {
    const showIframeNow = !showIframe; // simple toggle
    save({
      showIframe: showIframeNow,
    });
  }, [showIframe, save]);

  return (
    <MenuItem button onClick={toggleIframe} ref={ref} {...props}>
      <ListItemIcon>{showIframe ? <FullscreenExit /> : <Fullscreen />}</ListItemIcon>
      <ListItemText>{showIframe ? t('widgets.link.collapse') : t('widgets.link.expandInline')}</ListItemText>
    </MenuItem>
  );
});
