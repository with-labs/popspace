import React, { useState } from 'react';
import styles from './Signup.module.css';
import Api from '../../utils/api';
import { Header } from '../../withComponents/Header/Header';

interface ISignupProps {}

export const Signup: React.FC<ISignupProps> = (props) => {
  const onFormSubmit = () => {};

  return (
    <main>
      <Header />
      <div className="u-flex u-sm-flexCol u-md-flexRow">
        <div className="u-sm-flex u-md-size1of2">
          <div className="u-fontH1">Sign in</div>
          <form></form>
        </div>
        <div className="u-sm-flex u-md-size1of2">test 2</div>
      </div>
    </main>
  );
};
