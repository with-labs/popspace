import * as React from 'react';
import { ToggleButton } from '@material-ui/lab';
import { CameraOnIcon } from '../../../components/icons/CameraOnIcon';
import { CameraOffIcon } from '../../../components/icons/CameraOffIcon';
import useLocalVideoToggle from '../../../hooks/localMediaToggles/useLocalVideoToggle';
import { useHotkeys } from 'react-hotkeys-hook';
import { Tooltip, IconButton } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { KeyShortcut } from '../../../constants/keyShortcuts';
import { KeyShortcutText } from '../../../components/KeyShortcutText/KeyShortcutText';
import { CameraDeviceMenu } from './CameraDeviceMenu';
import { DropdownIcon } from '../../../components/icons/DropdownIcon';

export const CameraToggle = (props: { className?: string }) => {
  const { t } = useTranslation();
  const [isVideoOn, toggleVideoOn, busy] = useLocalVideoToggle();

  useHotkeys(
    KeyShortcut.ToggleVideo,
    (ev) => {
      ev.preventDefault();
      toggleVideoOn();
    },
    [toggleVideoOn]
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
            <KeyShortcutText>{KeyShortcut.ToggleVideo}</KeyShortcutText> {t('features.mediaControls.videoToggle')}
          </>
        }
      >
        <div onContextMenu={handleContextMenu}>
          <ToggleButton value="video" selected={isVideoOn} onChange={toggleVideoOn} disabled={busy} {...props}>
            {isVideoOn ? <CameraOnIcon fontSize="default" /> : <CameraOffIcon fontSize="default" />}
          </ToggleButton>
        </div>
      </Tooltip>
      <IconButton size="small" onClick={(ev) => setMenuAnchor(ev.currentTarget)}>
        <DropdownIcon />
      </IconButton>
      <CameraDeviceMenu open={!!menuAnchor} anchorEl={menuAnchor} onClose={() => setMenuAnchor(null)} />
    </>
  );
};
