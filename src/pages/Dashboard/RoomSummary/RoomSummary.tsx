import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '@material-ui/core';

interface IRoomSummaryProps {
  roomName?: string;
}

export const RoomSummary: React.FC<IRoomSummaryProps> = (props) => {
  const { roomName } = props;
  const history = useHistory();

  const onButtonClickHandler = () => {
    history.push('/' + roomName);
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
