import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  MenuItem,
  Divider,
  ListSubheader,
  InputAdornment,
  IconButton,
  ListItemIcon,
  ListItemText,
  Button,
  MenuList,
  FilledInput,
} from '@material-ui/core';
import { useLocalStorage } from '../../../hooks/useLocalStorage/useLocalStorage';
import { useTranslation } from 'react-i18next';
import { EmojiIcon } from '../../../components/icons/EmojiIcon';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { ResponsivePopover } from '../../../components/ResponsivePopover/ResponsivePopover';
import { STATUS_HISTORY } from '../../../constants/User';
import { Emoji, EmojiData, Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

const MAX_HISTORY = 3;
export interface IStatusMenuProps {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  emoji?: string | EmojiData | null;
  status?: string | null;
}

const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.up('md')]: {
      maxWidth: 330,
    },
  },
  emojiPickerBtn: {
    marginRight: theme.spacing(1),
  },
  inputField: {
    marginBottom: theme.spacing(2),
  },
}));

type statusData = {
  emoji: string;
  status: string;
};

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
export const StatusMenu: React.FC<IStatusMenuProps> = ({ open, onClose, anchorEl, status, emoji }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const updateSelf = useRoomStore((room) => room.api.updateSelf);
  const [statusHistory, setStatusHistory] = useLocalStorage(STATUS_HISTORY, []);

  // also controls menu open state
  const [emojiAnchorEl, setEmojiAnchorEl] = React.useState<HTMLElement | null>(null);

  const [inputValue, setInputValue] = React.useState(status || '');

  useEffect(() => {
    setInputValue(status || '');
  }, [status]);

  const updateHistory = (status?: string, emoji?: string | EmojiData | null) => {
    if (
      statusHistory
        .map((history: statusData) => `${history.emoji}${history.status}`)
        .includes(`${emoji ?? 'speech_balloon'}${status}`)
    )
      return;

    const history = [{ emoji: emoji?.toString() || 'speech_balloon', status: status || '' }, ...statusHistory];
    if (history.length > MAX_HISTORY) {
      history.pop();
    }
    setStatusHistory(history);
  };

  const onEmojiChange = (id: string) => {
    updateSelf({
      emoji: id,
    });
    setEmojiAnchorEl(null);
  };

  const onPresetStatusPressed = (emojiId?: string, status?: string) => {
    updateHistory(status, emojiId);
    updateSelf({
      statusText: status,
      emoji: emojiId,
    });
    onClose();
  };

  const clearStatus = () => {
    setInputValue('');
    updateSelf({
      statusText: '',
      emoji: null,
    });
  };

  const onCloseHandler = () => {
    // if a user has updated their written status, we will add it to the status history.
    // if the emoji is blank, we will default to the speech_balloon emoji
    if (inputValue && inputValue?.length > 0) {
      updateHistory(inputValue || '', emoji);
    }

    updateSelf({
      statusText: inputValue,
      emoji: emoji?.toString(),
    });

    onClose();
  };

  return (
    <ResponsivePopover open={open} onClose={onCloseHandler} anchorEl={anchorEl} className={classes.root}>
      <FilledInput
        value={inputValue}
        name="status"
        placeholder={t('features.room.statusMenu.statusPlaceHolder')}
        autoFocus
        className={classes.inputField}
        fullWidth
        startAdornment={
          <div>
            <InputAdornment position="start" classes={{ root: classes.emojiPickerBtn }}>
              <IconButton
                aria-label={t('features.room.emojiTitle')}
                onClick={(ev: React.MouseEvent<HTMLElement>) => setEmojiAnchorEl(ev.target as any)}
                size="small"
              >
                {emoji ? <Emoji emoji={emoji ?? 'speech_balloon'} size={24} /> : <EmojiIcon fontSize="default" />}
              </IconButton>
            </InputAdornment>
            <ResponsivePopover anchorEl={emojiAnchorEl} open={!!emojiAnchorEl} onClose={() => setEmojiAnchorEl(null)}>
              <Picker
                native
                title={t('features.room.statusMenu.emojiTitle')}
                onSelect={(dat) => onEmojiChange(dat.id!)}
              />
            </ResponsivePopover>
          </div>
        }
        onKeyDown={(ev: any) => {
          if (ev.key === 'Enter') {
            onCloseHandler();
            ev.preventDefault();
          }
        }}
        onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
          setInputValue(ev.target.value);
        }}
      />
      <Button onClick={clearStatus}>{t('features.room.statusMenu.clearStatusButton')}</Button>

      <ListSubheader disableGutters>{t('features.room.statusMenu.historyTitle')}</ListSubheader>
      <MenuList variant="menu">
        {statusHistory.map((status: statusData, idx: number) => {
          return (
            <MenuItem
              key={`status_sugestion_${idx}`}
              onClick={() => onPresetStatusPressed(status.emoji ?? 'speech_balloon', status.status)}
            >
              <ListItemIcon>
                <Emoji emoji={status.emoji} size={24} />
              </ListItemIcon>
              <ListItemText primary={status.status} />
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
                <Emoji emoji={suggestion.emoji} size={24} />
              </ListItemIcon>
              <ListItemText primary={t(suggestion.status)} />
            </MenuItem>
          );
        })}
      </MenuList>
    </ResponsivePopover>
  );
};
