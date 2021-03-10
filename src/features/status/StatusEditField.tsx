import { FilledInput, FilledInputProps, IconButton, InputAdornment } from '@material-ui/core';
import { Emoji, Picker } from 'emoji-mart';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { CloseIcon } from '../../components/icons/CloseIcon';
import { EmojiIcon } from '../../components/icons/EmojiIcon';
import { ResponsivePopover } from '../../components/ResponsivePopover/ResponsivePopover';
import { useUserStatus } from './useUserStatus';

export interface StatusEditFieldProps extends Omit<FilledInputProps, 'value' | 'onChange'> {
  onEnter?: () => void;
  buttonClass?: string;
}

const handleFocusSelectAll = (ev: React.FocusEvent<HTMLInputElement>) => {
  ev.target.setSelectionRange(0, ev.target.value.length);
};

export const StatusEditField = React.forwardRef<HTMLDivElement, StatusEditFieldProps>(
  ({ onEnter, buttonClass, ...props }, ref) => {
    const { t } = useTranslation();

    const { status, set } = useUserStatus();

    // also controls menu open state
    const [emojiAnchorEl, setEmojiAnchorEl] = React.useState<HTMLElement | null>(null);

    const [inputValue, setInputValue] = React.useState(status.statusText || '');

    React.useEffect(() => {
      setInputValue(status.statusText || '');
    }, [status.statusText]);

    const clearStatus = () => {
      setInputValue('');
      set({
        statusText: '',
        emoji: null,
      });
    };

    const commitChanges = () => {
      set({
        statusText: inputValue,
        emoji: status.emoji,
      });
    };

    return (
      <FilledInput
        ref={ref}
        value={inputValue}
        name="status"
        placeholder={t('features.room.statusMenu.statusPlaceHolder')}
        autoFocus
        onFocus={handleFocusSelectAll}
        fullWidth
        startAdornment={
          <div>
            <InputAdornment position="start" style={{ marginRight: 8 }}>
              <IconButton
                aria-label={t('features.room.emojiTitle')}
                onClick={(ev: React.MouseEvent<HTMLElement>) => setEmojiAnchorEl(ev.target as any)}
                size="small"
                className={buttonClass}
              >
                {status.emoji ? (
                  <Emoji native emoji={status.emoji ?? 'speech_balloon'} size={24} />
                ) : (
                  <EmojiIcon fontSize="default" />
                )}
              </IconButton>
            </InputAdornment>
            <ResponsivePopover anchorEl={emojiAnchorEl} open={!!emojiAnchorEl} onClose={() => setEmojiAnchorEl(null)}>
              <Picker
                native
                title={t('features.room.statusMenu.emojiTitle')}
                onSelect={(dat) => {
                  set({ statusText: status.statusText, emoji: dat.id! });
                  setEmojiAnchorEl(null);
                }}
              />
            </ResponsivePopover>
          </div>
        }
        endAdornment={
          <InputAdornment position="end">
            <IconButton aria-label={t('features.status.altClearButton')} onClick={clearStatus} edge="end" size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        }
        onKeyDown={(ev: any) => {
          if (ev.key === 'Enter') {
            commitChanges();
            onEnter?.();
            ev.preventDefault();
          }
        }}
        onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
          setInputValue(ev.target.value);
        }}
        onBlur={commitChanges}
        {...props}
      />
    );
  }
);
