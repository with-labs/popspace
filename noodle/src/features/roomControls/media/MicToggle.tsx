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
import client from '@api/client';
import { Analytics } from '@analytics/Analytics';
import clsx from 'clsx';
import { useMediaDevices } from '@src/media/hooks';
import { TrackType } from '@withso/pop-media-sdk';

const useStyles = makeStyles((theme) => ({
  text: {
    color: theme.palette.brandColors.ink.regular,
    paddingLeft: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  smallButtonText: {
    display: 'none',
  },
}));

export interface IMicToggleProps {
  isLocal?: boolean;
  className?: string;
  isMicOn: boolean;
  doMicToggle: () => Promise<void>;
  busy: boolean;
  handleMicOn?: () => void;
  showMicsList?: boolean;
  useSmall?: boolean;
  displayToolTip?: boolean;
}

export const MicToggle = (props: IMicToggleProps) => {
  const {
    isLocal,
    className,
    isMicOn,
    doMicToggle,
    handleMicOn,
    busy,
    showMicsList = true,
    useSmall = false,
    displayToolTip = true,
    ...otherProps
  } = props;
  const classes = useStyles();
  const { t } = useTranslation();

  const toggleMicOn = React.useCallback(() => {
    if (handleMicOn && !isMicOn) {
      handleMicOn();
    }

    const timestamp = new Date().getTime();
    Analytics.trackEvent(EventNames.TOGGLE_MIC, !isMicOn, {
      isOn: !isMicOn,
      timestamp: timestamp,
    });

    client.socket.send({
      kind: 'updateMicState',
      payload: {
        isOn: !isMicOn,
        timestamp: timestamp,
      },
    });

    doMicToggle();
  }, [doMicToggle, handleMicOn, isMicOn]);

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
  const { devices: mics, permissionState } = useMediaDevices(TrackType.Microphone);
  const hasMicsList = permissionState === 'granted';

  return (
    <>
      <ResponsiveTooltip
        title={
          <span>
            {t('features.mediaControls.micToggle')} <KeyShortcutText>{KeyShortcut.ToggleMute}</KeyShortcutText>
          </span>
        }
        disableHoverListener={!displayToolTip}
      >
        <div>
          <ToggleButton
            value="mic"
            selected={isMicOn}
            onChange={toggleMicOn}
            onContextMenu={handleContextMenu}
            disabled={busy}
            data-test-id="toggleAudio"
            {...otherProps}
            className={className}
          >
            {isMicOn ? <MicOnIcon fontSize="default" /> : <MicOffIcon fontSize="default" color="error" />}
            <span className={clsx(classes.text, { [classes.smallButtonText]: useSmall })}>
              {t('features.mediaControls.audioTitle')}
            </span>
          </ToggleButton>
        </div>
      </ResponsiveTooltip>
      {showMicsList && hasMicsList && (
        <>
          <SmallMenuButton onClick={(ev) => setMenuAnchor(ev.currentTarget)} />
          <MicDeviceMenu open={!!menuAnchor} anchorEl={menuAnchor} onClose={() => setMenuAnchor(null)} />
        </>
      )}
    </>
  );
};
