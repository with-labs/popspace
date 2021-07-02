import { Box, makeStyles } from '@material-ui/core';
import * as React from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { WidgetContent } from '../WidgetContent';
import { useTranslation } from 'react-i18next';
import { WidgetScrollPane } from '../WidgetScrollPane';
import { WidgetType } from '@api/roomState/types/widgets';
import { useWidgetContext } from '../useWidgetContext';
import { ThemeName } from '../../../../theme/theme';
import CollaborativeQuill from '@withso/unicorn';
import { MAX_SIZE, MIN_SIZE, TITLEBAR_HEIGHT } from './constants';
import { CircularProgress } from '@material-ui/core';
import { useLocalActor } from '@api/useLocalActor';
import { notepadRegistry } from './notepadRegistry';
import clsx from 'clsx';

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
  notepadContainer: {
    height: '100%',
    width: '100%',

    '& .ql-toolbar': {
      position: 'fixed',
      top: TITLEBAR_HEIGHT - 1,
      left: 0,
      right: 0,
      backgroundColor: theme.palette.common.white,
      zIndex: 10,
      fontFamily: theme.typography.fontFamily,
    },
    '& .ql-container': {
      marginTop: 40,
      fontFamily: theme.typography.fontFamily,
    },
  },
}));

export const NotepadWidget: React.FC<INotepadWidgetProps> = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const actor = useLocalActor();
  const userDisplayName = actor?.displayName;

  const { widget: state } = useWidgetContext<WidgetType.Notepad>();

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
        <WidgetScrollPane className={classes.scrollContainer} onClick={focusOnClick} style={{ cursor: 'pointer' }}>
          <div className={clsx('notepad_selector', classes.notepadContainer)}>
            <CollaborativeQuill
              quillRef={quillRef}
              spinner={
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  width="100%"
                  height="100%"
                  p={4}
                  margin="auto"
                >
                  <CircularProgress size={32} />
                </Box>
              }
              id={`__notepad_${state.widgetId}`}
              host={process.env.REACT_APP_UNICORN_SOCKET_HOST}
              docId={state.widgetId}
              docCollection="documents"
              userDisplayName={userDisplayName}
              height="100%"
              width="100%"
              initialData={state.widgetState.initialData}
            />
          </div>
        </WidgetScrollPane>
      </WidgetContent>
    </WidgetFrame>
  );
};
