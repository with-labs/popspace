import { ListItemIcon, ListItemText, MenuItem } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { OpenIcon } from '../../../../../components/icons/OpenIcon';
import { Link } from '../../../../../components/Link/Link';
import { WidgetType } from '../../../../../roomState/types/widgets';
import { useWidgetContext } from '../../useWidgetContext';

export const OpenInNewTabOption = () => {
  const { t } = useTranslation();
  const {
    widget: {
      widgetState: { mediaUrl },
    },
  } = useWidgetContext<WidgetType.Link>();

  return (
    <MenuItem button component={Link} to={mediaUrl!} newTab>
      <ListItemIcon>
        <OpenIcon />
      </ListItemIcon>
      <ListItemText>{t('widgets.link.openInNewTab')}</ListItemText>
    </MenuItem>
  );
};
