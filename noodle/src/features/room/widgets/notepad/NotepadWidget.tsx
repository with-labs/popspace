import { Analytics } from '@analytics/Analytics';
import { WidgetType } from '@api/roomState/types/widgets';
import { getServices } from '@api/services';
import { useLocalActor } from '@api/useLocalActor';
import { useRoomStore } from '@api/useRoomStore';
import { Box, CircularProgress, makeStyles } from '@material-ui/core';
import CollaborativeQuill from '@withso/unicorn';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeName } from '../../../../theme/theme';
import { useWidgetContext } from '../useWidgetContext';
import { WidgetContent } from '../WidgetContent';
import { WidgetEditableTitlebar } from '../WidgetEditableTitlebar';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetScrollPane } from '../WidgetScrollPane';
import { MAX_SIZE, MIN_SIZE, TITLEBAR_HEIGHT } from './constants';
import { notepadRegistry } from './notepadRegistry';

const ANALYTICS_ID = 'notepad_widget';
const UNICORN_URL = getServices().unicorn.ws;

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
  const roomId = useRoomStore((store) => store.id);

  const { widget: state, save } = useWidgetContext<WidgetType.Notepad>();

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

  const onTitleChanged = (newTitle: string) => {
    save({
      title: newTitle,
    });
    Analytics.trackEvent(`${ANALYTICS_ID}_change_widget_title`, newTitle, {
      title: newTitle,
      widgetId: state.widgetId,
      type: state.type,
      roomId,
    });
  };

  const onColorPicked = (color: ThemeName) => {
    save({
      color,
    });
    Analytics.trackEvent(`${ANALYTICS_ID}_change_widget_color`, color, {
      color,
      widgetId: state.widgetId,
      type: state.type,
      roomId,
    });
  };

  return (
    <WidgetFrame
      color={state.widgetState.color ?? ThemeName.Blueberry}
      minWidth={MIN_SIZE.width}
      minHeight={MIN_SIZE.height}
      maxWidth={MAX_SIZE.width}
      maxHeight={MAX_SIZE.height}
    >
      <WidgetEditableTitlebar
        title={state.widgetState.title}
        onTitleChanged={onTitleChanged}
        defaultTitle={t('widgets.notepad.title')}
        setActiveColor={onColorPicked}
        activeColor={state.widgetState.color ?? ThemeName.Blueberry}
      ></WidgetEditableTitlebar>
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
              host={UNICORN_URL}
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
