import React, { useState, useEffect, MouseEvent } from 'react';
import clsx from 'clsx';
import { LocalParticipant, RemoteParticipant } from 'twilio-video';
import { WithModal } from '../WithModal/WithModal';
import styles from './ShareScreenWidget.module.css';

interface IShareScreenWidget {
  classNames?: string;
  onCloseHandler: (e: MouseEvent) => void;
  isOpen: boolean;
}

export const ShareScreenWidget: React.FC<IShareScreenWidget> = props => {
  const { classNames, isOpen, onCloseHandler } = props;

  const [source, setSource] = useState(null);

  useEffect(() => {
    // change the video source here (most likely, just a guess Wyatt)
  }, [isOpen]); // Update the devices when the modal opens/closes

  return (
    <WithModal title={`<PERSONS NAME> screen`} isOpen={isOpen} onCloseHandler={onCloseHandler}>
      hello world
    </WithModal>
  );
};
