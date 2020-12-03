import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Api from '../../utils/api';
import { Link, Box, makeStyles, Typography } from '@material-ui/core';
import { RouteNames } from '../../constants/RouteNames';
import { Links } from '../../constants/Links';

import { DashboardItem } from './DashboardItem/DashboardItem';
import { RoomSummary } from './RoomSummary/RoomSummary';
import { Header } from '../../components/Header/Header';
import { RoomInfo, ErrorInfo, UserInfo } from '../../types/api';
import { ErrorCodes } from '../../constants/ErrorCodes';
import { sessionTokenExists, getSessionToken, removeSessionToken } from '../../utils/sessionToken';
import { useTranslation } from 'react-i18next';
import { Page } from '../../Layouts/Page/Page';
import { logger } from '../../utils/logger';
import useQueryParams from '../../hooks/useQueryParams/useQueryParams';
import { DialogModal, DialogMessage } from '../../components/DialogModal/DialogModal';
import { getErrorDialogText } from '../../utils/ErrorMessage';

interface IDashboardProps {}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.brandColors.snow.regular,
  },
  wrapper: {
    maxWidth: 768,
    width: '80%',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
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
  const [isLoading, setIsLoading] = useState(!sessionTokenExists(getSessionToken()));
  const [error, setError] = useState<ErrorInfo>(null!);
  const [user, setUser] = useState<UserInfo>(null!);
  const [rooms, setRooms] = useState<{ owned: RoomInfo[]; member: RoomInfo[] }>({ owned: [], member: [] });
  const { t } = useTranslation();
  const query = useQueryParams();

  // check to see if we have url error code and set it as the default error if we have it
  const errorInfo = query.get('e');
  const [errorMsg, setErrorMsg] = useState<DialogMessage | null>(getErrorDialogText(errorInfo as ErrorCodes, t));

  // run this on mount
  useEffect(() => {
    const sessionToken = getSessionToken();
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
            removeSessionToken();
            history.push(RouteNames.SIGN_IN);
          }
        })
        .catch((e: any) => {
          logger.error(`Error calling api call getProfile`, e);
          setError({
            errorCode: ErrorCodes.UNEXPECTED,
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
    setErrorMsg({ body: msg, title: t('error.noteError.title') } as DialogMessage);
  };

  const clearUrlError = () => {
    if (errorInfo) {
      // remove the error from the query string when the user has cleared
      // the error
      history.replace(RouteNames.ROOT);
    }
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
      <DialogModal message={errorMsg} onClose={clearUrlError} />
    </Page>
  );
};
