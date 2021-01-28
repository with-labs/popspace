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
import { WidgetType } from '../../../../roomState/types/widgets';
import { useCurrentUserProfile } from '../../../../hooks/useCurrentUserProfile/useCurrentUserProfile';
import { WidgetAuthor } from '../WidgetAuthor';
import { useWidgetContext } from '../useWidgetContext';

export interface IStickyNoteWidgetProps {}

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

export const StickyNoteWidget: React.FC<IStickyNoteWidgetProps> = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { widget: state } = useWidgetContext<WidgetType.StickyNote>();

  const { user } = useCurrentUserProfile();
  const localUserId = user?.id;

  const saveWidget = useSaveWidget(state.widgetId);

  const isOwnedByLocalUser = state.ownerId === localUserId;

  if (!state.widgetState.text && isOwnedByLocalUser) {
    return (
      <StickyNoteFrame
        title={t('widgets.stickyNote.addWidgetTitle')}
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
              <WidgetAuthor />
              {t('widgets.stickyNote.userIsTyping')}
            </span>
          )}
        </Typography>
      </WidgetScrollPane>
      <Typography variant="caption" className={classes.author}>
        <Trans i18nKey="widgets.stickyNote.addedBy">
          Added by <WidgetAuthor />
        </Trans>
      </Typography>
    </StickyNoteFrame>
  );
};

const StickyNoteFrame: React.FC<{
  title: string;
  widgetId: string;
  disablePadding?: boolean;
  contentClassName?: string;
  disableInitialSizing?: boolean;
}> = ({ children, title, widgetId, disablePadding, contentClassName, disableInitialSizing }) => (
  <WidgetFrame color="mandarin">
    <WidgetTitlebar title={title}>
      <AddStickyNoteButton parentId={widgetId} />
    </WidgetTitlebar>
    <WidgetResizeContainer
      mode="free"
      minWidth={250}
      minHeight={80}
      maxWidth={600}
      maxHeight={800}
      className={contentClassName}
      disableInitialSizing={disableInitialSizing}
    >
      <WidgetContent disablePadding={disablePadding} enableTextSelection>
        {children}
      </WidgetContent>
      <WidgetResizeHandle />
    </WidgetResizeContainer>
  </WidgetFrame>
);
