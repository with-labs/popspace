import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Api, { BaseResponse } from '../../utils/api';
import * as Sentry from '@sentry/react';
import { Link, Box, makeStyles, Typography } from '@material-ui/core';
import { RouteNames } from '../../constants/RouteNames';
import { Links } from '../../constants/Links';
import { USER_SESSION_TOKEN } from '../../constants/User';

import { DashboardItem } from './DashboardItem/DashboardItem';
import { RoomSummary } from './RoomSummary/RoomSummary';
import { Header } from '../../components/Header/Header';
import { RoomInfo, ErrorInfo, UserInfo } from '../../types/api';
import { ErrorTypes } from '../../constants/ErrorType';
import { sessionTokenExists } from '../../utils/SessionTokenExists';
import { useTranslation } from 'react-i18next';
import { Page } from '../../Layouts/Page/Page';
import { ErrorModal } from '../../components/ErrorModal/ErrorModal';

interface IDashboardProps {}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.brandColors.snow.regular,
  },
  wrapper: {
    maxWidth: 768,
    width: '80%',
  },
  text: {
    marginBottom: theme.spacing(4),
  },
  bgContainer: {
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
    backgroundColor: theme.palette.brandColors.sand.regular,
    padding: theme.spacing(4),
    overflowY: 'auto',
    height: '100%',
  },
  roomWrapper: {
    with: '100%',
  },
  roomGrid: {
    height: '100%',
    display: 'grid',
    'grid-gap': '10px',
    'grid-template-columns': '100%',
    [theme.breakpoints.up('md')]: {
      'grid-template-columns': '50% 50%',
    },
  },
  feedbackTextWrapper: {
    padding: `0 10%`,
    textAlign: 'center',
    height: '100%',
  },
  feedbackLink: {
    marginTop: theme.spacing(4),
  },
}));

// TODO: refine error state handler, unify to use BaseResponse

export const Dashboard: React.FC<IDashboardProps> = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(!sessionTokenExists(localStorage.getItem(USER_SESSION_TOKEN)));
  const [error, setError] = useState<ErrorInfo>(null!);
  const [user, setUser] = useState<UserInfo>(null!);
  const [rooms, setRooms] = useState<{ owned: RoomInfo[]; member: RoomInfo[] }>({ owned: [], member: [] });
  const [errorMsg, setErrorMsg] = useState<BaseResponse | null>(null);
  const { t } = useTranslation();

  // run this on mount
  useEffect(() => {
    const sessionToken = localStorage.getItem(USER_SESSION_TOKEN);
    if (sessionTokenExists(sessionToken)) {
      setIsLoading(true);
      // TODO: replace this with the updated api
      // Fix typing
      Api.getProfile()
        .then((result: any) => {
          // there is an edge case that profile a profile will return null if a user doesnt
          // exist in the db, but they have a valid session token, so just check if there is a profile
          // if not redirect to the signin page
          if (result.success && result.profile) {
            // this means we have a valid token
            setUser(result.profile.user);
            setRooms(result.profile.rooms);
          } else {
            // we dont have a valid token, so redirect to sign in and remove old token
            localStorage.removeItem(USER_SESSION_TOKEN);
            history.push(RouteNames.SIGN_IN);
          }
        })
        .catch((e: any) => {
          Sentry.captureMessage(`Error calling api call getProfile`, Sentry.Severity.Error);
          setError({
            errorType: ErrorTypes.UNEXPECTED,
            error: e,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // we arent logged in so redirect to the sign in page
      history.push(RouteNames.SIGN_IN);
    }
  }, [history]);

  const feedbackItem = (
    <DashboardItem>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        className={classes.feedbackTextWrapper}
      >
        <Typography variant="body1">{t('pages.dashboard.feedbackItemBodyText')}</Typography>
        <div className={classes.feedbackLink}>
          <Link href={Links.FEEDBACK} target="_blank" rel="noopener noreferrer">
            {t('pages.dashboard.feedbackItemLink')}
          </Link>
        </div>
      </Box>
    </DashboardItem>
  );

  const onRoomSummaryError = (msg: string) => {
    setErrorMsg({ message: msg } as BaseResponse);
  };

  return (
    <Page isLoading={isLoading} error={error}>
      <Box display="flex" justifyContent="center" flexGrow={1}>
        <Box display="flex" flexDirection="column" flexBasis="auto" className={classes.wrapper}>
          <Header isFullLength={true} userName={user ? user['first_name'] : ''} />
          <div className={classes.bgContainer}>
            <Typography variant="h2" className={classes.text}>
              {t('pages.dashboard.roomsTitle')}
            </Typography>
            <div className={classes.roomWrapper}>
              <div className={classes.roomGrid}>
                {[...rooms.owned, ...rooms.member].map((memberRoom) => {
                  return (
                    <DashboardItem key={memberRoom.id}>
                      <RoomSummary roomName={memberRoom.name} key={memberRoom.id} onErrorHandler={onRoomSummaryError} />
                    </DashboardItem>
                  );
                })}
                {feedbackItem}
              </div>
            </div>
          </div>
        </Box>
      </Box>
      <ErrorModal
        open={!!errorMsg}
        error={errorMsg!}
        onClose={() => setErrorMsg(null)}
        title={t('error.noteError.title')}
      />
    </Page>
  );
};
