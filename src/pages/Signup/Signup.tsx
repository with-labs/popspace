import React, { useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Typography } from '@material-ui/core';
import Api, { ApiError } from '../../utils/api';
import img from '../../images/illustrations/welcome_to_with.jpg';
import mobileImg from '../../images/illustrations/welcome_to_with_responsive.jpg';
import { Form, Formik, FormikHelpers } from 'formik';
import { FormikTextField } from '../../components/fieldBindings/FormikTextField';
import { FormikSubmitButton } from '../../components/fieldBindings/FormikSubmitButton';
import { isEmailValid } from '../../utils/CheckEmail';
import i18n from '../../i18n';
import { useHistory } from 'react-router';
import { FormikCheckboxField } from '../../components/fieldBindings/FormikCheckboxField';
import { Links } from '../../constants/Links';
import { Link } from '../../components/Link/Link';
import { SignupComplete } from './SignupComplete';
import { RouteNames } from '../../constants/RouteNames';
import { ErrorCodes } from '../../constants/ErrorCodes';
import { toast } from 'react-hot-toast';
import { useAppState } from '../../state';
import { FormPage } from '../../Layouts/formPage/FormPage';
import { FormPageContent } from '../../Layouts/formPage/FormPageContent';
import { FormPageTitle } from '../../Layouts/formPage/FormPageTitle';
import { FormPageFields } from '../../Layouts/formPage/FormPageFields';
import { Spacing } from '../../components/Spacing/Spacing';
import { FormPageImage } from '../../Layouts/formPage/FormPageImage';
import useQueryParams from '../../hooks/useQueryParams/useQueryParams';

interface ISignupProps {}

const validateEmail = (value: string) => {
  if (!isEmailValid(value.trim())) {
    return i18n.t('pages.signup.email.invalid');
  }
};

const validateTos = (value: boolean) => {
  if (!value) {
    return i18n.t('pages.signup.tos.invalid');
  }
};

type SignupFormValues = {
  email: string;
  firstName: string;
  lastName: string;
  receiveMarketing: boolean;
  inviteId: string;
  inviteCode: string;
};

export const Signup: React.FC<ISignupProps> = () => {
  const { t } = useTranslation();
  const { setError } = useAppState();

  // get the query params, if any
  const query = useQueryParams();
  const isJoinFlow = query.get('joinFlow');

  // if there's an email cached in history state from signin page, apply it to
  // initial props
  const history = useHistory<{ email?: string; inviteId?: string; inviteCode?: string }>();
  const email = history.location.state?.email || '';

  const inviteCode = history.location.state?.inviteCode || '';
  const inviteId = history.location.state?.inviteId || '';

  const handleSubmit = useCallback(
    async ({ email, firstName, lastName, ...rest }: SignupFormValues, util: FormikHelpers<SignupFormValues>) => {
      try {
        const result = await Api.signup({
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          ...rest,
        });
        if (!result.success) {
          if (result.errorCode === ErrorCodes.ALREADY_REGISTERED) {
            toast(t('pages.signup.alreadyRegistered') as string);
            history.push(RouteNames.SIGN_IN, {
              email: email.trim(),
              inviteCode: rest.inviteCode,
              inviteId: rest.inviteId,
            });
          } else {
            throw new ApiError(result);
          }
        }
        util.setStatus({ sent: true });
      } catch (err) {
        setError(err);
      }
    },
    [history, t, setError]
  );

  return (
    <Formik<SignupFormValues>
      onSubmit={handleSubmit}
      initialStatus={{ sent: false }}
      initialValues={{ email, firstName: '', lastName: '', receiveMarketing: false, inviteCode, inviteId }}
      validateOnBlur={false}
    >
      {({ setStatus, status, values, submitForm }) =>
        status?.sent ? (
          <SignupComplete
            resend={async () => {
              submitForm();
              toast.success(t('pages.signup.resentEmail') as string);
            }}
            email={values.email}
          />
        ) : (
          <FormPage>
            <FormPageContent>
              <FormPageTitle>{t('pages.signup.title')}</FormPageTitle>
              {isJoinFlow && <Typography paragraph>{t('pages.signup.joinFlow')}</Typography>}
              <Form>
                <FormPageFields>
                  <Spacing>
                    <FormikTextField
                      id="firstName"
                      name="firstName"
                      placeholder={t('pages.signup.firstName.placeholder')}
                      label={t('pages.signup.firstName.label')}
                      required
                      margin="normal"
                      autoComplete="given-name"
                      autoFocus
                    />
                    <FormikTextField
                      id="lastName"
                      name="lastName"
                      placeholder={t('pages.signup.lastName.placeholder')}
                      label={t('pages.signup.lastName.label')}
                      required
                      margin="normal"
                      autoComplete="family-name"
                    />
                  </Spacing>
                  <FormikTextField
                    id="email"
                    name="email"
                    placeholder={t('pages.signup.email.placeholder')}
                    label={t('pages.signup.email.label')}
                    validate={validateEmail}
                    margin="normal"
                    autoComplete="email"
                    required
                  />
                  <FormikCheckboxField
                    id="tos"
                    name="tos"
                    value="tos"
                    label={
                      <Trans i18nKey="pages.signup.tos.label">
                        I agree to the <Link to={Links.TOS}>{t('header.tos')}</Link>
                      </Trans>
                    }
                    required
                    validate={validateTos}
                  />
                  <FormikCheckboxField
                    id="receiveMarketing"
                    name="receiveMarketing"
                    value="receiveMarketing"
                    label={t('pages.signup.newsletterOptIn.label')}
                  />
                </FormPageFields>
                <FormikSubmitButton>{t('pages.signup.submitButtonText')}</FormikSubmitButton>
                <Typography style={{ marginTop: 16 }}>
                  <Trans as="span" i18nKey="pages.signup.signInInstead">
                    {`Already have an account? `}
                    <Link to={RouteNames.SIGN_IN}>{t('pages.signup.signIn')}</Link>.
                  </Trans>
                </Typography>
              </Form>
            </FormPageContent>
            <FormPageImage src={img} mobileSrc={mobileImg} />
          </FormPage>
        )
      }
    </Formik>
  );
};
