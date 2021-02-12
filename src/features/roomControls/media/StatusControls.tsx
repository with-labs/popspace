import React, { useRef, useState } from 'react';
import clsx from 'clsx';
import { ToggleButton } from '@material-ui/lab';
import { Tooltip, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { EmojiIcon } from '../../../components/icons/EmojiIcon';
import { SmallMenuButton } from './SmallMenuButton';
import { StatusMenu } from './StatusMenu';
import { useCurrentUserProfile } from '../../../hooks/useCurrentUserProfile/useCurrentUserProfile';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { KeyShortcutText } from '../../../components/KeyShortcutText/KeyShortcutText';
import { KeyShortcut } from '../../../constants/keyShortcuts';
import { useHotkeys } from 'react-hotkeys-hook';

import { Emoji } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import { CloseIcon } from '../../../components/icons/CloseIcon';

const useStyles = makeStyles((theme) => ({
  root: {},
  closeBg: {
    backgroundColor: theme.palette.error.light,
  },
  emojiBg: {
    backgroundColor: theme.palette.brandColors.mandarin.light,
  },
  closeBtn: {
    height: theme.spacing(3),
    width: theme.spacing(3),
  },
}));

export const StatusControls = (props: any) => {
  const { className, ...otherProps } = props;
  const classes = useStyles();
  const { t } = useTranslation();
  const toggleButtonRef = useRef<HTMLDivElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const updateSelf = useRoomStore((room) => room.api.updateSelf);

  const [isHovered, setIsHovered] = useState(false);
  const onHover = () => setIsHovered(true);
  const onUnHover = () => setIsHovered(false);

  const contentProps = {
    onPointerEnter: onHover,
    onFocus: onHover,
    onPointerLeave: onUnHover,
    onBlur: onUnHover,
  };

  const { user } = useCurrentUserProfile();
  const userInfo = useRoomStore(React.useCallback((room) => room.users[user?.id || ''], [user?.id]));
  const emoji = userInfo?.participantState.emoji;
  const statusText = userInfo?.participantState.statusText;

  const handleContextMenu = React.useCallback((ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault();
    setMenuAnchor(ev.currentTarget);
  }, []);

  const toggleStatusBtn = () => {
    if (emoji || statusText) {
      updateSelf({
        statusText: '',
        emoji: null,
      });
    } else {
      setMenuAnchor(toggleButtonRef.current);
    }
  };

  useHotkeys(
    KeyShortcut.ToggleStatus,
    (ev) => {
      ev.preventDefault();
      setMenuAnchor(toggleButtonRef.current);
    },
    [toggleStatusBtn]
  );

  return (
    <>
      <Tooltip
        title={
          <>
            <KeyShortcutText>{KeyShortcut.ToggleStatus}</KeyShortcutText> {t('features.statusControls.toolTip')}
          </>
        }
      >
        <div>
          <ToggleButton
            ref={toggleButtonRef}
            value="status"
            selected={false}
            onChange={toggleStatusBtn}
            onContextMenu={handleContextMenu}
            {...otherProps}
            className={clsx(
              emoji && isHovered && classes.closeBg,
              emoji && !isHovered && classes.emojiBg,
              !emoji && classes.root,
              className
            )}
            {...contentProps}
          >
            {emoji || statusText ? (
              isHovered ? (
                <CloseIcon fontSize="default" color="error" />
              ) : (
                <Emoji emoji={emoji ?? 'speech_balloon'} size={24} />
              )
            ) : (
              <EmojiIcon fontSize="default" />
            )}
          </ToggleButton>
        </div>
      </Tooltip>
      <SmallMenuButton onClick={() => setMenuAnchor(toggleButtonRef.current)} />
      <StatusMenu
        open={!!menuAnchor}
        anchorEl={menuAnchor}
        onClose={() => {
          setMenuAnchor(null);
          setIsHovered(false);
        }}
        status={statusText}
        emoji={emoji}
      />
    </>
  );
};
