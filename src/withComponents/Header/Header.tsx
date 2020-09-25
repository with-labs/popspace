import React from 'react';
import clsx from 'clsx';
import styles from './Header.module.css';

import { ReactComponent as WithLogo } from '../../images/logo/medium.svg';
import { Button } from '@material-ui/core';

interface IHeaderProps {
  text?: string;
  onSignInHandler?: () => void;
  onSignOutHandler?: () => void;
  isFullLength?: boolean;
}

export const Header: React.FC<IHeaderProps> = (props) => {
  const { text, onSignInHandler, onSignOutHandler, isFullLength = false } = props;

  const loginButton = onSignInHandler ? (
    <Button type="button" onClick={onSignInHandler}>
      Sign in
    </Button>
  ) : null;

  const logoutButton = onSignOutHandler ? (
    <Button type="button" onClick={onSignOutHandler}>
      Sign out
    </Button>
  ) : null;

  const headerStyles = isFullLength ? styles.headerFull : styles.header;

  return (
    <header className={clsx(headerStyles, 'u-flex u-flexAlignItemsCenter')}>
      <WithLogo />
      <div className={clsx(styles.text, 'u-fontP1')}>{text}</div>
      <div className={styles.buttonContainer}>
        {loginButton}
        {logoutButton}
      </div>
    </header>
  );
};
