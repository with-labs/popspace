import * as React from 'react';
import { ToggleButton } from '@material-ui/lab';
import useLocalAudioToggle from '../../../providers/media/hooks/useLocalAudioToggle';
import { MicOnIcon } from '../../../components/icons/MicOnIcon';
import { MicOffIcon } from '../../../components/icons/MicOffIcon';
import { useHotkeys } from 'react-hotkeys-hook';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { KeyShortcut } from '../../../constants/keyShortcuts';
import { KeyShortcutText } from '../../../components/KeyShortcutText/KeyShortcutText';
import { MicDeviceMenu } from './MicDeviceMenu';
import { SmallMenuButton } from './SmallMenuButton';
import clsx from 'clsx';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { logger } from '../../../utils/logger';
import { useRemoteControl } from '../../../hooks/useRemoteControl/useRemoteControl';
import { MIC_TRACK_NAME } from '../../../constants/User';
import { ResponsiveTooltip } from '../../../components/ResponsiveTooltip/ResponsiveTooltip';
import { useIsAway } from '../away/useIsAway';
import { useRoomStatus } from '../../../providers/twilio/hooks/useRoomStatus';
import { TwilioStatus } from '../../../providers/twilio/TwilioProvider';

const useStyles = makeStyles((theme) => ({
  root: {},
}));

export interface IMicToggleProps {
  isLocal?: boolean;
  className?: string;
}

export const MicToggle = (props: IMicToggleProps) => {
  const { isLocal, className, ...otherProps } = props;
  const classes = useStyles();
  const { t } = useTranslation();
  const [isMicOn, doMicToggle, busy] = useLocalAudioToggle(isLocal);
  const { muteSession } = useRemoteControl();
  const socket = useRoomStore((room) => room.socket);

  const toggleMicOn = React.useCallback(() => {
    if (!isMicOn) {
      // the action of turning the microphone on makes this the primary
      // session - mute all other sessions.
      const roomState = useRoomStore.getState();
      const currentSessionId = roomState.sessionId;
      if (!currentSessionId) {
        // this shouldn't really happen
        logger.error(`Mic was turned on, but there's no active session`);
      } else {
        const currentUserId = roomState.sessionLookup[currentSessionId];
        const allSessionIds = roomState.users[currentUserId].sessionIds;
        allSessionIds.forEach((id) => muteSession(id, MIC_TRACK_NAME));
      }
    }

    socket?.send({
      kind: 'updateMicState',
      payload: {
        isOn: isMicOn,
        timestamp: new Date().getTime(),
      },
    });

    doMicToggle();
  }, [doMicToggle, isMicOn, muteSession, socket]);

  const [isAway] = useIsAway();

  useHotkeys(
    KeyShortcut.ToggleMute,
    (ev) => {
      if (isAway) return;

      ev.preventDefault();
      toggleMicOn();
    },
    [toggleMicOn, isAway]
  );

  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(null);
  const handleContextMenu = React.useCallback((ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault();
    setMenuAnchor(ev.currentTarget);
  }, []);

  const roomStatus = useRoomStatus();

  return (
    <>
      <ResponsiveTooltip
        title={
          <>
            {t('features.mediaControls.micToggle')} <KeyShortcutText>{KeyShortcut.ToggleMute}</KeyShortcutText>
          </>
        }
      >
        <div>
          <ToggleButton
            value="mic"
            selected={isMicOn}
            onChange={toggleMicOn}
            onContextMenu={handleContextMenu}
            disabled={busy || roomStatus !== TwilioStatus.Connected}
            {...otherProps}
            className={clsx(classes.root, className)}
          >
            {isMicOn ? <MicOnIcon fontSize="default" /> : <MicOffIcon fontSize="default" color="error" />}
          </ToggleButton>
        </div>
      </ResponsiveTooltip>
      <SmallMenuButton onClick={(ev) => setMenuAnchor(ev.currentTarget)} />
      <MicDeviceMenu open={!!menuAnchor} anchorEl={menuAnchor} onClose={() => setMenuAnchor(null)} />
    </>
  );
};
