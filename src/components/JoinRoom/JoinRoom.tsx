import * as React from 'react';
import { useJoin } from '../../hooks/useJoin/useJoin';
import { makeStyles, Container, CircularProgress } from '@material-ui/core';
import { ErrorCodes } from '../../constants/ErrorCodes';
import { ErrorPage } from '../../pages/ErrorPage/ErrorPage';
import clsx from 'clsx';
import { ErrorInfo } from '../../types/api';
import { useHistory } from 'react-router-dom';
import { RouteNames } from '../../constants/RouteNames';
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
  const history = useHistory();

  const [errorPageInfo, setErrorPageInfo] = React.useState<ErrorInfo | null>(null);

  // attempt an auto-login first
  React.useEffect(() => {
    join().catch((err) => {
      if (err.errorCode === ErrorCodes.UNAUTHORIZED_USER) {
        // redireecto to root, user needs to login
        history.push(RouteNames.ROOT);
      } else {
        setErrorPageInfo({
          errorCode: err.errorCode,
        });
      }
    });
  }, [join, history]);

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
