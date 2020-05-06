import React from 'react';
import clsx from 'clsx';

import Tooltip from '@material-ui/core/Tooltip';

import { ReactComponent as CameraOn } from '../../images/icons/camera_on.svg';
import { ReactComponent as CameraOff } from '../../images/icons/camera_off.svg';

import useLocalVideoToggle from '../../hooks/useLocalVideoToggle/useLocalVideoToggle';

import styles from './VideoToggle.module.css';

interface IVideoToggleProps {
  compact?: boolean;
  border?: boolean;
}

export const VideoToggle: React.FC<IVideoToggleProps> = ({ compact = false, border = true }) => {
  const [isVideoEnabled, toggleVideoEnabled] = useLocalVideoToggle();

  return (
    <Tooltip
      title={isVideoEnabled ? 'Stop Video' : 'Start Video'}
      placement="bottom"
      PopperProps={{ disablePortal: true }}
    >
      <div
        className={clsx('u-cursorPointer u-flex', styles.toggleButtonBackdrop, {
          uflexJustifyEnd: isVideoEnabled,
          [styles['toggleButtonBackdrop-border']]: border,
        })}
        onClick={toggleVideoEnabled}
      >
        <div
          className={clsx('u-flex u-flexJustifyCenter u-flexAlignItemsCenter', styles.toggleOption, styles.camOff, {
            [styles.toggleOptionSelected]: !isVideoEnabled,
            [styles.compactOption]: isVideoEnabled && compact,
          })}
        >
          {isVideoEnabled && compact ? '•' : <CameraOff />}
        </div>
        <div
          className={clsx('u-flex u-flexJustifyCenter u-flexAlignItemsCenter', styles.toggleOption, {
            [styles.toggleOptionSelected]: isVideoEnabled,
            [styles.compactOption]: !isVideoEnabled && compact,
          })}
        >
          {!isVideoEnabled && compact ? '•' : <CameraOn />}
        </div>
      </div>
    </Tooltip>
  );
};
