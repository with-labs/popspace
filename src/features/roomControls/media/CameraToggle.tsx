import * as React from 'react';
import { ToggleButton } from '@material-ui/lab';
import { CameraOnIcon } from '../../../components/icons/CameraOnIcon';
import { CameraOffIcon } from '../../../components/icons/CameraOffIcon';
import useLocalVideoToggle from '../../../hooks/localMediaToggles/useLocalVideoToggle';
import { useHotkeys } from 'react-hotkeys-hook';
import { Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { KeyShortcut } from '../../../constants/keyShortcuts';
import { KeyShortcutText } from '../../../components/KeyShortcutText/KeyShortcutText';

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

  return (
    <Tooltip
      title={
        <>
          <KeyShortcutText>{KeyShortcut.ToggleVideo}</KeyShortcutText> {t('features.mediaControls.videoToggle')}
        </>
      }
    >
      <ToggleButton value="video" selected={isVideoOn} onChange={toggleVideoOn} disabled={busy} {...props}>
        {isVideoOn ? <CameraOnIcon fontSize="default" /> : <CameraOffIcon fontSize="default" />}
      </ToggleButton>
    </Tooltip>
  );
};
