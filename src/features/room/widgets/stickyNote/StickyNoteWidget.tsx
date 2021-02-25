import { makeStyles, Typography } from '@material-ui/core';
import * as React from 'react';
import { useSaveWidget } from '../useSaveWidget';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { EditStickyNoteWidgetForm } from './EditStickyNoteWidgetForm';
import { WidgetContent } from '../WidgetContent';
import { useTranslation } from 'react-i18next';
import { WidgetResizeContainer } from '../WidgetResizeContainer';
import { WidgetResizeHandle } from '../WidgetResizeHandle';
import { Markdown } from '../../../../components/Markdown/Markdown';
import { WidgetScrollPane } from '../WidgetScrollPane';
import { StickyNoteWidgetState, WidgetType } from '../../../../roomState/types/widgets';
import { useCurrentUserProfile } from '../../../../hooks/useCurrentUserProfile/useCurrentUserProfile';
import { WidgetAuthor } from '../WidgetAuthor';
import { useWidgetContext } from '../useWidgetContext';
import { StickyNoteMenu } from './StickyNoteMenu';
import { ResizeContainerImperativeApi, useResizeContext } from '../../../../components/ResizeContainer/ResizeContainer';

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

  const resizeContainerRef = React.useRef<ResizeContainerImperativeApi>(null);

  const { widget: state } = useWidgetContext<WidgetType.StickyNote>();

  const { user } = useCurrentUserProfile();
  const localUserId = user?.id;

  const isOwnedByLocalUser = state.ownerId === localUserId;

  const [editing, setEditing] = React.useState(false);

  const doSave = useSaveWidget(state.widgetId);

  const saveWidget = (data: StickyNoteWidgetState) => {
    doSave(data);
    setEditing(false);
  };

  const startEditing = () => {
    setEditing(true);
  };

  const isEditMode = editing || (!state.widgetState.text && isOwnedByLocalUser);

  return (
    <WidgetFrame color="mandarin">
      <WidgetTitlebar
        title={editing ? t('widgets.stickyNote.addWidgetTitle') : t('widgets.stickyNote.publishedTitle')}
        disableRemove
      >
        <StickyNoteMenu onEdit={isOwnedByLocalUser ? startEditing : undefined} />
      </WidgetTitlebar>
      <WidgetResizeContainer
        ref={resizeContainerRef}
        mode="free"
        minWidth={250}
        minHeight={isEditMode ? 250 : 80}
        maxWidth={600}
        maxHeight={800}
        defaultWidth={250}
        defaultHeight={250}
        className={classes.content}
        disableInitialSizing
      >
        <StickyNoteContent onSave={saveWidget} editing={isEditMode} setEditing={setEditing} />
        <WidgetResizeHandle />
      </WidgetResizeContainer>
    </WidgetFrame>
  );
};

const StickyNoteContent: React.FC<{
  onSave: (data: StickyNoteWidgetState) => void;
  editing: boolean;
  setEditing: (val: boolean) => void;
}> = ({ onSave, editing, setEditing }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { widget: state } = useWidgetContext<WidgetType.StickyNote>();

  const { remeasure } = useResizeContext();
  const saveWidget = (data: StickyNoteWidgetState) => {
    onSave(data);
    remeasure();
  };

  if (editing) {
    return (
      <WidgetContent>
        <EditStickyNoteWidgetForm initialValues={state.widgetState} onSave={saveWidget} editing={editing} />
      </WidgetContent>
    );
  }

  return (
    <WidgetContent enableTextSelection>
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
      <Typography variant="caption">
        {t('widgets.stickyNote.addedBy')}
        <WidgetAuthor />
      </Typography>
    </WidgetContent>
  );
};
