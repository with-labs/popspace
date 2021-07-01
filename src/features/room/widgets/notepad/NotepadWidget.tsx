import { makeStyles } from '@material-ui/core';
import * as React from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { WidgetContent } from '../WidgetContent';
import { useTranslation } from 'react-i18next';
import { WidgetResizeHandle } from '../WidgetResizeHandle';
import { WidgetScrollPane } from '../WidgetScrollPane';
import { WidgetType } from '@api/roomState/types/widgets';
import { useWidgetContext } from '../useWidgetContext';
import { ThemeName } from '../../../../theme/theme';
import { useRoomStore } from '@api/useRoomStore';
import CollaborativeQuill from '@withso/unicorn';
import { useCanvas } from '../../../../providers/canvas/CanvasProvider';
import { MAX_SIZE, MIN_SIZE, TITLEBAR_HEIGHT } from './constants';

import { CircularProgress } from '@material-ui/core';
import { useIsMe } from '@api/useIsMe';
import { useLocalActor } from '@api/useLocalActor';
import { notepadRegistry } from './nodepadRegistry';

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
  const actor = useLocalActor();
  const userDisplayName = actor?.displayName;

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

  const isOwnedByLocalUser = useIsMe(state.creatorId);
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
  const quillRef = React.useRef<any>();
  const focusOnClick = () => {
    if (quillRef.current) {
      quillRef.current?.focus();
    }
  };

  // sync instance with global registry for dev tool uses
  React.useEffect(() => {
    if (quillRef.current) return notepadRegistry.register(state.widgetId, quillRef.current);
  }, [state.widgetId]);

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
              host={process.env.REACT_APP_UNICORN_SOCKET_HOST}
              docId={state.widgetId}
              docCollection="documents"
              userDisplayName={userDisplayName}
              height={size.height}
              width={size.width - 5}
              initialData={state.widgetState.initialData}
            />
          </div>
        </WidgetScrollPane>
      </WidgetContent>
      <WidgetResizeHandle />
    </WidgetFrame>
  );
};
