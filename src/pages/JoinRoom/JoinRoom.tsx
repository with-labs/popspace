import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { TwoColLayout } from '../../Layouts/TwoColLayout/TwoColLayout';
import { Page } from '../../Layouts/Page/Page';
import { Column } from '../../Layouts/TwoColLayout/Column/Column';
import useQueryParams from '../../hooks/useQueryParams/useQueryParams';

import Api from '../../utils/api';
import * as Sentry from '@sentry/react';

import { RouteNames } from '../../constants/RouteNames';
import { Links } from '../../constants/Links';
import { ErrorCodes } from '../../constants/ErrorCodes';
import { USER_SESSION_TOKEN } from '../../constants/User';

import { Header } from '../../components/Header/Header';
import signinImg from '../../images/SignIn.png';
import { Button, TextField, Link, makeStyles, Typography } from '@material-ui/core';
import { CheckboxField } from '../../components/CheckboxField/CheckboxField';
import { ErrorTypes } from '../../constants/ErrorType';
import { ErrorInfo } from '../../types/api';
import { useTranslation, Trans } from 'react-i18next';
import { PanelImage } from '../../Layouts/PanelImage/PanelImage';
import { PanelContainer } from '../../Layouts/PanelContainer/PanelContainer';

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
  //if we dont have the params, redirect to root
  const otp = query.get('otp');
  const email = query.get('email');
  const inviteId = query.get('iid');
  const roomName = query.get('room');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [acceptTos, setAcceptTos] = useState(false);
  const [receiveMarketing, setReceiveMarketing] = useState(false);
  const [error, setError] = useState<ErrorInfo>(null!);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    // if opt, email , or the inviteId is empty, redirect to root
    if (!otp || !email || !inviteId) {
      history.push(RouteNames.ROOT);
    } else {
      // check to see if the room has already been claimed
      Api.resolveRoomInvite(otp, inviteId)
        .then((result: any) => {
          if (result.success) {
            if (result.newSessionToken) {
              window.localStorage.setItem(USER_SESSION_TOKEN, result.newSessionToken);
            }
            // TODO: change to be the room your being invtited to
            history.push(`/${roomName}`);
          } else {
            if (result.errorCode === ErrorCodes.JOIN_FAIL_NO_SUCH_USER) {
              // the room is unclaimed, but the user isnt created,
              //  so we render the finialize form to finish creating the user
              setIsLoading(false);
            } else {
              // opt, email, claimId fails
              setIsLoading(false);
              Sentry.captureMessage(
                `Error claiming room for ${email}: linked expired on load`,
                Sentry.Severity.Warning
              );
              setError({
                errorType: ErrorTypes.LINK_EXPIRED,
                error: result,
              });
            }
          }
        })
        .catch((e: any) => {
          // unexpected error
          setIsLoading(false);
          Sentry.captureMessage(`Error join room for ${email}`, Sentry.Severity.Error);
          setError({
            errorType: ErrorTypes.UNEXPECTED,
            error: e,
          });
        });
    }
  }, [history, otp, email, inviteId, roomName]);

  const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = {
      firstName,
      lastName,
      email,
      acceptTos,
      receiveMarketing,
    };

    if (!otp || !inviteId) {
      Sentry.captureMessage(
        `Error in JoinRoom finializing account for ${email}: link expired`,
        Sentry.Severity.Warning
      );
      setError({
        errorType: ErrorTypes.LINK_EXPIRED,
      });
    } else {
      const result: any = await Api.registerThroughInvite(data, otp, inviteId);
      if (result.success) {
        if (result.newSessionToken) {
          window.localStorage.setItem(USER_SESSION_TOKEN, result.newSessionToken);
        }
        history.push(`/${roomName}`);
      } else {
        Sentry.captureMessage(`Error in JoinRoom finializing account for ${email} on submit`, Sentry.Severity.Error);
        setError({
          errorType: ErrorTypes.UNEXPECTED,
        });
      }
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
