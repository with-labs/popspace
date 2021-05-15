import React, { useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Typography } from '@material-ui/core';
import Api from '../../utils/api';
import { ApiError } from '../../errors/ApiError';
import img from '../../images/illustrations/welcome_to_with.jpg';
import mobileImg from '../../images/illustrations/welcome_to_with_responsive.jpg';
import { Form, Formik, FormikHelpers } from 'formik';
import { FormikTextField } from '../../components/fieldBindings/FormikTextField';
import { FormikSubmitButton } from '../../components/fieldBindings/FormikSubmitButton';
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
import { useCurrentUserProfile } from '../../hooks/api/useCurrentUserProfile';
import { FullscreenLoading } from '../../components/FullscreenLoading/FullscreenLoading';
import { Analytics } from '../../analytics/Analytics';
import { EventNames } from '../../analytics/constants';
import { MAX_EMAIL_LENTH, MAX_NAME_LENGTH } from '../../constants';
import * as Yup from 'yup';

interface ISignupProps {}

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .max(MAX_NAME_LENGTH, i18n.t('pages.signup.firstName.maxSize', { maxNameLength: MAX_NAME_LENGTH }))
    .required(i18n.t('common.required')),
  lastName: Yup.string()
    .max(MAX_NAME_LENGTH, i18n.t('pages.signup.lastName.maxSize', { maxNameLength: MAX_NAME_LENGTH }))
    .required(i18n.t('common.required')),
  email: Yup.string()
    .trim()
    .max(MAX_EMAIL_LENTH, i18n.t('pages.signup.email.maxSize', { maxNameLength: MAX_EMAIL_LENTH }))
    .email(i18n.t('pages.signup.email.invalid'))
    .required(i18n.t('common.required')),
  tos: Yup.boolean().required(i18n.t('pages.signup.tos.invalid')),
});

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
  const { user, isLoading } = useCurrentUserProfile();

  // get the start date
  const [startSignUp] = useState(new Date());

  // get the query params, if any
  const query = useQueryParams();
  const isJoinFlow = query.get('joinFlow');
  const queryEmail = query.get('email');

  /*
    accept a variety of ways to communicate the origin of the signup.
    Many website add a ?ref=xyz param, but ?utm_source=xyz is also popular.
    Internally we'll use ref, e.g. from the landing page,
    but this list can expand to accommodate more sources.
  */
  const queryRef = query.get('ref') || query.get('utm_source') || null;

  // if there's an email cached in history state from signin page, apply it to
  // initial props
  const history = useHistory<{ email?: string; inviteId?: string; inviteCode?: string; ref?: string | null }>();
  const email = history.location.state?.email || queryEmail || '';

  const inviteCode = history.location.state?.inviteCode || '';
  const inviteId = history.location.state?.inviteId || '';

  useEffect(() => {
    // if the user is already logged in
    // then we redirect to the dash if the user tries to hit sign up
    if (user) {
      history.push(RouteNames.ROOT, { ref: queryRef });
    }
  }, [history, user, queryRef]);

  const handleSubmit = useCallback(
    async (
      { email, firstName, lastName, ...rest }: SignupFormValues,
      util: FormikHelpers<SignupFormValues> | null,
      isResend: boolean = false
    ) => {
      try {
        const result = await Api.signup({
          ref: queryRef,
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
              ref: queryRef,
            });
          } else {
            throw new ApiError(result);
          }
        } else {
          if (!isResend) {
            // user has submitted their sign up form
            // capture event
            const endStartUp = new Date();
            const total_time = (endStartUp.getTime() - startSignUp.getTime()) / 1000;
            Analytics.trackEvent(EventNames.ONBOARDING_BEGIN_SIGNUP, {
              ref: queryRef,
              started_at: startSignUp,
              completed_at: endStartUp,
              total_time,
              is_invite: inviteCode !== '' && inviteId !== '',
            });
          } else {
            // capture resend email event
            Analytics.trackEvent(EventNames.ONBOARDING_RESEND_EMAIL, { ref: queryRef });
          }
        }
        util?.setStatus({ sent: true });
      } catch (err) {
        setError(err);
      }
    },
    [history, t, setError, queryRef, startSignUp, inviteCode, inviteId]
  );

  if (isLoading) {
    return <FullscreenLoading />;
  }

  return (
    <Formik<SignupFormValues>
      onSubmit={handleSubmit}
      initialStatus={{ sent: false }}
      initialValues={{ email, firstName: '', lastName: '', receiveMarketing: false, inviteCode, inviteId }}
      validateOnBlur={false}
      validationSchema={validationSchema}
    >
      {({ status, values, errors }) =>
        status?.sent ? (
          <SignupComplete
            resend={async () => {
              handleSubmit(values, null, true);
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
                      maxLength={10}
                    />
                    <FormikTextField
                      id="lastName"
                      name="lastName"
                      placeholder={t('pages.signup.lastName.placeholder')}
                      label={t('pages.signup.lastName.label')}
                      required
                      margin="normal"
                      autoComplete="family-name"
                      maxLength={50}
                    />
                  </Spacing>
                  <FormikTextField
                    id="email"
                    name="email"
                    placeholder={t('pages.signup.email.placeholder')}
                    label={t('pages.signup.email.label')}
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
                    <Link to={RouteNames.SIGN_IN} state={{ inviteCode, inviteId }}>
                      {t('pages.signup.signIn')}
                    </Link>
                    .
                  </Trans>
                </Typography>

                <Typography component="p" variant="caption" style={{ marginTop: 16 }}>
                  {t('pages.signup.earlyAccessAccept')}
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
