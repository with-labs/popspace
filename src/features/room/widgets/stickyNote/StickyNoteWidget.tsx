import { makeStyles, Typography } from '@material-ui/core';
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
import { useTranslation } from 'react-i18next';

export interface IStickyNoteWidgetProps {
  state: StickyNoteWidgetState;
  /**
   * Called when the user hits the X to close the widget
   */
  onClose: () => void;
}

const useStyles = makeStyles((theme) => ({
  scrollContainer: {
    overflowY: 'auto',
    flex: 1,
  },
  text: {},
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

  if (state.isDraft && state.participantSid === localParticipant.sid) {
    return (
      <StickyNoteFrame
        title={t('widgets.stickyNote.addWidgetTitle')}
        onClose={onClose}
        widgetId={state.id}
        disablePadding
      >
        <EditStickyNoteWidgetForm initialValues={state.data} onSave={saveWidget} />
      </StickyNoteFrame>
    );
  }

  return (
    <StickyNoteFrame title={t('widgets.stickyNote.publishedTitle')} onClose={onClose} widgetId={state.id}>
      <div className={classes.scrollContainer}>
        <Typography paragraph variant="body1" className={classes.text}>
          {state.data.text}
        </Typography>
      </div>
      <Typography variant="caption" className={classes.author}>
        {t('widgets.stickyNote.addedBy', { author: state.data.author })}
      </Typography>
    </StickyNoteFrame>
  );
};

const StickyNoteFrame: React.FC<{ title: string; onClose: () => any; widgetId: string; disablePadding?: boolean }> = ({
  children,
  title,
  onClose,
  widgetId,
  disablePadding,
}) => (
  <WidgetFrame color="mandarin" widgetId={widgetId} minWidth={250} minHeight={120} maxWidth={600} maxHeight={600}>
    <WidgetTitlebar title={title} onClose={onClose}>
      <AddStickyNoteButton parentId={widgetId} />
    </WidgetTitlebar>
    <WidgetContent disablePadding={disablePadding}>{children}</WidgetContent>
  </WidgetFrame>
);
