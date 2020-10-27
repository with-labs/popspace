import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './SharedScreen.module.css';
import { shadeVariants, ExpandTransition } from './SharedScreenModal-animation';

import { ReactComponent as CloseBtn } from './images/close.svg';
import { ReactComponent as CloseBtnHover } from './images/close_hover.svg';
import { ReactComponent as CloseBtnPressed } from './images/close_pressed.svg';

interface SharedScreenModalProps {
  close: () => void;
  children: React.ReactNode;
}

enum ButtonStatus {
  inactive = 'inactive',
  hover = 'hover',
  pressed = 'pressed',
}

export const SharedScreenModal: React.FC<SharedScreenModalProps> = ({ close, children }) => {
  const [btnStatus, setBtnStatus] = useState(ButtonStatus.inactive);

  const closeBtnContainer = (
    <div
      className={`u-positionAbsolute u-layerControlsDelta ${styles.closeButton}`}
      onMouseEnter={() => setBtnStatus(ButtonStatus.hover)}
      onMouseLeave={() => setBtnStatus(ButtonStatus.inactive)}
      onClick={() => {
        setBtnStatus(ButtonStatus.pressed);
        setBtnStatus(ButtonStatus.inactive);
        close();
      }}
    >
      {btnStatus === ButtonStatus.inactive && <CloseBtn />}
      {btnStatus === ButtonStatus.hover && <CloseBtnHover />}
      {btnStatus === ButtonStatus.pressed && <CloseBtnPressed />}
    </div>
  );

  return (
    <motion.div initial="hidden" animate="visible" exit="hidden" transition={ExpandTransition}>
      <motion.div
        variants={shadeVariants}
        transition={{ duration: 0.2 }}
        className={`u-layerControlsBeta ${styles.modalShade}`}
      />
      <motion.div className={`u-layerControlsGamma ${styles.modalContainer}`}>
        {closeBtnContainer}
        <motion.div transition={ExpandTransition} className={`${styles.modalContent}`}>
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
