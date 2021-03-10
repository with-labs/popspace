import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useQueryParams from '../../hooks/useQueryParams/useQueryParams';
import Api, { ApiError } from '../../utils/api';
import { RouteNames } from '../../constants/RouteNames';
import { Links } from '../../constants/Links';
import signinImg from '../../images/illustrations/sign_in.jpg';
import signinMobileImg from '../../images/illustrations/sign_in_responsive.jpg';
import { makeStyles, Link } from '@material-ui/core';
import { ErrorCodes } from '../../constants/ErrorCodes';
import { useTranslation, Trans } from 'react-i18next';
import { logger } from '../../utils/logger';
import { getSessionToken, setSessionToken } from '../../utils/sessionToken';
import { Form, Formik } from 'formik';
import { FormPage } from '../../Layouts/formPage/FormPage';
import { FormPageContent } from '../../Layouts/formPage/FormPageContent';
import { FormPageTitle } from '../../Layouts/formPage/FormPageTitle';
import { Spacing } from '../../components/Spacing/Spacing';
import { FormPageFields } from '../../Layouts/formPage/FormPageFields';
import { FormikSubmitButton } from '../../components/fieldBindings/FormikSubmitButton';
import { FormPageImage } from '../../Layouts/formPage/FormPageImage';
import { FormikTextField } from '../../components/fieldBindings/FormikTextField';
import { useAppState } from '../../state';
import { FullscreenLoading } from '../../components/FullscreenLoading/FullscreenLoading';
import { FormikCheckboxField } from '../../components/fieldBindings/FormikCheckboxField';
import { isEmailValid } from '../../utils/CheckEmail';
import i18n from '../../i18n';

interface IFinalizeAccountProps {}

const validateEmail = (value: string) => {
  if (!isEmailValid(value)) {
    return i18n.t('pages.signup.email.invalid');
  }
};

type FinalizeAccountFormData = {
  firstName: string;
  lastName: string;
  acceptTos: boolean;
  receiveMarketing: boolean;
  email: string;
};

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: theme.spacing(5),
  },
  text: {
    marginBottom: theme.spacing(5),
  },
}));

export const FinalizeAccount: React.FC<IFinalizeAccountProps> = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const classes = useStyles();
  const { setError } = useAppState();
  const [isLoading, setIsLoading] = useState(true);

  // get the query params from the invite
  const query = useQueryParams();

  // pull out the information we need from query string
  //if we dont have the params, redirect to root
  const otp = query.get('otp') || '';
  const email = query.get('email') || '';
  const claimId = query.get('cid') || null;
  const inviteId = query.get('iid') || null;

  useEffect(() => {
    const apiMethod = claimId
      ? Api.resolveRoomClaim(otp, claimId)
      : inviteId
      ? Api.resolveRoomInvite(otp, inviteId)
      : null;

    if (!apiMethod) {
      // neither cid nor iid was provided, we can't do anything
      history.push(`${RouteNames.ROOT}?e=${ErrorCodes.INVALID_LINK}`);
      return;
    }

    apiMethod
      .then((result: any) => {
        if (result.success) {
          // the user exists in the database, and has succussfully had the room associated with them
          if (result.newSessionToken) {
            // set the new session token if we get one
            setSessionToken(result.newSessionToken);
          }
          // check to see if we have a room name, if we do redirect to the room
          if (result.roomName) {
            history.push(`/${result.roomName}`);
          } else {
            // if not redirect to dashboard
            history.push(RouteNames.ROOT);
          }
        } else if (result.errorCode === ErrorCodes.INVALID_OTP) {
          // OTP is invalid
          if (getSessionToken()) {
            // check to see if the user has a session token stored, if they do
            // then redirect to the dashboard.
            history.push(`${RouteNames.ROOT}?e=${ErrorCodes.INVALID_LINK}`);
          } else {
            // user is not signed in, redirect to the sign in page with invalid link error
            history.push(`${RouteNames.SIGN_IN}?e=${ErrorCodes.INVALID_LINK}`);
          }
        } else if (result.errorCode === ErrorCodes.EXPIRED_OTP) {
          // OTP is expired, so we will show the link expired page
          logger.warn(`Error joining room for ${email}: linked expired`, result.message, result.errorCode);
          setError(new ApiError(result));
        } else if (result.errorCode === ErrorCodes.RESOLVED_OTP) {
          // this link has already been clicked before
          // check to see if the user has a session token set
          if (getSessionToken()) {
            // if the user has a session token, its safe to assume they are logged in
            // so kick the user into the join room flow which will take
            // care of validating if a user is logged in and if they have the proper
            // room permissions set.
            if (result.roomName) {
              history.push(`/${result.roomName}`);
            } else {
              // if not redirect to dashboard
              history.push(RouteNames.ROOT);
            }
          } else {
            // if the user is not logged in, redirect to signin page with invalid link error
            history.push(`${RouteNames.SIGN_IN}?e=${ErrorCodes.RESOLVED_OTP}`);
          }
        } else if (result.errorCode === ErrorCodes.JOIN_FAIL_NO_SUCH_USER) {
          // the room is unclaimed, but the user isnt created,
          // so we render the finialize form to finish creating the user
          setIsLoading(false);
        } else {
          // something unexpected has happened
          logger.error(`Error claiming room for ${email}: unexpected error message`, result.message, result.errorCode);
          setError(new ApiError(result));
        }
      })
      .catch((e: any) => {
        // unexpected error
        logger.error(`Error claiming room for ${email}`, e);
        setError(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [history, otp, email, claimId, t, setError, inviteId]);

  const handleSubmit = async (data: FinalizeAccountFormData) => {
    try {
      const apiMethod = claimId
        ? Api.registerThroughClaim(data, otp, claimId)
        : Api.registerThroughInvite(data, otp, inviteId);
      const result = await apiMethod;
      if (result.success) {
        // invitee was able to register
        if (result.newSessionToken) {
          // refresh the session token if we have it
          setSessionToken(result.newSessionToken);
        }

        // user is done creating they account,
        // redirect them to the room
        history.push(`/${result.roomName}`);
      } else {
        setError(new ApiError(result));

        if (
          result.errorCode === ErrorCodes.INVALID_OTP ||
          result.errorCode === ErrorCodes.EXPIRED_OTP ||
          result.errorCode === ErrorCodes.RESOLVED_OTP
        ) {
          logger.warn(`Warning: finalizing acount for ${email}: otp error`, result.message, result.errorCode);
        } else {
          logger.error(`Error finializing account for ${email} on submit`, result.message, result.errorCode);
        }
      }
    } catch (e) {
      // something unexpected has happened, display the unexpected error page
      logger.error(`Error finializing account for ${email} on submit`, e);
      setError(e);
    }
  };

  if (isLoading) {
    return <FullscreenLoading />;
  }

  return (
    <Formik<FinalizeAccountFormData>
      initialValues={{ firstName: '', lastName: '', email, acceptTos: false, receiveMarketing: false }}
      onSubmit={handleSubmit}
      validateOnBlur={false}
    >
      {() => (
        <FormPage>
          <FormPageContent>
            <FormPageTitle>{t('pages.finalizeAccount.title')}</FormPageTitle>
            <Form>
              <FormPageFields>
                <Spacing>
                  <FormikTextField
                    id="firstName"
                    name="firstName"
                    placeholder={t('pages.finalizeAccount.firstNamePlaceholder')}
                    label={t('pages.finalizeAccount.fistNameLabel')}
                    margin="normal"
                    required
                  />
                  <FormikTextField
                    id="lastName"
                    name="lastName"
                    placeholder={t('pages.finalizeAccount.lastNamePlaceholder')}
                    label={t('pages.finalizeAccount.lastNameLabel')}
                    margin="normal"
                    required
                  />
                </Spacing>
                <FormikTextField
                  id="email"
                  name="email"
                  placeholder={t('pages.finalizeAccount.email.placeholder')}
                  label={t('pages.finalizeAccount.email.label')}
                  margin="normal"
                  required
                  validate={validateEmail}
                />
                <FormikCheckboxField
                  label={
                    <span>
                      <Trans i18nKey="pages.joinRoom.tosCheck">
                        I agree to the
                        <Link href={Links.TOS} target="_blank" rel="noopener noreferrer">
                          Terms of Service
                        </Link>
                      </Trans>
                    </span>
                  }
                  name="acceptTos"
                  value="acceptTos"
                  required
                  validate={(val) => {
                    if (!val) return t('pages.signup.tos.invalid') as string;
                  }}
                />
                <FormikCheckboxField
                  label={t('pages.finalizeAccount.marketingCheckboxText')}
                  name="receiveMarketing"
                  value="receiveMarketing"
                />
              </FormPageFields>
              <FormikSubmitButton className={classes.button}>
                {t('pages.finalizeAccount.submitBtnText')}
              </FormikSubmitButton>
            </Form>
          </FormPageContent>

          <FormPageImage src={signinImg} mobileSrc={signinMobileImg} />
        </FormPage>
      )}
    </Formik>
  );
};
