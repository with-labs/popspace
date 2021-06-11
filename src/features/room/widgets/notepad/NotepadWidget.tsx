import { makeStyles } from '@material-ui/core';
import * as React from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { WidgetContent } from '../WidgetContent';
import { useTranslation } from 'react-i18next';
import { WidgetResizeHandle } from '../WidgetResizeHandle';
import { WidgetScrollPane } from '../WidgetScrollPane';
import { WidgetType } from '../../../../roomState/types/widgets';
import { useWidgetContext } from '../useWidgetContext';
import { ThemeName } from '../../../../theme/theme';
import { useRoomStore } from '../../../../roomState/useRoomStore';
import CollaborativeQuill from '@withso/pegasus';
import { useCanvas } from '../../../../providers/canvas/CanvasProvider';
import { MAX_SIZE, MIN_SIZE, TITLEBAR_HEIGHT } from './constants';

import { CircularProgress } from '@material-ui/core';

export interface INotepadWidgetProps {}

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

export const NotepadWidget: React.FC<INotepadWidgetProps> = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const localUserId = useRoomStore((store) => store.api.getActiveUserId());
  const userDisplayName = useRoomStore(
    (store) => store.users[store.api.getActiveUserId()]?.participantState.displayName ?? ''
  );

  const { widget: state } = useWidgetContext<WidgetType.Notepad>();

  const startSize = useRoomStore(
    React.useCallback(
      (room) =>
        room.widgetPositions[state.widgetId]?.size ?? {
          width: MIN_SIZE.width,
          height: MIN_SIZE.height - TITLEBAR_HEIGHT,
        },
      [state.widgetId]
    )
  );

  const isOwnedByLocalUser = state.ownerId === localUserId;
  const [size, setSize] = React.useState(startSize);

  const spinner = (
    <div style={{ padding: '32px', margin: 'auto' }}>
      <CircularProgress size={32} />
    </div>
  );

  const canvas = useCanvas();
  React.useEffect(
    () =>
      canvas.observeSize(state.widgetId, 'widget', (newSize) => {
        setSize({
          width: newSize.width,
          height: newSize.height - TITLEBAR_HEIGHT,
        });
      }),
    [state.widgetId, canvas]
  );

  /*
    quillRef is an instance of MutableObjectRef<Quill>...
    but the Quill type should be an implementation detail here :(
    For now, instead of pulling in Quill or type definitions,
    just using an any.
  */
  const quillRef: any = React.useRef();
  const focusOnClick = () => {
    if (quillRef.current) {
      quillRef.current?.focus();
    }
  };

  return (
    <WidgetFrame
      color={ThemeName.Blueberry}
      minWidth={MIN_SIZE.width}
      minHeight={MIN_SIZE.height}
      maxWidth={MAX_SIZE.width}
      maxHeight={MAX_SIZE.height}
    >
      <WidgetTitlebar title={t('widgets.notepad.title')}></WidgetTitlebar>
      <WidgetContent disablePadding className={classes.content}>
        <WidgetScrollPane
          className={classes.scrollContainer}
          title={isOwnedByLocalUser ? (t('widgets.stickyNote.doubleClickEdit') as string) : undefined}
          onClick={focusOnClick}
          style={{ cursor: 'pointer' }}
        >
          <div className="notepad_selector">
            <CollaborativeQuill
              quillRef={quillRef}
              spinner={spinner}
              id={`__notepad_${state.widgetId}`}
              host={process.env.REACT_APP_PEGASUS_SOCKET_HOST}
              docId={state.widgetId}
              docCollection="documents"
              userDisplayName={userDisplayName}
              height={size.height}
              width={size.width}
            />
          </div>
        </WidgetScrollPane>
      </WidgetContent>
      <WidgetResizeHandle />
    </WidgetFrame>
  );
};
