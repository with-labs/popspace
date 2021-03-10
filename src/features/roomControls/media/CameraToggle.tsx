import * as React from 'react';
import { ToggleButton } from '@material-ui/lab';
import { CameraOnIcon } from '../../../components/icons/CameraOnIcon';
import { CameraOffIcon } from '../../../components/icons/CameraOffIcon';
import useLocalVideoToggle from '../../../hooks/localMediaToggles/useLocalVideoToggle';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { KeyShortcut } from '../../../constants/keyShortcuts';
import { KeyShortcutText } from '../../../components/KeyShortcutText/KeyShortcutText';
import { CameraDeviceMenu } from './CameraDeviceMenu';
import { SmallMenuButton } from './SmallMenuButton';
import { ResponsiveTooltip } from '../../../components/ResponsiveTooltip/ResponsiveTooltip';

export interface ICameraToggleProps {
  isLocal?: boolean;
  className?: string;
}

export const CameraToggle = (props: ICameraToggleProps) => {
  const { className, isLocal, ...otherProps } = props;
  const { t } = useTranslation();
  const [isVideoOn, toggleVideoOn, busy] = useLocalVideoToggle(isLocal);

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
      <ResponsiveTooltip
        title={
          <>
            {t('features.mediaControls.videoToggle')} <KeyShortcutText>{KeyShortcut.ToggleVideo}</KeyShortcutText>
          </>
        }
      >
        <div onContextMenu={handleContextMenu}>
          <ToggleButton
            value="video"
            selected={isVideoOn}
            onChange={toggleVideoOn}
            disabled={busy}
            className={className}
            {...otherProps}
          >
            {isVideoOn ? <CameraOnIcon fontSize="default" /> : <CameraOffIcon fontSize="default" />}
          </ToggleButton>
        </div>
      </ResponsiveTooltip>
      <SmallMenuButton onClick={(ev) => setMenuAnchor(ev.currentTarget)} />
      <CameraDeviceMenu open={!!menuAnchor} anchorEl={menuAnchor} onClose={() => setMenuAnchor(null)} />
    </>
  );
};
