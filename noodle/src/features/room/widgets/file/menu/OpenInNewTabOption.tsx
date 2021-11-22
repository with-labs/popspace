import { ListItemIcon, ListItemText } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { OpenIcon } from '@components/icons/OpenIcon';
import { LinkMenuItem } from '@components/LinkMenuItem/LinkMenuItem';
import { WidgetType } from '@api/roomState/types/widgets';
import { useWidgetContext } from '../../useWidgetContext';

export const OpenInNewTabOption = React.forwardRef<HTMLLIElement, Record<string, unknown>>((props, ref) => {
  const { t } = useTranslation();
  const {
    widget: {
      widgetState: { url },
    },
  } = useWidgetContext<WidgetType.Link>();

  return (
    <LinkMenuItem to={url} newTab disableStyling ref={ref} {...props}>
      <ListItemIcon>
        <OpenIcon />
      </ListItemIcon>
      <ListItemText>{t('widgets.link.openInNewTab')}</ListItemText>
    </LinkMenuItem>
  );
});
