import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import Tooltip from '@material-ui/core/Tooltip';

import styles from './ToggleButton.module.css';

import { toggleBtnTransition } from './ToggleButton.animation';

interface IRenderProps {
  isActive?: boolean;
  activeClassNames?: string;
  inactiveClassNames?: string;
}

interface IToggleButtonProps {
  onToggle: () => void;
  isActive?: boolean;
  hoverText: string;
  classNames?: string;
  children(props: IRenderProps): JSX.Element;
}

export const ToggleButton: React.FC<IToggleButtonProps> = ({
  onToggle,
  isActive = false,
  hoverText,
  classNames,
  children,
}) => {
  return (
    <Tooltip title={hoverText} placement="bottom">
      <div
        className={clsx(
          styles.toggleBtnContainer,
          'u-flex u-cursorPointer',
          `${isActive ? 'u-flexJustifyEnd' : 'u-flexJustifyStart'}`,
          isActive ? styles.isActive : styles.isInactive,
          classNames
        )}
        onClick={() => onToggle()}
      >
        <motion.div
          className={clsx(styles.toggleBtn, 'u-flex u-flexAlignItemsCenter u-flexJustifyCenter')}
          transition={toggleBtnTransition}
        >
          {children({ isActive, activeClassNames: styles.iconActive, inactiveClassNames: styles.iconInactive })}
        </motion.div>
      </div>
    </Tooltip>
  );
};
