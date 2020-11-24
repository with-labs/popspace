import * as React from 'react';
import { ToggleButton } from '@material-ui/lab';
import useLocalAudioToggle from '../../../hooks/localMediaToggles/useLocalAudioToggle';
import { MicOnIcon } from '../../../components/icons/MicOnIcon';
import { MicOffIcon } from '../../../components/icons/MicOffIcon';
import { useHotkeys } from 'react-hotkeys-hook';
import { Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { KeyShortcut } from '../../../constants/keyShortcuts';
import { KeyShortcutText } from '../../../components/KeyShortcutText/KeyShortcutText';
import { MicDeviceMenu } from './MicDeviceMenu';
import { SmallMenuButton } from './SmallMenuButton';

export const MicToggle = (props: { className?: string }) => {
  const { t } = useTranslation();
  const [isMicOn, toggleMicOn, busy] = useLocalAudioToggle();

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

  return (
    <>
      <Tooltip
        title={
          <>
            <KeyShortcutText>{KeyShortcut.ToggleMute}</KeyShortcutText> {t('features.mediaControls.micToggle')}
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
            {...props}
          >
            {isMicOn ? <MicOnIcon fontSize="default" /> : <MicOffIcon fontSize="default" color="error" />}
          </ToggleButton>
        </div>
      </Tooltip>
      <SmallMenuButton onClick={(ev) => setMenuAnchor(ev.currentTarget)} />
      <MicDeviceMenu open={!!menuAnchor} anchorEl={menuAnchor} onClose={() => setMenuAnchor(null)} />
    </>
  );
};
