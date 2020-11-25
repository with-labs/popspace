import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Typography, makeStyles } from '@material-ui/core';
import { isChrome, isIOS } from 'react-device-detect';
import { useTranslation } from 'react-i18next';

interface IRoomSummaryProps {
  roomName?: string;
  onErrorHandler: (errorMsg: string) => void;
}

const useStyles = makeStyles((theme) => ({
  roomName: {
    height: '100%',
  },
}));

export const RoomSummary: React.FC<IRoomSummaryProps> = (props) => {
  const classes = useStyles();
  const { roomName, onErrorHandler } = props;
  const { t } = useTranslation();
  const history = useHistory();

  const onButtonClickHandler = () => {
    if (isIOS && isChrome) {
      // webrtc doesnt work on chrome + ios, so tell them to use safari
      onErrorHandler(t('error.messages.chromeOnIosRestrictions'));
    } else {
      // got to the room
      history.push('/' + roomName);
    }
  };

  return (
    <>
      <Typography variant="h2" className={classes.roomName}>
        {roomName}
      </Typography>
      <Button type="button" onClick={onButtonClickHandler}>
        {t('pages.dashboard.roomSummary.joinRoomBtn')}
      </Button>
    </>
  );
};
