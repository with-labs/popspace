import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import Tooltip from '@material-ui/core/Tooltip';

import { trayItemHover, trayItemClick } from './DockItem.animation';

import styles from './DockItem.module.css';

interface IDockItem {
  imgSrc?: string;
  imgAltText?: string;
  onClickHandler?: () => void;
  hoverText: string;
  classNames?: string;
  backgoundImage?: string;
}

export const DockItem: React.FC<IDockItem> = ({
  imgSrc,
  imgAltText,
  onClickHandler = () => {},
  hoverText,
  classNames,
  backgoundImage,
}) => {
  const itemBtnContent = imgSrc ? (
    <img className={styles.img} src={imgSrc} alt={imgAltText} />
  ) : (
    <div className={styles.backgroundImage} style={{ backgroundImage: backgoundImage }} />
  );

  return (
    <Tooltip title={hoverText} placement="bottom" PopperProps={{ disablePortal: true }}>
      <motion.div
        className={clsx(styles.DockItem, classNames)}
        whileHover={trayItemHover}
        whileTap={trayItemClick}
        onClick={onClickHandler}
      >
        {itemBtnContent}
      </motion.div>
    </Tooltip>
  );
};
