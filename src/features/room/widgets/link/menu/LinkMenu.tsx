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
import { logger } from '../../../../../utils/logger';
import api from '../../../../../utils/api';
import { ApiError } from '../../../../../errors/ApiError';

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

  const deleteWidget = async () => {
    // if this is a file widget, try to delete the file first
    if (widget.widgetState.isFileUpload && widget.widgetState.mediaUrl) {
      const fileUrl = widget.widgetState.mediaUrl;
      try {
        const response = await api.deleteFile(fileUrl);
        if (!response.success) {
          throw new ApiError(response);
        }
      } catch (err) {
        logger.error(`Failed to delete file ${fileUrl}`, err);
      }
    }
    remove();
  };

  return (
    <>
      <IconButton
        onClick={(ev) => setAnchorEl(ev.currentTarget)}
        aria-haspopup
        aria-controls={!!anchorEl ? 'linkMenu' : undefined}
        {...props}
      >
        <OptionsIcon />
      </IconButton>
      <ResponsiveMenu
        id="linkMenu"
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        onClick={() => setAnchorEl(null)}
      >
        <OpenInNewTabOption />
        <Divider />
        <MenuItem button onClick={deleteWidget}>
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
