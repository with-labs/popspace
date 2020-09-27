import React, { RefObject, useState } from 'react';
import clsx from 'clsx';
import { Widget } from '../Widget/Widget';
import { Participant } from 'twilio-video';
import useParticipantDisplayIdentity from '../../withHooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';
import { useWidgetContext } from '../../withHooks/useWidgetContext/useWidgetContext';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { WidgetTypes } from '../../withComponents/WidgetProvider/widgetTypes';
import { LocationTuple } from '../../types';
import { Colors } from '../../constants/ColorEnum';

import styles from './StickyNoteWidget.module.css';
import { Button, ThemeProvider } from '@material-ui/core';
import { mandarin } from '../../theme/theme';

interface IStickyNoteData {
  text: string;
  isPublished: boolean;
  author: string;
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
  // TODO: there is a current fragility where if the the user who has added the
  // sticky note leaves the room, we loose their display name in the widget
  // right now the work around for this until we implment persistant users into the
  // the app is to just statsh the participantDisplayIdentity of the user when they
  // create the app in the widget data blob
  const { text, isPublished, author } = data;
  const { addWidget, updateWidgetData, removeWidget } = useWidgetContext();
  const {
    room: { localParticipant },
  } = useVideoContext();
  const [inputText, setInputText] = useState(text);
  const participantDisplayIdentity = useParticipantDisplayIdentity(participant);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  const handleAddNewStickyNote = () => {
    addWidget(WidgetTypes.StickyNote, localParticipant.sid, { isPublished: false, text: '' });
  };

  const handlePublish = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateWidgetData(id, { ...data, isPublished: true, text: inputText, author: participantDisplayIdentity });
  };

  const stickyNoteContent = isPublished ? (
    <div className={styles.displayText}>{text}</div>
  ) : (
    <form onSubmit={handlePublish}>
      <textarea
        className={clsx('u-fontP1', styles.textInput)}
        value={inputText}
        onChange={handleTextChange}
        placeholder="Type your note"
        autoFocus
      />

      <Button type="submit" className={styles.createNoteButton}>
        Add note
      </Button>
    </form>
  );

  const authorDisplay = isPublished ? (
    <div className={clsx('u-fontP2', styles.addedByText)}>Added by {author}</div>
  ) : null;

  const handleClose = () => {
    removeWidget(id);
  };

  return (
    <ThemeProvider theme={mandarin}>
      <Widget
        id={id}
        title="Sticky Note"
        classNames={styles.stickyNote}
        titleClassNames={styles.title}
        onCloseHandler={handleClose}
        onAddHandler={handleAddNewStickyNote}
        position={position}
        dragConstraints={dragConstraints}
      >
        <div className={styles.stickyNoteContainer}>
          {stickyNoteContent}
          {authorDisplay}
        </div>
      </Widget>
    </ThemeProvider>
  );
};
