import * as React from 'react';
import { ToggleButton } from '@material-ui/lab';
import { MicOnIcon } from '@components/icons/MicOnIcon';
import { MicOffIcon } from '@components/icons/MicOffIcon';
import { useHotkeys } from 'react-hotkeys-hook';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { KeyShortcut } from '@constants/keyShortcuts';
import { KeyShortcutText } from '@components/KeyShortcutText/KeyShortcutText';
import { MicDeviceMenu } from './MicDeviceMenu';
import { SmallMenuButton } from './SmallMenuButton';
import { ResponsiveTooltip } from '@components/ResponsiveTooltip/ResponsiveTooltip';
import { EventNames } from '@analytics/constants';
import { useAnalytics, IncludeData } from '@hooks/useAnalytics/useAnalytics';
import client from '@api/client';
import { useAVSources } from '@hooks/useAVSources/useAVSources';

const useStyles = makeStyles((theme) => ({
  text: {
    color: theme.palette.brandColors.ink.regular,
    paddingLeft: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}));

export interface IMicToggleProps {
  isLocal?: boolean;
  className?: string;
  isMicOn: boolean;
  doMicToggle: () => Promise<void>;
  busy: boolean;
  handleMicOn?: () => void;
}

export const MicToggle = (props: IMicToggleProps) => {
  const { isLocal, className, isMicOn, doMicToggle, handleMicOn, busy, ...otherProps } = props;
  const classes = useStyles();
  const { t } = useTranslation();
  const { trackEvent } = useAnalytics([IncludeData.roomId]);

  const toggleMicOn = React.useCallback(() => {
    if (handleMicOn && !isMicOn) {
      handleMicOn();
    }

    trackEvent(EventNames.TOGGLE_MIC, {
      isOn: !isMicOn,
      timestamp: new Date().getTime(),
    });

    client.socket.send({
      kind: 'updateMicState',
      payload: {
        isOn: !isMicOn,
        timestamp: new Date().getTime(),
      },
    });

    doMicToggle();
  }, [doMicToggle, handleMicOn, isMicOn, trackEvent]);

  useHotkeys(
    KeyShortcut.ToggleMute,
    (ev) => {
      ev.preventDefault();
      toggleMicOn();
    },
    [toggleMicOn]
  );

  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(null);
  const handleContextMenu = React.useCallback((ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault();
    setMenuAnchor(ev.currentTarget);
  }, []);

  // only show the list if we have access to devices (and their IDs)
  const { mics } = useAVSources();
  const showMicsList = mics?.every((device) => device.deviceId && device.label);

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
            disabled={busy}
            {...otherProps}
            className={className}
          >
            {isMicOn ? <MicOnIcon fontSize="default" /> : <MicOffIcon fontSize="default" color="error" />}
            <span className={classes.text}>{t('features.mediaControls.audioTitle')}</span>
          </ToggleButton>
        </div>
      </ResponsiveTooltip>
      {showMicsList && (
        <>
          <SmallMenuButton onClick={(ev) => setMenuAnchor(ev.currentTarget)} />
          <MicDeviceMenu open={!!menuAnchor} anchorEl={menuAnchor} onClose={() => setMenuAnchor(null)} />
        </>
      )}
    </>
  );
};
