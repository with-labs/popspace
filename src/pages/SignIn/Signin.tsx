import React, { useState } from 'react';
import { TwoColLayout } from '../../Layouts/TwoColLayout/TwoColLayout';
import { Column } from '../../Layouts/TwoColLayout/Column/Column';
import { Page } from '../../Layouts/Page/Page';
import { Header } from '../../components/Header/Header';
import { ConfirmationView } from './ConfirmationView';
import { isEmailValid } from '../../utils/CheckEmail';
import Api from '../../utils/api';
import { Button, TextField, makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { PanelImage } from '../../Layouts/PanelImage/PanelImage';
import { PanelContainer } from '../../Layouts/PanelContainer/PanelContainer';

import signinImg from '../../images/SignIn.png';

interface ISigninProps {}

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(5),
  },
  emailInput: {
    marginBottom: theme.spacing(5),
  },
}));

export const Signin: React.FC<ISigninProps> = (props) => {
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { t } = useTranslation();

  const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // clear any errors we have
    setEmailError('');

    const cleanEmail = email.trim();

    // check if the email is valid or not
    const isValid = isEmailValid(cleanEmail);

    if (isValid) {
      // TODO: fix typing
      const loginRequest: any = await Api.requestLoginOtp(cleanEmail);
      if (loginRequest.success) {
        // we have sent off the magic link to the user, so render success page
        setShowConfirmation(true);
      } else {
        // we have an error
        // TODO: update this once the error messaging from the backend is standarized
        setEmailError(loginRequest.message);
      }
    } else {
      setEmailError(t('error.messages.provideValidEmail'));
    }
  };

  return (
    <Page>
      <Header />
      {showConfirmation ? (
        <ConfirmationView email={email} />
      ) : (
        <TwoColLayout>
          <Column centerContent={true} useColMargin={true}>
            <PanelContainer>
              <Typography variant="h2" className={classes.title}>
                {t('pages.signin.title')}
              </Typography>
              <form onSubmit={onFormSubmit}>
                <TextField
                  id="SignIn-email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t('pages.signin.email.placeHolder')}
                  label={t('pages.signin.email.label')}
                  className={classes.emailInput}
                  error={!!emailError}
                  helperText={emailError}
                  margin="normal"
                />
                <Button type="submit" disabled={!email.length}>
                  {t('pages.signin.submitButtonText')}
                </Button>
              </form>
            </PanelContainer>
          </Column>
          <Column centerContent={true} hide="sm">
            <PanelImage src={signinImg} altTextKey="pages.signin.imgAltText" />
          </Column>
        </TwoColLayout>
      )}
    </Page>
  );
};
