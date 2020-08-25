import React, { RefObject, useState } from 'react';
import clsx from 'clsx';
import { Widget } from '../Widget/Widget';
import { Participant } from 'twilio-video';
import useParticipantDisplayIdentity from '../../withHooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';
import { useWidgetContext } from '../../withHooks/useWidgetContext/useWidgetContext';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { WidgetTypes } from '../../withComponents/WidgetProvider/widgetTypes';
import { LocationTuple } from '../../types';

import styles from './StickyNoteWidget.module.css';

interface IStickyNoteData {
  text: string;
  isPublished: boolean;
  initialOffset?: number;
}
interface IStickyNoteWidget {
  id: string;
  participant?: Participant;
  position?: LocationTuple;
  dragConstraints: RefObject<Element>;
  data: IStickyNoteData;
}

export const StickyNoteWidget: React.FC<IStickyNoteWidget> = ({ id, position, participant, dragConstraints, data }) => {
  // get the needed data from the data object
  const { text, isPublished, initialOffset } = data;
  const { addWidget, updateWidgetData, removeWidget } = useWidgetContext();
  const {
    room: { localParticipant },
  } = useVideoContext();
  const [inputText, setInputText] = useState(text);
  const participantDisplayIdentity = useParticipantDisplayIdentity(participant);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  const handlePublish = () => {
    updateWidgetData(id, { isPublished: true, text: inputText, initialOffset });
  };

  const handleAddNewStickyNote = () => {
    addWidget(WidgetTypes.StickyNote, localParticipant.sid, { isPublished: false, text: '', initialOffset });
  };

  const stickyNoteContent = isPublished ? (
    <div className={styles.displayText}>{text}</div>
  ) : (
    <div>
      <textarea
        className={clsx('u-fontP1', styles.textInput)}
        value={inputText}
        onChange={handleTextChange}
        placeholder="Type your note"
        autoFocus
      />
      <button className={clsx('u-fontB1', styles.createNoteButton)} onClick={handlePublish}>
        Create Note
      </button>
    </div>
  );

  const authorDisplay = isPublished ? (
    <div className={clsx('u-fontP2', styles.addedByText)}>Added by {participantDisplayIdentity}</div>
  ) : null;

  const handleClose = () => {
    removeWidget(id);
  };

  return (
    <Widget
      id={id}
      title="Sticky Note"
      classNames={styles.stickyNote}
      titleClassNames={styles.title}
      onCloseHandler={handleClose}
      onAddHandler={handleAddNewStickyNote}
      position={position}
      dragConstraints={dragConstraints}
      initialOffset={initialOffset}
      type={WidgetTypes.StickyNote}
    >
      <div className={styles.stickyNoteContainer}>
        {stickyNoteContent}
        {authorDisplay}
      </div>
    </Widget>
  );
};
