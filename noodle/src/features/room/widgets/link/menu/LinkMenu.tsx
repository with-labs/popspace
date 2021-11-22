import { WidgetType } from '@api/roomState/types/widgets';
import { DeleteIcon } from '@components/icons/DeleteIcon';
import { OptionsIcon } from '@components/icons/OptionsIcon';
import { ResponsiveMenu } from '@components/ResponsiveMenu/ResponsiveMenu';
import { Box, Divider, IconButton, ListItemIcon, ListItemText, MenuItem, Typography } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useWidgetContext } from '../../useWidgetContext';
import { IFrameOption } from './IFrameOption';
import { OpenInNewTabOption } from './OpenInNewTabOption';

export type LinkMenuProps = {
  className?: string;
  size?: 'small' | 'medium';
  enableIframe: boolean;
};

export function LinkMenu({ enableIframe, ...props }: LinkMenuProps) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const { remove, widget } = useWidgetContext<WidgetType.Link>();

  return (
    <>
      <IconButton
        onClick={(ev) => {
          setAnchorEl(ev.currentTarget);
        }}
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
        onClose={() => {
          setAnchorEl(null);
        }}
        onClick={() => {
          setAnchorEl(null);
        }}
      >
        {enableIframe && <IFrameOption />}
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
          <Typography variant="caption">{`${t('widgets.link.uploadedBy')}${widget.creatorDisplayName}`}</Typography>
        </Box>
      </ResponsiveMenu>
    </>
  );
}
