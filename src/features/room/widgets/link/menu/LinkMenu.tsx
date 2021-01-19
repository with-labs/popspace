import { Box, Divider, IconButton, ListItemIcon, ListItemText, MenuItem, Typography } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteIcon } from '../../../../../components/icons/DeleteIcon';
import { OptionsIcon } from '../../../../../components/icons/OptionsIcon';
import { ResponsiveMenu } from '../../../../../components/ResponsiveMenu/ResponsiveMenu';
import { LinkWidgetState, WidgetType } from '../../../../../roomState/types/widgets';
import { useWidgetContext } from '../../useWidgetContext';
import { OpenInNewTabOption } from './OpenInNewTabOption';
import { IframeOption } from './IframeOption';

export type LinkMenuProps = {
  className?: string;
  size?: 'small' | 'medium';
};

const IFRAME_CONTENT_TYPES = [/^application\/pdf$/, /^text/];
function canUseIframe(widgetState: LinkWidgetState) {
  const { iframeUrl, mediaContentType } = widgetState;
  return !!iframeUrl || (mediaContentType && IFRAME_CONTENT_TYPES.some((regex) => regex.test(mediaContentType)));
}

export function LinkMenu(props: LinkMenuProps) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const { remove, widget } = useWidgetContext<WidgetType.Link>();

  const iframeable = canUseIframe(widget.widgetState);

  return (
    <>
      <IconButton onClick={(ev) => setAnchorEl(ev.currentTarget)} {...props}>
        <OptionsIcon />
      </IconButton>
      <ResponsiveMenu
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        onClick={() => setAnchorEl(null)}
      >
        {iframeable && <IframeOption />}
        <OpenInNewTabOption />
        <Divider />
        <MenuItem button onClick={remove}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText primary={t('widgets.common.close')} />
        </MenuItem>
        <Divider />
        <Box p={1}>
          <Typography variant="caption">{`${t('widgets.link.uploadedBy')}${widget.ownerDisplayName}`}</Typography>
        </Box>
      </ResponsiveMenu>
    </>
  );
}
