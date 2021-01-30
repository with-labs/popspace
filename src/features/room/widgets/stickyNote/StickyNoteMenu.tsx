import { Box, Divider, IconButton, ListItemIcon, ListItemText, MenuItem, Typography } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteIcon } from '../../../../components/icons/DeleteIcon';
import { EditIcon } from '../../../../components/icons/EditIcon';
import { OptionsIcon } from '../../../../components/icons/OptionsIcon';
import { ResponsiveMenu } from '../../../../components/ResponsiveMenu/ResponsiveMenu';
import { WidgetType } from '../../../../roomState/types/widgets';
import { useWidgetContext } from '../useWidgetContext';
import { AddNoteMenuItem } from './AddNoteMenuItem';

export interface IStickyNoteMenuProps {
  onEdit?: () => void;
}

export const StickyNoteMenu: React.FC<IStickyNoteMenuProps> = ({ onEdit, ...props }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const { remove, widget } = useWidgetContext<WidgetType.StickyNote>();

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
        {onEdit && (
          <MenuItem onClick={onEdit}>
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            <ListItemText primary={t('widgets.stickyNote.edit')} />
          </MenuItem>
        )}
        <AddNoteMenuItem />
        <MenuItem onClick={remove}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText primary={t('widgets.common.close')} />
        </MenuItem>
        <Divider />
        <Box p={1}>
          <Typography variant="caption">{`${t('widgets.stickyNote.addedBy')}${widget.ownerDisplayName}`}</Typography>
        </Box>
      </ResponsiveMenu>
    </>
  );
};
