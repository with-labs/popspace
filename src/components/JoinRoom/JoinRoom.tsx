import * as React from 'react';
import { useJoin } from '../../hooks/useJoin/useJoin';
import { makeStyles, Container, CircularProgress } from '@material-ui/core';
import { ErrorCodes } from '../../constants/ErrorCodes';
import { ErrorPage } from '../../pages/ErrorPage/ErrorPage';
import clsx from 'clsx';
import { ErrorInfo } from '../../types/api';

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
}));

const JoinRoom = ({ roomName }: IJoinRoomProps) => {
  const classes = useStyles();
  const [join] = useJoin(roomName);

  const [errorPageInfo, setErrorPageInfo] = React.useState<ErrorInfo | null>(null);

  // attempt an auto-login first
  React.useEffect(() => {
    join().catch((err) => {
      // this just means the user can't auto-join
      // unknown error was thrown
      setErrorPageInfo({
        errorCode: ErrorCodes.INVALID_ROOM_PERMISSIONS,
      });
    });
  }, [join]);

  if (errorPageInfo) {
    return <ErrorPage type={errorPageInfo.errorCode} />;
  }

  return (
    <div className={clsx(classes.backdrop)}>
      <Container className={classes.container} maxWidth="sm">
        <CircularProgress />
      </Container>
    </div>
  );
};

export default JoinRoom;
