import { makeStyles, Typography } from '@material-ui/core';
import * as React from 'react';
import { useSaveWidget } from '../useSaveWidget';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { AddStickyNoteButton } from './AddStickyNoteButton';
import { EditStickyNoteWidgetForm } from './EditStickyNoteWidgetForm';
import { WidgetContent } from '../WidgetContent';
import { useTranslation, Trans } from 'react-i18next';
import { WidgetResizeContainer } from '../WidgetResizeContainer';
import { WidgetResizeHandle } from '../WidgetResizeHandle';
import { Markdown } from '../../../../components/Markdown/Markdown';
import { WidgetScrollPane } from '../WidgetScrollPane';
import { StickyNoteWidgetShape } from '../../../../roomState/types/widgets';
import { useCurrentUserProfile } from '../../../../hooks/useCurrentUserProfile/useCurrentUserProfile';
import { WidgetAuthor } from '../WidgetAuthor';

export interface IStickyNoteWidgetProps {
  state: StickyNoteWidgetShape & { ownerId: string };
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
  typingPlaceholder: {
    color: theme.palette.grey[900],
    fontStyle: 'italic',
  },
}));

export const StickyNoteWidget: React.FC<IStickyNoteWidgetProps> = ({ state, onClose }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { user } = useCurrentUserProfile();
  const localUserId = user?.id;

  const saveWidget = useSaveWidget(state.widgetId);

  const isOwnedByLocalUser = state.ownerId === localUserId;

  if (!state.widgetState.text && isOwnedByLocalUser) {
    return (
      <StickyNoteFrame
        title={t('widgets.stickyNote.addWidgetTitle')}
        onClose={onClose}
        widgetId={state.widgetId}
        contentClassName={classes.content}
      >
        <EditStickyNoteWidgetForm initialValues={state.widgetState} onSave={saveWidget} />
      </StickyNoteFrame>
    );
  }

  return (
    <StickyNoteFrame
      title={t('widgets.stickyNote.publishedTitle')}
      onClose={onClose}
      widgetId={state.widgetId}
      contentClassName={classes.content}
      disableInitialSizing={!isOwnedByLocalUser}
    >
      <WidgetScrollPane className={classes.scrollContainer}>
        <Typography paragraph variant="body1" component="div" className={classes.text}>
          {state.widgetState.text ? (
            <Markdown>{state.widgetState.text}</Markdown>
          ) : (
            <span className={classes.typingPlaceholder}>
              <WidgetAuthor widgetId={state.widgetId} />
              {t('widgets.stickyNote.userIsTyping')}
            </span>
          )}
        </Typography>
      </WidgetScrollPane>
      <Typography variant="caption" className={classes.author}>
        <Trans i18nKey="widgets.stickyNote.addedBy">
          Added by <WidgetAuthor widgetId={state.widgetId} />
        </Trans>
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
  disableInitialSizing?: boolean;
}> = ({ children, title, onClose, widgetId, disablePadding, contentClassName, disableInitialSizing }) => (
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
      disableInitialSizing={disableInitialSizing}
    >
      <WidgetContent disablePadding={disablePadding}>{children}</WidgetContent>
      <WidgetResizeHandle />
    </WidgetResizeContainer>
  </WidgetFrame>
);
