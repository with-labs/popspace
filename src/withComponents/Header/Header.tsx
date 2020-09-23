import React from 'react';
import clsx from 'clsx';
import { Button, ButtonTypes } from '../Button/Button';
import styles from './Header.module.css';

import { ReactComponent as WithLogo } from '../../images/logo/medium.svg';

interface IHeaderProps {
  text?: string;
  onSignInHandler?: () => void;
  onSignOutHandler?: () => void;
  isFullLength?: boolean;
}

export const Header: React.FC<IHeaderProps> = (props) => {
  const { text, onSignInHandler, onSignOutHandler, isFullLength = false } = props;

  const loginButton = onSignInHandler ? (
    <Button
      buttonText="Sign in"
      type={ButtonTypes.BUTTON}
      onClickHandler={onSignInHandler}
      ariaLabelText="Sign in button"
    />
  ) : null;

  const logoutButton = onSignOutHandler ? (
    <Button
      buttonText="Sign out"
      type={ButtonTypes.BUTTON}
      onClickHandler={onSignOutHandler}
      ariaLabelText="Sign out button"
    />
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
