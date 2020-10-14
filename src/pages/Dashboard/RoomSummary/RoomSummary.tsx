import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '@material-ui/core';
import { isMobileOnly, isChrome, isIOS } from 'react-device-detect';
import { useTranslation } from 'react-i18next';

interface IRoomSummaryProps {
  roomName?: string;
  onErrorHandler: (errorMsg: string) => void;
}

export const RoomSummary: React.FC<IRoomSummaryProps> = (props) => {
  const { roomName, onErrorHandler } = props;
  const { t } = useTranslation();
  const history = useHistory();

  const onButtonClickHandler = () => {
    if (isMobileOnly) {
      // right now mobile phones dont get to to go to the room
      onErrorHandler(t('error.messages.mobileNotOptimized'));
    } else if (isIOS && isChrome) {
      // webrtc doesnt work on chrome + ios, so tell them to use safari
      onErrorHandler(t('error.messages.chromeOnIosRestrictions'));
    } else {
      // got to the room
      history.push('/' + roomName);
    }
  };

  return (
    <>
      <div className="u-fontH1 u-height100Percent">{roomName}</div>
      <Button type="button" onClick={onButtonClickHandler}>
        {t('pages.dashboard.roomSummary.joinRoomBtn')}
      </Button>
    </>
  );
};
