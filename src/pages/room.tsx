import React from 'react';
import AnglesApp from '../AnglesApp';
import ErrorDialog from '../components/ErrorDialog/ErrorDialog';

type RoomProps = {
  name: string;
  error: any;
  setError: any;
};

export default function Room(props: RoomProps) {
  return (
    <div>
      <ErrorDialog dismissError={() => props.setError(null)} error={props.error} />
      <AnglesApp roomName={props.name} />
    </div>
  );
}
