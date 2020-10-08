import { Box, makeStyles, Typography } from '@material-ui/core';
import * as React from 'react';
import { useLocalParticipant } from '../../../../withHooks/useLocalParticipant/useLocalParticipant';
import useParticipantDisplayIdentity from '../../../../withHooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';
import { useSaveWidget } from '../useSaveWidget';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { AddStickyNoteButton } from './AddStickyNoteButton';
import { EditStickyNoteWidgetForm } from './EditStickyNoteWidgetForm';
import { StickyNoteWidgetState, StickyNoteWidgetData } from '../../../../types/room';
import { WidgetContent } from '../WidgetContent';

export interface IStickyNoteWidgetProps {
  state: StickyNoteWidgetState;
  /**
   * Called when the user hits the X to close the widget
   */
  onClose: () => void;
}

const useStyles = makeStyles((theme) => ({
  text: {
    maxHeight: 250,
    overflowY: 'auto',
    overflowWrap: 'anywhere',
    fontSize: theme.typography.pxToRem(14),
  },
  author: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: theme.palette.grey[500],
  },
}));

export const StickyNoteWidget: React.FC<IStickyNoteWidgetProps> = ({ state, onClose }) => {
  const classes = useStyles();

  const localParticipant = useLocalParticipant();
  const localDisplayName = useParticipantDisplayIdentity(localParticipant);

  const baseSaveWidget = useSaveWidget(state.id);
  // adds the author name to the data before saving
  const saveWidget = React.useCallback(
    (data: Omit<StickyNoteWidgetData, 'author'>) => {
      baseSaveWidget({
        ...data,
        author: localDisplayName,
      });
    },
    [baseSaveWidget, localDisplayName]
  );

  if (state.isDraft && state.participantSid === localParticipant.sid) {
    return (
      <StickyNoteFrame title="Add a Sticky Note" onClose={onClose} widgetId={state.id}>
        <EditStickyNoteWidgetForm initialValues={state.data} onSave={saveWidget} />
      </StickyNoteFrame>
    );
  }

  return (
    <StickyNoteFrame title="Sticky Note" onClose={onClose} widgetId={state.id}>
      <Typography paragraph className={classes.text}>
        {state.data.text}
      </Typography>
      <Typography variant="caption" className={classes.author}>
        Added by {state.data.author}
      </Typography>
    </StickyNoteFrame>
  );
};

const StickyNoteFrame: React.FC<{ title: string; onClose: () => any; widgetId: string }> = ({
  children,
  title,
  onClose,
  widgetId,
}) => (
  <WidgetFrame color="mandarin">
    <WidgetTitlebar title={title} onClose={onClose}>
      <AddStickyNoteButton parentId={widgetId} />
    </WidgetTitlebar>
    <WidgetContent>{children}</WidgetContent>
  </WidgetFrame>
);
