import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { TwoColLayout } from '../../Layouts/TwoColLayout/TwoColLayout';
import { Page } from '../../Layouts/Page/Page';
import { Column } from '../../Layouts/TwoColLayout/Column/Column';
import useQueryParams from '../../hooks/useQueryParams/useQueryParams';
import Api from '../../utils/api';

import { RouteNames } from '../../constants/RouteNames';
import { Links } from '../../constants/Links';
import { ErrorCodes } from '../../constants/ErrorCodes';

import { Header } from '../../components/Header/Header';
import signinImg from '../../images/SignIn.png';
import { Button, TextField, Link, makeStyles, Typography } from '@material-ui/core';
import { CheckboxField } from '../../components/CheckboxField/CheckboxField';
import { ErrorInfo } from '../../types/api';
import { useTranslation, Trans } from 'react-i18next';
import { PanelImage } from '../../Layouts/PanelImage/PanelImage';
import { PanelContainer } from '../../Layouts/PanelContainer/PanelContainer';
import { logger } from '../../utils/logger';
import { getSessionToken, setSessionToken } from '../../utils/sessionToken';

interface IJoinRoomProps {}

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(1),
  },
  text: {
    marginBottom: theme.spacing(5),
  },
  button: {
    marginTop: theme.spacing(5),
  },
  firstName: {
    marginRight: 0,
    marginBottom: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      marginRight: 20,
    },
  },
  lastName: {
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(1),
    },
  },
  checkboxes: {
    marginTop: 20,
  },
  formWrapper: {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
    },
  },
}));

export const JoinRoom: React.FC<IJoinRoomProps> = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const { t } = useTranslation();

  // get the query params from the invite
  const query = useQueryParams();

  // pull out the information we need from query string
  const otp = query.get('otp') || '';
  const email = query.get('email') || '';
  const inviteId = query.get('iid') || null;
  // mainly used for display
  const roomName = query.get('room') || '';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [acceptTos, setAcceptTos] = useState(false);
  const [receiveMarketing, setReceiveMarketing] = useState(false);
  const [error, setError] = useState<ErrorInfo>(null!);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Api.resolveRoomInvite(otp, inviteId)
      .then((result: any) => {
        if (result.success) {
          // the invitee has an account and has successfully
          // been added to the the room memebership list.
          if (result.newSessionToken) {
            // refresh the user session token if we have one.
            setSessionToken(result.newSessionToken);
          }
          // redirect using the roomName returned from result to
          // make sure user is redirect to the correct room they where
          /// added to.
          history.push(`/${result.roomName}`);
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
          logger.warn(`Error joining for ${email}: linked expired`, result.message, result.errorCode);
          setError({
            errorCode: ErrorCodes.JOIN_ROOM_LINK_EXPIRED,
            error: result,
          });
        } else if (result.errorCode === ErrorCodes.RESOLVED_OTP) {
          // this link has already been clicked before
          // check to see if the user has a session token set
          if (getSessionToken()) {
            // if the user has a session token, its safe to assume they are logged in
            // so kick the user into the join room flow which will take
            // care of validating if a user is logged in and if they have the proper
            // room permissions set.
            history.push(`/${result.roomName}`);
          } else {
            // if the user is not logged in, redirect to signin page with invalid link error
            history.push(`${RouteNames.SIGN_IN}?e=${ErrorCodes.RESOLVED_OTP}`);
          }
        } else if (result.errorCode === ErrorCodes.JOIN_FAIL_NO_SUCH_USER) {
          // the invitee ddoesnt have an accout, so we display
          // the user account screen
          setIsLoading(false);
        } else {
          // something unexpected has happened
          logger.error(`Error joining room for ${email}: unexpected error`, result.message, result.errorCode);
          setError({
            errorCode: ErrorCodes.UNEXPECTED,
            error: result,
          });
        }
      })
      .catch((e: any) => {
        // something unexpected has happened
        logger.error(`Error joining room for ${email}: unexpected error`, e);
        setError({
          errorCode: ErrorCodes.UNEXPECTED,
          error: e,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [history, otp, inviteId, roomName, email]);

  // TODO: move this over to formik
  const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = {
      firstName,
      lastName,
      email,
      acceptTos,
      receiveMarketing,
    };

    try {
      const result: any = await Api.registerThroughInvite(data, otp, inviteId);
      if (result.success) {
        // invitee has successfully created an account
        if (result.newSessionToken) {
          // set the new session token if have one
          setSessionToken(result.newSessionToken);
        }
        // redirect to the room the user was added to.
        history.push(`/${result.roomName}`);
      } else if (
        result.errorCode === ErrorCodes.INVALID_OTP ||
        result.errorCode === ErrorCodes.EXPIRED_OTP ||
        result.errorCode === ErrorCodes.RESOLVED_OTP
      ) {
        logger.warn(`Error joining for ${email}: linked expired`, result.message, result.errorCode);
        setError({
          errorCode: ErrorCodes.JOIN_ROOM_LINK_EXPIRED,
          error: result,
        });
      } else {
        // something we didnt think of happened
        logger.error(`Error in JoinRoom finializing account for ${email} on submit`, result.message, result.errorCode);
        setError({
          errorCode: ErrorCodes.UNEXPECTED,
          error: result,
        });
      }
    } catch (err) {
      // something happened UNEXPECTEDLY
      logger.error(`Error in JoinRoom finializing account for ${email} on submit`, err);
      setError({
        errorCode: ErrorCodes.UNEXPECTED,
        error: err,
      });
    }
  };

  return (
    <Page isLoading={isLoading} error={error}>
      <Header />
      <TwoColLayout>
        <Column centerContent={true} useColMargin={true}>
          <PanelContainer>
            <Typography variant="h2" className={classes.title}>
              {t('pages.joinRoom.title')}
            </Typography>
            <Typography variant="body1" className={classes.text}>
              {t('pages.joinRoom.body', { email, roomName })}
            </Typography>
            <form onSubmit={onFormSubmit}>
              <div className={classes.formWrapper}>
                <TextField
                  id="firstName"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder={t('pages.joinRoom.firstNamePlaceholder')}
                  label={t('pages.joinRoom.fistNameLabel')}
                  className={classes.firstName}
                />
                <TextField
                  id="lastName"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder={t('pages.joinRoom.lastNamePlaceholder')}
                  label={t('pages.joinRoom.lastNameLabel')}
                  className={classes.lastName}
                />
              </div>
              <div className={classes.checkboxes}>
                <CheckboxField
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
                  checked={acceptTos}
                  onChange={() => setAcceptTos(!acceptTos)}
                  name={t('pages.joinRoom.tosCheckboxName')}
                />
                <CheckboxField
                  label={t('pages.joinRoom.marketingCheckboxText')}
                  checked={receiveMarketing}
                  onChange={() => setReceiveMarketing(!receiveMarketing)}
                  name={t('pages.joinRoom.martketingCheckboxName')}
                />
              </div>
              <Button className={classes.button} type="submit" disabled={!firstName || !lastName || !acceptTos}>
                {t('pages.joinRoom.submitBtnText')}
              </Button>
            </form>
          </PanelContainer>
        </Column>
        <Column centerContent={true} hide="sm">
          <PanelImage src={signinImg} altTextKey="pages.joinRoom.imgAltText" />
        </Column>
      </TwoColLayout>
    </Page>
  );
};
