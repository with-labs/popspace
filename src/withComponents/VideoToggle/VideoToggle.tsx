import React from 'react';
import clsx from 'clsx';

import Tooltip from '@material-ui/core/Tooltip';
import { motion } from 'framer-motion';

import { ReactComponent as CameraOn } from '../../images/icons/camera_on.svg';
import { ReactComponent as CameraOff } from '../../images/icons/camera_off.svg';

import useLocalVideoToggle from '../../hooks/useLocalVideoToggle/useLocalVideoToggle';

import { videoToggleTransition, videoToggleSwitchVariants } from './VideoToggle-animation';

import styles from './VideoToggle.module.css';
interface IVideoToggleProps {
  compact?: boolean;
  border?: boolean;
}

export const VideoToggle: React.FC<IVideoToggleProps> = ({ compact = false, border = true }) => {
  const [isVideoEnabled, toggleVideoEnabled] = useLocalVideoToggle();

  return (
    <Tooltip
      title={isVideoEnabled ? 'Use Avatar' : 'Use Video'}
      placement="bottom"
      PopperProps={{ disablePortal: true }}
    >
      <motion.div
        className={clsx('u-cursorPointer u-flex u-positionRelative', styles.toggleButtonBackdrop, {
          uflexJustifyEnd: isVideoEnabled,
          [styles['toggleButtonBackdrop-border']]: border,
        })}
        onClick={toggleVideoEnabled}
        animate={isVideoEnabled ? (compact ? 'onCompact' : 'on') : 'off'}
        transition={videoToggleTransition}
      >
        <motion.div className={styles.toggleSwitch} variants={videoToggleSwitchVariants}></motion.div>
        <div
          className={clsx(
            'u-flex u-flexJustifyCenter u-flexAlignItemsCenter u-layerSurfaceBeta',
            styles.toggleOption,
            styles.camOff,
            {
              [styles.toggleOptionSelected]: !isVideoEnabled,
              [styles.compactOption]: isVideoEnabled && compact,
            }
          )}
        >
          {isVideoEnabled && compact ? '•' : <CameraOff />}
        </div>
        <div
          className={clsx(
            'u-flex u-flexJustifyCenter u-flexAlignItemsCenter u-layerSurfaceBeta ',
            styles.toggleOption,
            {
              [styles.toggleOptionSelected]: isVideoEnabled,
              [styles.compactOption]: !isVideoEnabled && compact,
            }
          )}
        >
          {!isVideoEnabled && compact ? '•' : <CameraOn />}
        </div>
      </motion.div>
    </Tooltip>
  );
};
