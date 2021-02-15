import * as React from 'react';
import {
  makeStyles,
  Typography,
  ButtonBase,
  ClickAwayListener,
  IconButton,
  FilledInput,
  Menu,
  InputAdornment,
} from '@material-ui/core';
import { Emoji, EmojiData, Picker } from 'emoji-mart';
import { SizeTransition } from '../../../components/SizeTransition/SizeTransition';
import clsx from 'clsx';
import { EmojiIcon } from '../../../components/icons/EmojiIcon';
import { useTranslation } from 'react-i18next';
import 'emoji-mart/css/emoji-mart.css';
import { CloseIcon } from '../../../components/icons/CloseIcon';
import { useRoomStore } from '../../../roomState/useRoomStore';

export interface IPersonStatusProps {
  emoji?: string | EmojiData | null;
  status?: string | null;
  className?: string;
  isLocal: boolean;
  isParentHovered: boolean;
}

const useStyles = makeStyles((theme) => ({
  root: {
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
    borderBottomLeftRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.mainShadows.surface,
    padding: `${theme.spacing(1)}px`,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  rootEditing: {
    borderBottomRightRadius: theme.shape.borderRadius,
  },
  emoji: {
    fontSize: 18,
    lineHeight: 1,
  },
  text: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  input: {
    minWidth: 260,
  },
}));

const handleFocusSelectAll = (ev: React.FocusEvent<HTMLInputElement>) => {
  ev.target.setSelectionRange(0, ev.target.value.length);
};

export const PersonStatus: React.FC<IPersonStatusProps> = ({ isLocal, isParentHovered, emoji, status, className }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { open, close, editing, emojiButtonProps, emojiMenuProps, inputProps, onEmojiChange } = useStatusEditing({
    currentStatus: status || null,
    currentEmoji: emoji || null,
    isLocal,
  });

  const isEmpty = !emoji && !status;
  // the visibility of the status if this person bubble represents the local user:
  // visible if the user is hovering the bubble, or if they are actively editing (keeps the
  // status form visible even if their cursor leaves while typing or selecting emoji)
  const localStatusVisibility = isParentHovered || editing ? 'visible' : 'hidden';
  // how status visibility is computed:
  // 1. if the status is empty
  //   1a. if it's the local user, allow them to see it on hover or edit (see above)
  //   1b. if it's a remote user, it's hidden
  // 2. if the status is not empty, always show it.
  const visibility = isEmpty ? (isLocal ? localStatusVisibility : 'hidden') : 'visible';

  // this code controls the expansion state of the full text status, which
  // should only be shown for 5 seconds after being set, then collapsed until
  // the user hovers the bubble. However, we don't just want to set a timer for
  // 5 seconds after the initial change - the user may not have the tab open
  // to see it happen. So we wait for the tab to be foregrounded
  const [statusVisibilityExpired, setStatusVisibilityExpired] = React.useState(false);
  React.useEffect(() => {
    if (!status) {
      setStatusVisibilityExpired(true);
      return;
    }

    setStatusVisibilityExpired(false);
    let timer: NodeJS.Timeout;
    // wait for window focus
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        timer = setTimeout(() => setStatusVisibilityExpired(true), 5000);
      }
    }
    if (document.visibilityState === 'visible') {
      handleVisibilityChange();
      return () => {
        if (timer) clearTimeout(timer);
      };
    } else {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        if (timer) clearTimeout(timer);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [status]);

  // regardless of 5-second-timer, the text status should expand on hover.
  const isStatusExpanded = isParentHovered || !statusVisibilityExpired;

  if (editing) {
    return (
      <ClickAwayListener onClickAway={close}>
        <div className={clsx(classes.root, classes.rootEditing, className)} style={{ visibility }}>
          <FilledInput
            placeholder={t('features.status.placeholder')}
            autoFocus
            onFocus={handleFocusSelectAll}
            className={classes.input}
            startAdornment={
              <InputAdornment position="start">
                <IconButton size="small" className={classes.emoji} {...emojiButtonProps}>
                  {emoji ? <CurrentEmojiButtonContent emoji={emoji} /> : <EmojiIcon fontSize="inherit" />}
                </IconButton>
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label={t('features.status.altClearButton')}
                  onClick={() => inputProps.onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
                  edge="end"
                  size="small"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            }
            {...inputProps}
          />
          <Menu {...emojiMenuProps}>
            <Picker native title={t('features.status.emojiTitle')} onSelect={(dat) => onEmojiChange(dat.id!)} />
          </Menu>
        </div>
      </ClickAwayListener>
    );
  }

  const displayedStatus = (status && (isStatusExpanded ? status : '...')) || null;

  const statusContent = (
    <>
      <div className={classes.emoji}>
        {!!status || !!emoji ? (
          <Emoji native emoji={emoji || 'speech_balloon'} size={16} />
        ) : (
          <EmojiIcon fontSize="inherit" />
        )}
      </div>
      <SizeTransition transitionKey={displayedStatus}>
        {!!displayedStatus ? <StatusDisplay>{displayedStatus}</StatusDisplay> : null}
      </SizeTransition>
    </>
  );

  if (!isLocal) {
    return (
      <div className={clsx(classes.root, className)} style={{ visibility }}>
        {statusContent}
      </div>
    );
  }

  return (
    <ButtonBase className={clsx(classes.root, className)} onClick={open} style={{ visibility }}>
      {statusContent}
    </ButtonBase>
  );
};

const useStatusDisplayStyles = makeStyles({
  root: {
    paddingLeft: 8,
    maxWidth: 200,
    textAlign: 'left',
    display: 'block',
    width: 'max-content',
    maxHeight: '2.5em',
    textOverflow: 'ellipsis',
  },
});
const StatusDisplay = ({ children }: { children: string }) => {
  const classes = useStatusDisplayStyles();
  return (
    <Typography variant="body2" className={classes.root}>
      {children}
    </Typography>
  );
};

const CurrentEmojiButtonContent = ({ emoji }: { emoji: EmojiData | string }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const onHover = () => setIsHovered(true);
  const onUnHover = () => setIsHovered(false);

  const contentProps = {
    onPointerEnter: onHover,
    onFocus: onHover,
    onPointerLeave: onUnHover,
    onBlur: onUnHover,
  };

  return (
    <div {...contentProps}>
      {isHovered ? <CloseIcon fontSize="inherit" /> : <Emoji emoji={emoji} size={16} native />}
    </div>
  );
};

function useStatusEditing({
  currentStatus,
  currentEmoji,
  isLocal,
}: {
  currentStatus: string | null;
  currentEmoji: string | EmojiData | null;
  isLocal: boolean;
}) {
  // toggles editor vs. view mode
  const [editing, setEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(currentStatus || '');
  // also controls menu open state
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    setInputValue(currentStatus || '');
  }, [currentStatus]);

  const updateSelf = useRoomStore((room) => room.api.updateSelf);

  // whenever we close the status editor, save the changes
  const close = () => {
    setEditing(false);
    // commit the text status update
    updateSelf({
      statusText: inputValue,
    });
  };

  // don't allow editing for remote users
  const open = () => {
    if (isLocal) {
      // need to delay til next frame so that the click action doesn't
      // immediately close the editor
      setImmediate(() => {
        setEditing(true);
      });
    }
  };

  return {
    editing,
    close,
    open,
    inputProps: {
      value: inputValue,
      onChange: (ev: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(ev.target.value);
      },
      onKeyDown: (ev: React.KeyboardEvent<HTMLInputElement>) => {
        if (ev.key === 'Tab' || ev.key === 'Enter') {
          close();
        }
      },
    },
    emojiButtonProps: {
      onClick: (ev: React.MouseEvent<HTMLElement>) => {
        if (currentEmoji) {
          updateSelf({ emoji: null });
        } else {
          // open emoji menu
          setAnchorEl(ev.target as any);
        }
      },
    },
    emojiMenuProps: {
      anchorEl,
      open: !!anchorEl,
      onClose: () => setAnchorEl(null),
    },
    onEmojiChange: (e: string) => {
      updateSelf({ emoji: e });
      setAnchorEl(null);
    },
  };
}
