import React, { useState, useEffect } from 'react';
import { TwoColLayout } from '../../Layouts/TwoColLayout/TwoColLayout';
import { Column } from '../../Layouts/TwoColLayout/Column/Column';
import { Page } from '../../Layouts/Page/Page';
import { Header } from '../../components/Header/Header';
import { ConfirmationView } from './ConfirmationView';
import { isEmailValid } from '../../utils/CheckEmail';
import Api from '../../utils/api';
import { makeStyles, Typography, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { PanelImage } from '../../Layouts/PanelImage/PanelImage';
import { PanelContainer } from '../../Layouts/PanelContainer/PanelContainer';
import useQueryParams from '../../hooks/useQueryParams/useQueryParams';
import { useHistory } from 'react-router-dom';
import { RouteNames } from '../../constants/RouteNames';
import { ErrorCodes } from '../../constants/ErrorCodes';
import { DialogModal, DialogMessage } from '../../components/DialogModal/DialogModal';
import { getErrorDialogText } from '../../utils/ErrorMessage';
import { useCurrentUserProfile } from '../../hooks/useCurrentUserProfile/useCurrentUserProfile';
import { TFunction } from 'i18next';
import { Form, Formik, FormikHelpers } from 'formik';
import { FormikTextField } from '../../components/fieldBindings/FormikTextField';
import { FormikSubmitButton } from '../../components/fieldBindings/FormikSubmitButton';

import signinImg from '../../images/SignIn.png';

export type SignInFormData = {
  email: string;
};

const EMPTY_VALUES: SignInFormData = {
  email: '',
};

function validateEmail(email: string, translate: TFunction) {
  if (!isEmailValid(email)) {
    return translate('error.messages.provideValidEmail');
  }
}

interface ISigninProps {}

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(5),
  },
}));

export const Signin: React.FC<ISigninProps> = (props) => {
  const history = useHistory();
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { t } = useTranslation();
  const { user, isLoading } = useCurrentUserProfile();

  // get the query params, if any
  const query = useQueryParams();
  const errorInfo = query.get('e');

  const [errorMsg] = useState<DialogMessage | null>(getErrorDialogText(errorInfo as ErrorCodes, t));

  useEffect(() => {
    // if the errorInfo is not null and the user is already logged in
    // then we redirect to the dash if the user tries to hit the
    if (!errorInfo && user) {
      history.push(RouteNames.ROOT);
    }
  }, [history, errorInfo, user]);

  const onSubmit = async (data: SignInFormData, actions: FormikHelpers<SignInFormData>) => {
    try {
      const cleanEmail = data.email.trim();
      // TODO: fix typing
      const loginRequest: any = await Api.requestLoginOtp(cleanEmail);
      if (loginRequest.success) {
        setEmail(cleanEmail);
        // we have sent off the magic link to the user, so render success page
        setShowConfirmation(true);
      } else {
        // we have an error
        actions.setFieldError('email', loginRequest.message);
      }
    } catch (e) {
      actions.setFieldError('email', e.message);
    }
  };

  const clearUrlError = () => {
    if (errorInfo) {
      // remove the error from the query string when the user has cleared
      // the error
      history.replace(RouteNames.SIGN_IN);
    }
  };

  return (
    <Page isLoading={isLoading}>
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
              <Formik initialValues={EMPTY_VALUES} onSubmit={onSubmit} validateOnMount>
                <Form>
                  <FormikTextField
                    id="SignIn-email"
                    name="email"
                    placeholder={t('pages.signin.email.placeHolder')}
                    label={t('pages.signin.email.label')}
                    validate={(inviteeEmail) => validateEmail(inviteeEmail, t)}
                    fullWidth
                  />
                  <Box mt={5}>
                    <FormikSubmitButton>{t('pages.signin.submitButtonText')}</FormikSubmitButton>
                  </Box>
                </Form>
              </Formik>
            </PanelContainer>
          </Column>
          <Column centerContent={true} hide="sm">
            <PanelImage src={signinImg} altTextKey="pages.signin.imgAltText" />
          </Column>
        </TwoColLayout>
      )}
      <DialogModal message={errorMsg} onClose={clearUrlError} />
    </Page>
  );
};
