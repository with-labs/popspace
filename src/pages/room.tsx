import React from 'react';
import AnglesApp from '../App';
import ErrorDialog from '../components/ErrorDialog/ErrorDialog';

interface IRoomProps {
  name: string;
  error: any;
  setError: any;
}

export default function Room(props: IRoomProps) {
  return (
    <>
      <ErrorDialog dismissError={() => props.setError(null)} error={props.error} />
      <AnglesApp roomName={props.name} />
    </>
  );
}
