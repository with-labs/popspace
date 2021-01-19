import { ListItemIcon, ListItemText, MenuItem } from '@material-ui/core';
import { Fullscreen, FullscreenExit } from '@material-ui/icons';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useResizeContext } from '../../../../../components/ResizeContainer/ResizeContainer';
import { WidgetType } from '../../../../../roomState/types/widgets';
import { useWidgetContext } from '../../useWidgetContext';

export interface IIframeOptionProps {}

export function IframeOption() {
  const { t } = useTranslation();

  const {
    save,
    widget: {
      widgetState: { showIframe },
    },
  } = useWidgetContext<WidgetType.Link>();

  const { remeasure } = useResizeContext();

  const toggleIframe = React.useCallback(() => {
    save({
      showIframe: !showIframe,
    });
    setTimeout(() => {
      remeasure();
    }, 10);
  }, [showIframe, save, remeasure]);

  return (
    <MenuItem button onClick={toggleIframe}>
      <ListItemIcon>{showIframe ? <FullscreenExit /> : <Fullscreen />}</ListItemIcon>
      <ListItemText>{showIframe ? t('widgets.link.collapse') : t('widgets.link.expandInline')}</ListItemText>
    </MenuItem>
  );
}
