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

interface IStickyNoteWidget {
  id: string;
  text: string;
  participant?: Participant;
  onCloseHandler: (event: MouseEvent) => void;
  position?: LocationTuple;
  dragConstraints: RefObject<Element>;
  isPublished: boolean;
  initialOffset?: number;
}

export const StickyNoteWidget: React.FC<IStickyNoteWidget> = ({
  id,
  position,
  text,
  participant,
  onCloseHandler,
  isPublished,
  dragConstraints,
  initialOffset = 0,
}) => {
  const { addWidget, updateWidgetData } = useWidgetContext();
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
      />
      <button className={clsx('u-fontB1', styles.createNoteButton)} onClick={handlePublish}>
        Create Note
      </button>
    </div>
  );

  const authorDisplay = isPublished ? (
    <div className={clsx('u-fontP2', styles.addedByText)}>Added by {participantDisplayIdentity}</div>
  ) : null;

  return (
    <Widget
      id={id}
      title="Sticky Note"
      classNames={styles.stickyNote}
      titleClassNames={styles.title}
      onCloseHandler={onCloseHandler}
      onAddHandler={handleAddNewStickyNote}
      position={position}
      dragConstraints={dragConstraints}
      initialOffset={initialOffset}
      type={WidgetTypes.StickyNote}
    >
      <div>
        {stickyNoteContent}
        {authorDisplay}
      </div>
    </Widget>
  );
};
