import * as React from 'react';
import { ReactComponent as WithLogo } from '../../images/logo/small.svg';
import { FatalError, JoinError, useJoin } from '../../withHooks/useJoin/useJoin';
import { JoinRoomForm, JoinRoomFormData } from './JoinRoomForm';
import { makeStyles, Container, CircularProgress, Box, Paper, Typography } from '@material-ui/core';
import { useAppState } from '../../state';
import { useTranslation } from 'react-i18next';
import { ErrorTypes } from '../../constants/ErrorType';
import { ErrorPage } from '../../pages/ErrorPage/ErrorPage';

interface IJoinRoomProps {
  roomName: string;
}

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  logo: {},
  title: {
    fontSize: theme.typography.pxToRem(16),
    marginLeft: theme.spacing(2),
  },
}));

const JoinRoom = ({ roomName }: IJoinRoomProps) => {
  const classes = useStyles();

  const { t } = useTranslation();

  const [join, { loading }] = useJoin(roomName);

  const { setError } = useAppState();
  const [errorPageInfo, setErrorPageInfo] = React.useState<{ errorType: ErrorTypes; error: Error } | null>(null);

  // attempt an auto-login first
  React.useEffect(() => {
    join().catch((err) => {
      // this just means the user can't auto-join, fallback to password join.
    });
  }, [join]);

  const handlePasswordJoin = React.useCallback(
    async (data: JoinRoomFormData) => {
      try {
        await join(data.username, data.password);
      } catch (err) {
        if (err instanceof JoinError) {
          // these are standard procedural errors, like
          // incorrect password
          setError(err);
        } else if (err instanceof FatalError) {
          setErrorPageInfo({
            errorType: err.errorType,
            error: err,
          });
        } else {
          // unknown error was thrown
          setErrorPageInfo({
            errorType: ErrorTypes.UNEXPECTED,
            error: err,
          });
        }
      }
    },
    [join, setErrorPageInfo, setError]
  );

  if (errorPageInfo) {
    return <ErrorPage type={errorPageInfo.errorType} errorMessage={errorPageInfo.error?.message} />;
  }

  return (
    <Container className={classes.container} maxWidth="sm">
      {loading ? (
        <CircularProgress />
      ) : (
        <Box component={Paper} p={4}>
          <Box display="flex" flexDirection="row" alignItems="baseline" mb={2}>
            <WithLogo className={classes.logo} />
            <Typography variant="h2" className={classes.title}>
              {t('pages.room.joinTitle', { roomName })}
            </Typography>
          </Box>
          <JoinRoomForm onSubmit={handlePasswordJoin} />
        </Box>
      )}
    </Container>
  );
};

export default JoinRoom;
