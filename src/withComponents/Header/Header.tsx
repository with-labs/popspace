import React from 'react';
import clsx from 'clsx';
import styles from './Header.module.css';

import { ReactComponent as WithLogo } from '../../images/logo/medium.svg';

interface IHeaderProps {}

export const Header: React.FC<IHeaderProps> = (props) => {
  return (
    <header className={clsx(styles.header, 'u-flex u-flexAlignItemsCenter')}>
      <WithLogo />
    </header>
  );
};
