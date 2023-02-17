import { Box, Divider, IconButton, ListItemIcon, ListItemText, MenuItem, Typography } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteIcon } from '@components/icons/DeleteIcon';
import { OptionsIcon } from '@components/icons/OptionsIcon';
import { ResponsiveMenu } from '@components/ResponsiveMenu/ResponsiveMenu';
import { WidgetType } from '@api/roomState/types/widgets';
import { useWidgetContext } from '../../useWidgetContext';
import { OpenInNewTabOption } from './OpenInNewTabOption';
import { logger } from '@utils/logger';
import api from '@api/client';

export type FileWidgetMenuProps = {
  className?: string;
  size?: 'small' | 'medium';
};

export function FileWidgetMenu(props: FileWidgetMenuProps) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const { remove, widget } = useWidgetContext<WidgetType.File>();

  const deleteWidget = async () => {
    const fileId = widget.widgetState.fileId;
    if (fileId) {
      try {
        await api.files.deleteFile(fileId);
      } catch (err) {
        logger.error(`Failed to delete file ${fileId}`, err);
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
          <Typography variant="caption">{`${t('widgets.link.uploadedBy')}${widget.creatorDisplayName}`}</Typography>
        </Box>
      </ResponsiveMenu>
    </>
  );
}
