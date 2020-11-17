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
import { makeStyles, Button, TextField, Link, Typography, Box } from '@material-ui/core';
import { CheckboxField } from '../../components/CheckboxField/CheckboxField';
import { ErrorTypes } from '../../constants/ErrorType';
import { ErrorInfo } from '../../types/api';
import { useTranslation, Trans } from 'react-i18next';
import { PanelImage } from '../../Layouts/PanelImage/PanelImage';
import { PanelContainer } from '../../Layouts/PanelContainer/PanelContainer';

import { ClaimConfirmationView } from './ClaimConfirmationView';

interface IFinalizeAccountProps {}

const useStyles = makeStyles((theme) => ({
  colRow: {
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
    },
  },
  checkBoxes: {
    marginTop: theme.spacing(2.5),
  },
  button: {
    marginTop: theme.spacing(5),
  },
  title: {
    marginBottom: 10,
  },
  text: {
    marginBottom: theme.spacing(5),
  },
  firstName: {
    marginRight: theme.spacing(2.5),
    [theme.breakpoints.only('sm')]: {
      marginRight: 0,
      marginBottom: theme.spacing(2),
    },
  },
  lastName: {
    [theme.breakpoints.only('sm')]: {
      marginTop: theme.spacing(1.25),
    },
  },
}));

export const FinalizeAccount: React.FC<IFinalizeAccountProps> = (props) => {
  const history = useHistory();
  const { t } = useTranslation();
  const classes = useStyles();

  // get the query params from the invite
  const query = useQueryParams();

  // pull out the information we need from query string
  //if we dont have the params, redirect to root
  const otp = query.get('otp');
  const email = query.get('email');
  const claimId = query.get('cid');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [acceptTos, setAcceptTos] = useState(false);
  const [receiveMarketing, setReceiveMarketing] = useState(false);
  const [error, setError] = useState<ErrorInfo>(null!);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    setIsLoading(true);
    // if opt, email , or the claim id is empty, redirect to root
    if (!otp || !email || !claimId) {
      history.push(RouteNames.ROOT);
    } else {
      // check to see if the room has already been claimed
      Api.resolveRoomClaim(otp, claimId)
        .then((result: any) => {
          if (result.success) {
            if (result.newSessionToken) {
              window.localStorage.setItem(USER_SESSION_TOKEN, result.newSessionToken);
            }
            // redirect to the dashboard if someone is already logged in and the room is claimed
            history.push(RouteNames.ROOT);
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
          Sentry.captureMessage(`Error claiming room for ${email}`, Sentry.Severity.Error);
          setError({
            errorType: ErrorTypes.UNEXPECTED,
            error: e,
          });
        });
    }
  }, [history, otp, email, claimId]);

  const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = {
      firstName,
      lastName,
      email,
      acceptTos,
      receiveMarketing,
    };

    if (!otp || !claimId) {
      Sentry.captureMessage(`Error finializing account for ${email}: link expired`, Sentry.Severity.Warning);
      setError({
        errorType: ErrorTypes.LINK_EXPIRED,
      });
    } else {
      // Note: currently for alpha users or users we send invites out to, this registers the room
      // to their account. There will be a seperate api endpoint for when we do this same flow via user invites
      // 9-28-2020
      const result: any = await Api.registerThroughClaim(data, otp, claimId);
      if (result.success) {
        if (result.newSessionToken) {
          window.localStorage.setItem(USER_SESSION_TOKEN, result.newSessionToken);
        }
        setRoomName(result.roomName);
        setShowConfirmation(true);
      } else {
        Sentry.captureMessage(`Error finializing account for ${email} on submit`, Sentry.Severity.Error);
        setError({
          errorType: ErrorTypes.UNEXPECTED,
        });
      }
    }
  };

  // TODO: convert form to formik?
  return (
    <Page isLoading={isLoading} error={error}>
      <Header />
      {showConfirmation ? (
        <ClaimConfirmationView roomName={roomName} email={email || ''} />
      ) : (
        <TwoColLayout>
          <Column centerContent={true} useColMargin={true}>
            <PanelContainer>
              <Typography variant="h2" className={classes.title}>
                {t('pages.finalizeAccount.title')}
              </Typography>
              <Typography variant="body1" className={classes.text}>
                {t('pages.finalizeAccount.body', { email })}
              </Typography>
              <form onSubmit={onFormSubmit}>
                <Box display="flex" className={classes.colRow}>
                  <TextField
                    id="firstName"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder={t('pages.finalizeAccount.firstNamePlaceholder')}
                    label={t('pages.finalizeAccount.fistNameLabel')}
                    className={classes.firstName}
                  />
                  <TextField
                    id="lastName"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder={t('pages.finalizeAccount.lastNamePlaceholder')}
                    label={t('pages.finalizeAccount.lastNameLabel')}
                    className={classes.lastName}
                  />
                </Box>
                <div className={classes.checkBoxes}>
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
                    name={t('pages.finalizeAccount.tosCheckboxName')}
                  />
                  <CheckboxField
                    label={t('pages.finalizeAccount.marketingCheckboxText')}
                    checked={receiveMarketing}
                    onChange={() => setReceiveMarketing(!receiveMarketing)}
                    name={t('pages.finalizeAccount.martketingCheckboxName')}
                  />
                </div>
                <Button className={classes.button} type="submit" disabled={!firstName || !lastName || !acceptTos}>
                  {t('pages.finalizeAccount.submitBtnText')}
                </Button>
              </form>
            </PanelContainer>
          </Column>
          <Column centerContent={true} hide="sm">
            <PanelImage src={signinImg} altTextKey="pages.finalizeAccount.imgAltText" />
          </Column>
        </TwoColLayout>
      )}
    </Page>
  );
};
