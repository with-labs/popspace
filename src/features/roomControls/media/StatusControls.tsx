import React, { useRef, useState } from 'react';
import clsx from 'clsx';
import { ToggleButton } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { EmojiIcon } from '../../../components/icons/EmojiIcon';
import { SmallMenuButton } from './SmallMenuButton';
import { StatusMenu } from './StatusMenu';
import { KeyShortcutText } from '../../../components/KeyShortcutText/KeyShortcutText';
import { KeyShortcut } from '../../../constants/keyShortcuts';
import { useHotkeys } from 'react-hotkeys-hook';

import { Emoji } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import { CloseIcon } from '../../../components/icons/CloseIcon';
import { useUserStatus } from '../../status/useUserStatus';
import { ResponsiveTooltip } from '../../../components/ResponsiveTooltip/ResponsiveTooltip';
import { useIsAway } from '../away/useIsAway';

export interface IStatusControlsProps {
  showMenu?: boolean;
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: 40,
  },
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

export const StatusControls = (props: IStatusControlsProps) => {
  const { className, showMenu, ...otherProps } = props;
  const classes = useStyles();
  const { t } = useTranslation();
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const onHover = () => setIsHovered(true);
  const onUnHover = () => setIsHovered(false);

  const contentProps = {
    onPointerEnter: onHover,
    onFocus: onHover,
    onPointerLeave: onUnHover,
    onBlur: onUnHover,
  };

  const {
    status: { emoji, statusText },
    set,
  } = useUserStatus();

  const handleContextMenu = React.useCallback((ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault();
    setMenuAnchor(ev.currentTarget);
  }, []);

  const toggleStatusBtn = () => {
    if (emoji || statusText) {
      set({
        statusText: '',
        emoji: null,
      });
    } else {
      setMenuAnchor(toggleButtonRef.current);
    }
  };

  const [isAway] = useIsAway();

  useHotkeys(
    KeyShortcut.ToggleStatus,
    (ev) => {
      if (isAway) return;

      ev.preventDefault();
      setMenuAnchor(toggleButtonRef.current);
    },
    [toggleStatusBtn]
  );

  return (
    <>
      <ResponsiveTooltip
        title={
          <>
            {t('features.statusControls.toolTip')} <KeyShortcutText>{KeyShortcut.ToggleStatus}</KeyShortcutText>
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
              classes.root,
              className
            )}
            {...contentProps}
          >
            {emoji || statusText ? (
              isHovered ? (
                <CloseIcon fontSize="default" color="error" />
              ) : (
                <Emoji native emoji={emoji ?? 'speech_balloon'} size={18} />
              )
            ) : (
              <EmojiIcon fontSize="default" />
            )}
          </ToggleButton>
        </div>
      </ResponsiveTooltip>
      {showMenu && <SmallMenuButton onClick={() => setMenuAnchor(toggleButtonRef.current)} />}
      <StatusMenu
        open={!!menuAnchor}
        anchorEl={menuAnchor}
        onClose={() => {
          setMenuAnchor(null);
          setIsHovered(false);
        }}
        marginThreshold={6}
      />
    </>
  );
};
