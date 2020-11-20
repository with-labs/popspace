import * as React from 'react';
import { useJoin } from '../../hooks/useJoin/useJoin';
import { makeStyles, Container, CircularProgress } from '@material-ui/core';
import { ErrorTypes } from '../../constants/ErrorType';
import { ErrorPage } from '../../pages/ErrorPage/ErrorPage';
import clsx from 'clsx';

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
  backdrop: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  loadedBackground: {
    backgroundColor: theme.palette.brandColors.sand.regular,
  },
}));

const JoinRoom = ({ roomName }: IJoinRoomProps) => {
  const classes = useStyles();
  const [join] = useJoin(roomName);

  const [errorPageInfo, setErrorPageInfo] = React.useState<{ errorType: ErrorTypes } | null>(null);

  // attempt an auto-login first
  React.useEffect(() => {
    join().catch((err) => {
      // this just means the user can't auto-join
      // unknown error was thrown
      setErrorPageInfo({
        errorType: ErrorTypes.INVALID_ROOM_PERMISSIONS,
      });
    });
  }, [join]);

  if (errorPageInfo) {
    return <ErrorPage type={errorPageInfo.errorType} />;
  }

  return (
    <div className={clsx(classes.backdrop, classes.loadedBackground)}>
      <Container className={classes.container} maxWidth="sm">
        <CircularProgress />
      </Container>
    </div>
  );
};

export default JoinRoom;
