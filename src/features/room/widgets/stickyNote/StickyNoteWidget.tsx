import { makeStyles, Typography } from '@material-ui/core';
import * as React from 'react';
import { useLocalParticipant } from '../../../../hooks/useLocalParticipant/useLocalParticipant';
import useParticipantDisplayIdentity from '../../../../hooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';
import { useSaveWidget } from '../useSaveWidget';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { AddStickyNoteButton } from './AddStickyNoteButton';
import { EditStickyNoteWidgetForm } from './EditStickyNoteWidgetForm';
import { StickyNoteWidgetState, StickyNoteWidgetData } from '../../../../types/room';
import { WidgetContent } from '../WidgetContent';
import { useTranslation } from 'react-i18next';
import { WidgetResizeContainer } from '../WidgetResizeContainer';
import { WidgetResizeHandle } from '../WidgetResizeHandle';
import { Markdown } from '../../../../components/Markdown/Markdown';

export interface IStickyNoteWidgetProps {
  state: StickyNoteWidgetState;
  /**
   * Called when the user hits the X to close the widget
   */
  onClose: () => void;
}

const useStyles = makeStyles((theme) => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
  },
  scrollContainer: {
    overflowY: 'auto',
    flex: 1,
  },
  text: {
    whiteSpace: 'pre-wrap',
    '& pre': {
      overflowX: 'auto',
    },
  },
  author: {
    flex: '0 0 auto',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: theme.palette.grey[900],
  },
}));

export const StickyNoteWidget: React.FC<IStickyNoteWidgetProps> = ({ state, onClose }) => {
  const classes = useStyles();
  const { t } = useTranslation();

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

  if (state.isDraft && state.participantSid === localParticipant?.sid) {
    return (
      <StickyNoteFrame
        title={t('widgets.stickyNote.addWidgetTitle')}
        onClose={onClose}
        widgetId={state.id}
        contentClassName={classes.content}
      >
        <EditStickyNoteWidgetForm initialValues={state.data} onSave={saveWidget} />
      </StickyNoteFrame>
    );
  }

  return (
    <StickyNoteFrame
      title={t('widgets.stickyNote.publishedTitle')}
      onClose={onClose}
      widgetId={state.id}
      contentClassName={classes.content}
    >
      <div className={classes.scrollContainer}>
        <Typography paragraph variant="body1" component="div" className={classes.text}>
          <Markdown>{state.data.text}</Markdown>
        </Typography>
      </div>
      <Typography variant="caption" className={classes.author}>
        {t('widgets.stickyNote.addedBy', { author: state.data.author })}
      </Typography>
    </StickyNoteFrame>
  );
};

const StickyNoteFrame: React.FC<{
  title: string;
  onClose: () => any;
  widgetId: string;
  disablePadding?: boolean;
  contentClassName?: string;
}> = ({ children, title, onClose, widgetId, disablePadding, contentClassName }) => (
  <WidgetFrame color="mandarin" widgetId={widgetId}>
    <WidgetTitlebar title={title} onClose={onClose}>
      <AddStickyNoteButton parentId={widgetId} />
    </WidgetTitlebar>
    <WidgetResizeContainer
      widgetId={widgetId}
      mode="free"
      minWidth={250}
      minHeight={80}
      maxWidth={600}
      maxHeight={800}
      className={contentClassName}
    >
      <WidgetContent disablePadding={disablePadding}>{children}</WidgetContent>
      <WidgetResizeHandle />
    </WidgetResizeContainer>
  </WidgetFrame>
);
