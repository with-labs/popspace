// TODO: staged for removal after reworking circle rework
import React from 'react';
import clsx from 'clsx';

import Tooltip from '@material-ui/core/Tooltip';

import { ReactComponent as AudioOn } from '../../images/icons/sound_on.svg';
import { ReactComponent as AudioOff } from '../../images/icons/sound_off.svg';

import useLocalAudioToggle from '../../hooks/useLocalAudioToggle/useLocalAudioToggle';

import styles from './AudioToggle.module.css';

interface IAudioToggleProps {
  border?: boolean;
  className?: string;
}
export const AudioToggle: React.FC<IAudioToggleProps> = ({ border = true, className }) => {
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();

  return (
    <Tooltip
      title={isAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}
      placement="bottom"
      PopperProps={{ disablePortal: true }}
    >
      <div
        className={clsx(
          'u-cursorPointer u-flexAlignItemsCenter u-flexJustifyCenter',
          styles.toggleButtonBackdrop,
          {
            [styles['toggleButtonBackdrop-border']]: border,
          },
          className
        )}
      >
        <div
          className={clsx('u-flex u-flexJustifyCenter u-flexAlignItemsCenter', styles.toggleButton, {
            [styles.toggleButtonOn]: isAudioEnabled,
          })}
          onClick={toggleAudioEnabled}
          data-cy-audio-toggle
        >
          {isAudioEnabled ? <AudioOn /> : <AudioOff />}
        </div>
      </div>
    </Tooltip>
  );
};
