import React from 'react';
import clsx from 'clsx';
import { TwoColLayout } from '../../Layouts/TwoColLayout/TwoColLayout';
import checkEmailImg from '../../images/CheckEmail.png';
import styles from './Signin.module.css';

interface IConfirmationViewProps {
  email: string;
}

export const ConfirmationView: React.FC<IConfirmationViewProps> = (props) => {
  const { email } = props;

  const handleResendLink = () => {};

  const confirmation = (
    <div className={styles.container}>
      <div className={clsx(styles.title, 'u-fontH1')}>Check your email</div>
      <div className="u-fontP1">
        We sent a magic link to {email}
        <br />
        <br />
        Click on the link in the email and you will be automatically logged in.
        <br />
        <br />
        If you didn’t receive the email, you can{' '}
        <button className={clsx(styles.buttonLink, 'u-fontP1 u-fontBold')} onClick={handleResendLink}>
          request a new link
        </button>
        . Don't forget to check your spam folder!
      </div>
    </div>
  );

  return (
    <TwoColLayout
      left={confirmation}
      right={
        <div className={styles.imageContainer}>
          <img className={styles.image} src={checkEmailImg} alt="Check email" />
        </div>
      }
      leftColClassNames="u-flexJustifyCenter u-flexAlignItemsCenter"
      rightColClassNames="u-flexJustifyCenter u-flexAlignItemsCenter u-sm-displayNone"
    />
  );
};
