import React, { useState } from 'react';
import checkEmailImg from '../../images/illustrations/check_your_email.jpg';
import checkEmailMobileImg from '../../images/illustrations/check_your_email_responsive.jpg';
import { toast } from 'react-hot-toast';
import { Button, makeStyles, Typography } from '@material-ui/core';
import Api from '../../utils/api';
import { isEmailValid } from '../../utils/CheckEmail';
import { useTranslation, Trans } from 'react-i18next';
import { FormPage } from '../../Layouts/formPage/FormPage';
import { FormPageContent } from '../../Layouts/formPage/FormPageContent';
import { FormPageImage } from '../../Layouts/formPage/FormPageImage';
import { FormPageTitle } from '../../Layouts/formPage/FormPageTitle';

interface IConfirmationViewProps {
  email: string;
}

const useStyles = makeStyles((theme) => ({
  error: {
    marginTop: theme.spacing(2),
    color: theme.palette.error.dark,
  },
  buttonLink: {
    background: 'none',
    border: 'none',
    padding: 0,
    color: theme.palette.brandColors.ink.regular,
  },
}));

export const ConfirmationView: React.FC<IConfirmationViewProps> = (props) => {
  const classes = useStyles();
  const { email } = props;
  const { t } = useTranslation();

  const [error, setError] = useState('');

  // TODO: finialize how the error state looks on this page
  const handleResendLink = async () => {
    // check if the email is valid or not
    const isValid = isEmailValid(email);

    if (isValid) {
      // TODO: fix typing
      const loginRequest: any = await Api.requestLoginOtp(email);
      if (loginRequest.success) {
        // we have sent off the magic link to the user,
        // clear any error
        setError('');
        toast.success(t('pages.confirmationView.snackSuccessMsg') as string);
      } else {
        // we have an error
        // TODO: update this once the error messaging from the backend is standarized
        setError(loginRequest.message);
      }
    } else {
      toast.error(t('pages.confirmationView.snackFailMsg') as string);
      setError(t('error.messages.invalidEmail'));
    }
  };

  const test = (
    <button className={classes.buttonLink} onClick={handleResendLink}>
      <Typography variant="body1">request a new link</Typography>
    </button>
  );

  return (
    <FormPage>
      <FormPageContent>
        <FormPageTitle>{t('pages.confirmationView.title')}</FormPageTitle>
        <Typography variant="body1">
          {/* the child of the trans component maps the components to our i18n string and will serve as fallback as well */}
          <Trans i18nKey="pages.confirmationView.bodyText" values={{ email: email, test: test }}>
            We sent a magic link to {{ email }}
            Click on the link in the email and you will be automatically logged in. If you didn’t receive the email, you
            can
            <Button
              className={classes.buttonLink}
              onClick={handleResendLink}
              fullWidth={false}
              style={{ backgroundColor: 'transparent' }}
            >
              request a new link
            </Button>
            . Don't forget to check your spam folder!
          </Trans>
        </Typography>
        <div className={classes.error}>{error}</div>
      </FormPageContent>
      <FormPageImage src={checkEmailImg} mobileSrc={checkEmailMobileImg} />
    </FormPage>
  );
};
