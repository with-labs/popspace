import React, { useState } from 'react';
import clsx from 'clsx';
import { Widget } from '../Widget/Widget';
import { RemoteParticipant, LocalParticipant } from 'twilio-video';
import useParticipantDisplayIdentity from '../../withHooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';

import styles from './StickyNoteWidget.module.css';

interface IStickyNoteWidget {
  text: string;
  participant?: LocalParticipant | RemoteParticipant;
  onCloseHandler: Function;
  onPublishHandler: Function;
  onAddHandler: Function;
}

export const StickyNoteWidget: React.FC<IStickyNoteWidget> = ({
  text,
  participant,
  onCloseHandler,
  onPublishHandler,
  onAddHandler,
}) => {
  const participantDisplayIdentity = useParticipantDisplayIdentity(participant);

  return (
    <Widget
      title="Sticky Note"
      classNames={styles.stickyNote}
      titleClassNames={styles.title}
      onCloseHandler={() => onCloseHandler()}
      onAddHandler={() => onAddHandler()}
    >
      <div>
        <div className={clsx('u-fontP2', styles.addedByText)}>Added by {participantDisplayIdentity}</div>
      </div>
    </Widget>
  );
};
