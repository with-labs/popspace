import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '@material-ui/core';
import { isMobileOnly, isChrome, isIOS } from 'react-device-detect';

interface IRoomSummaryProps {
  roomName?: string;
  onErrorHandler: (errorMsg: string) => void;
}

export const RoomSummary: React.FC<IRoomSummaryProps> = (props) => {
  const { roomName, onErrorHandler } = props;
  const history = useHistory();

  const onButtonClickHandler = () => {
    if (isMobileOnly) {
      // right now mobile phones dont get to to go to the room
      onErrorHandler(
        'With is currently not optimized for mobile. We rather polish the experience before you can use it. Sorry for the inconvenience.'
      );
    } else if (isIOS && isChrome) {
      // webrtc doesnt work on chrome + ios, so tell them to use safari
      onErrorHandler(
        'Due to technical restrictions on iOS, With cannot work in Chrome on iOS - please use Safari. Sorry for the inconvenience'
      );
    } else {
      // got to the room
      history.push('/' + roomName);
    }
  };

  return (
    <>
      <div className="u-fontH1 u-height100Percent">{roomName}</div>
      <Button type="button" onClick={onButtonClickHandler}>
        Join room
      </Button>
    </>
  );
};
