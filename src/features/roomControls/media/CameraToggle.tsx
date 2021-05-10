import * as React from 'react';
import { ToggleButton } from '@material-ui/lab';
import { CameraOnIcon } from '../../../components/icons/CameraOnIcon';
import { CameraOffIcon } from '../../../components/icons/CameraOffIcon';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { KeyShortcut } from '../../../constants/keyShortcuts';
import { KeyShortcutText } from '../../../components/KeyShortcutText/KeyShortcutText';
import { CameraDeviceMenu } from './CameraDeviceMenu';
import { SmallMenuButton } from './SmallMenuButton';
import { ResponsiveTooltip } from '../../../components/ResponsiveTooltip/ResponsiveTooltip';
import { useIsAway } from '../away/useIsAway';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { EventNames } from '../../../analytics/constants';
import { useAnalytics, IncludeData } from '../../../hooks/useAnalytics/useAnalytics';

export interface ICameraToggleProps {
  isLocal?: boolean;
  className?: string;
  isVideoOn: boolean;
  toggleVideoOn: () => Promise<void>;
  busy: boolean;
}

export const CameraToggle = (props: ICameraToggleProps) => {
  const { className, isLocal, isVideoOn, toggleVideoOn, busy, ...otherProps } = props;
  const { t } = useTranslation();
  const socket = useRoomStore((room) => room.socket);
  const { trackEvent } = useAnalytics([IncludeData.roomId]);

  const handleVideoToggle = React.useCallback(() => {
    trackEvent(EventNames.TOGGLE_VIDEO, {
      isOn: isVideoOn,
      timestamp: new Date().getTime(),
    });

    socket?.send({
      kind: 'updateVideoState',
      payload: {
        isOn: isVideoOn,
        timestamp: new Date().getTime(),
      },
    });

    toggleVideoOn();
  }, [toggleVideoOn, isVideoOn, socket, trackEvent]);

  const [isAway] = useIsAway();

  useHotkeys(
    KeyShortcut.ToggleVideo,
    (ev) => {
      if (isAway) return;

      ev.preventDefault();
      handleVideoToggle();
    },
    [toggleVideoOn, isAway, handleVideoToggle]
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
            onChange={handleVideoToggle}
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
