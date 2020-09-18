import React from 'react';
import clsx from 'clsx';
import styles from './Header.module.css';

import { ReactComponent as WithLogo } from '../../images/logo/medium.svg';

interface IHeaderProps {
  text?: string;
  displayLogin?: boolean;
}

export const Header: React.FC<IHeaderProps> = (props) => {
  const { displayLogin, text } = props;
  const loginButton = displayLogin ? (
    <div className="u-flex u-flexRow">
      <div></div>
    </div>
  ) : null;
  return (
    <header className={clsx(styles.header, 'u-flex u-flexAlignItemsCenter')}>
      <WithLogo />
      {text}
      {loginButton}
    </header>
  );
};
