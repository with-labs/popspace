import React from 'react';
import { makeStyles, MenuItem, Divider, ListSubheader, ListItemIcon, ListItemText, MenuList } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { IResponsivePopoverProps, ResponsivePopover } from '../../../components/ResponsivePopover/ResponsivePopover';
import { Emoji } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import { useUserStatus } from '../../status/useUserStatus';
import { StatusEditField } from '../../status/StatusEditField';

export interface IStatusMenuProps extends IResponsivePopoverProps {}

const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.up('md')]: {
      width: 300,
    },
  },
}));

const suggestions = [
  {
    emoji: ':calendar:',
    status: 'features.room.statusMenu.suggestions.suggestion1',
  },
  {
    emoji: ':keyboard:',
    status: 'features.room.statusMenu.suggestions.suggestion2',
  },
  {
    emoji: ':dog2:',
    status: 'features.room.statusMenu.suggestions.suggestion3',
  },
];

/**
 * Renders a menu with options to set the users status
 */
export const StatusMenu: React.FC<IStatusMenuProps> = ({ open, onClose, anchorEl, ...rest }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { set, history } = useUserStatus();

  const onPresetStatusPressed = (emojiId: string | null, status: string) => {
    set({
      statusText: status,
      emoji: emojiId ?? null,
    });
    onClose();
  };

  return (
    <ResponsivePopover open={open} onClose={onClose} anchorEl={anchorEl} {...rest}>
      <div className={classes.root}>
        <StatusEditField onEnter={onClose} />
        <ListSubheader disableGutters style={{ marginTop: 8 }}>
          {t('features.room.statusMenu.historyTitle')}
        </ListSubheader>
        <MenuList variant="menu">
          {history.map((status, idx) => {
            return (
              <MenuItem
                key={`${status.emoji}${status.statusText}`}
                onClick={() => onPresetStatusPressed(status.emoji ?? 'speech_balloon', status.statusText)}
              >
                <ListItemIcon>
                  <Emoji emoji={status.emoji || 'speech_balloon'} native size={24} />
                </ListItemIcon>
                <ListItemText primary={status.statusText} />
              </MenuItem>
            );
          })}
        </MenuList>
        <Divider />
        <ListSubheader disableGutters>{t('features.room.statusMenu.suggestionsTitle')}</ListSubheader>
        <MenuList variant="menu">
          {suggestions.map((suggestion, idx) => {
            return (
              <MenuItem
                key={`status_sugestion_${idx}`}
                onClick={() => onPresetStatusPressed(suggestion.emoji, t(suggestion.status))}
              >
                <ListItemIcon>
                  <Emoji emoji={suggestion.emoji} native size={24} />
                </ListItemIcon>
                <ListItemText primary={t(suggestion.status)} />
              </MenuItem>
            );
          })}
        </MenuList>
      </div>
    </ResponsivePopover>
  );
};
