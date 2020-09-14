import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './Signin.module.css';
import Api from '../../utils/api';

import { Header } from '../../withComponents/Header/Header';

interface ISigninProps {}

export const Signin: React.FC<ISigninProps> = (props) => {
  const onFormSubmit = () => {};
  const handleLinkRequest = () => {};

  return (
    <main>
      <Header />
      <div className={clsx(styles.contentPadding, 'u-flex u-sm-flexCol u-md-flexRow')}>
        <div className={clsx(styles.contentArea, 'u-sm-flex u-size1of2')}>
          <div className="u-fontH1">Sign in</div>
          <form></form>
        </div>
        <div className={clsx(styles.imageArea, 'u-sm-flex u-size1of2')}>test 2</div>
      </div>
    </main>
  );
};
