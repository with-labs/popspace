import React, { useState, useEffect } from 'react';
import { ConfirmationView } from './ConfirmationView';
import { isEmailValid } from '../../utils/CheckEmail';
import Api from '../../utils/api';
import { Typography } from '@material-ui/core';
import { Trans, useTranslation } from 'react-i18next';
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
import signinImg from '../../images/illustrations/sign_in.jpg';
import signinMobileImg from '../../images/illustrations/sign_in_responsive.jpg';
import { Link } from '../../components/Link/Link';
import { useFeatureFlag } from 'flagg';
import { FormPage } from '../../Layouts/formPage/FormPage';
import { FormPageContent } from '../../Layouts/formPage/FormPageContent';
import { FormPageTitle } from '../../Layouts/formPage/FormPageTitle';
import { FormPageFields } from '../../Layouts/formPage/FormPageFields';
import { FormPageImage } from '../../Layouts/formPage/FormPageImage';

export type SignInFormData = {
  email: string;
  inviteId: string;
  inviteCode: string;
};

function validateEmail(email: string, translate: TFunction) {
  if (!isEmailValid(email)) {
    return translate('error.messages.provideValidEmail');
  }
}

interface ISigninProps {}

export const Signin: React.FC<ISigninProps> = () => {
  const { t } = useTranslation();

  const history = useHistory<{ email?: string; inviteId?: string; inviteCode?: string }>();
  const preloadedEmail = history.location.state?.email || '';

  // if there's invite information cached in history state from signin page, apply it to
  const inviteCode = history.location.state?.inviteCode || '';
  const inviteId = history.location.state?.inviteId || '';

  const [email, setEmail] = useState(preloadedEmail);

  const { user } = useCurrentUserProfile();

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
      const loginRequest: any = await Api.requestLoginOtp({
        email: cleanEmail,
        inviteCode: data.inviteCode,
        inviteId: data.inviteId,
      });
      if (loginRequest.success) {
        setEmail(cleanEmail);
        // we have sent off the magic link to the user, so render success page
        actions.setStatus({ sent: true });
      } else {
        // we have an error
        actions.setFieldError('email', loginRequest.message);
      }
    } catch (e) {
      actions.setFieldError('email', e.message);
    }
  };

  const clearUrlError = () => {
    const inviteInfo = inviteCode && inviteId ? { inviteId, inviteCode } : {};
    if (errorInfo) {
      // remove the error from the query string when the user has cleared
      // the error
      history.replace(RouteNames.SIGN_IN, { ...inviteInfo });
    }
  };

  const [hasSignup] = useFeatureFlag('signup');

  return (
    <Formik
      initialValues={{ email: preloadedEmail, inviteCode, inviteId }}
      onSubmit={onSubmit}
      validateOnBlur={false}
      initialStatus={{ sent: false }}
    >
      {({ values, status }) =>
        status.sent ? (
          <ConfirmationView email={email} />
        ) : (
          <FormPage>
            <FormPageContent>
              <FormPageTitle>{t('pages.signin.title')}</FormPageTitle>
              <Form>
                <FormPageFields>
                  <FormikTextField
                    id="SignIn-email"
                    name="email"
                    placeholder={t('pages.signin.email.placeHolder')}
                    label={t('pages.signin.email.label')}
                    validate={(inviteeEmail) => validateEmail(inviteeEmail, t)}
                    fullWidth
                    autoComplete="email"
                    autoFocus
                    margin="normal"
                    required
                  />
                </FormPageFields>
                <FormikSubmitButton>{t('pages.signin.submitButtonText')}</FormikSubmitButton>
                {hasSignup && (
                  <Typography style={{ marginTop: 16 }}>
                    <Trans as="span" i18nKey="pages.signin.signUpInstead">
                      {`No account yet? `}
                      <Link
                        to="#"
                        onClick={(ev) => {
                          ev.preventDefault();
                          history.push(RouteNames.SIGN_UP, {
                            email: values.email,
                            inviteId: values.inviteId,
                            inviteCode: values.inviteCode,
                          });
                        }}
                      >
                        {t('pages.signin.signUp')}
                      </Link>
                      .
                    </Trans>
                  </Typography>
                )}
              </Form>
            </FormPageContent>
            <FormPageImage src={signinImg} mobileSrc={signinMobileImg} />
            <DialogModal message={errorMsg} onClose={clearUrlError} />
          </FormPage>
        )
      }
    </Formik>
  );
};
