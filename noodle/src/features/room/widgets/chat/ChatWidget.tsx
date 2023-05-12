import client from '@api/client';
import { WidgetType } from '@api/roomState/types/widgets';
import { useRoomStore } from '@api/useRoomStore';
import { FormikTextField } from '@components/fieldBindings/FormikTextField';
import { Box, Link, makeStyles, Typography } from '@material-ui/core';
import { Form, Formik, FormikHelpers } from 'formik';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

import { ThemeName } from '../../../../theme/theme';
import { useWidgetContext } from '../useWidgetContext';
import { WidgetContent } from '../WidgetContent';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetScrollPane } from '../WidgetScrollPane';
import { WidgetEditableTitlebar } from '../WidgetEditableTitlebar';
import { MAX_SIZE, MIN_SIZE } from './constants';
import ChatBubbleImg from './images/chat_placeholder.png';
import { ChatMenu } from './menu/ChatMenu';
import { Message } from './Message';
import { Analytics } from '@analytics/Analytics';

const ANALYTICS_ID = 'chat_widget';

const MAX_MSG_SIZE = 1000;
const MIN_SHOW_WARINING = MAX_MSG_SIZE * 0.1;
const AUTO_SCROLL_DELTA = 10;

export interface IChatWidgetProps {}

const validationSchema = Yup.object().shape({
  message: Yup.string().required('').min(1).max(MAX_MSG_SIZE),
});

export type ChatFormData = {
  message: string;
};

const EMPTY_VALUES: ChatFormData = {
  message: '',
};

const useStyles = makeStyles((theme) => ({
  chatArea: {
    height: '100%',
  },
  bubbleImg: {
    height: 76,
    width: 76,
    marginBottom: theme.spacing(2),
  },
  instructionsText: {
    color: theme.palette.brandColors.slate.ink,
    width: 200,
    textAlign: 'center',
  },
  loadMoreButton: {
    color: theme.palette.brandColors.slate.ink,
    marginBottom: theme.spacing(1),
  },
}));

export const ChatWidget: React.FC<IChatWidgetProps> = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const roomId = useRoomStore((store) => store.id);
  const chatRef = React.useRef<HTMLDivElement>(null);
  const { widget: state, save } = useWidgetContext<WidgetType.Chat>();

  // if true, chat will auto advance to the next incoming message
  const [autoScrollChat, setAutoScrollChat] = React.useState(true);

  React.useEffect(() => {
    // if the user has the scroll bar at the bottom, we will update it
    if (chatRef?.current && autoScrollChat) {
      chatRef.current?.scrollTo(0, chatRef.current?.scrollHeight);
    }
  }, [state, autoScrollChat]);

  // set up the scroll listener for the chat area
  React.useEffect(() => {
    const currChatRef = chatRef.current;

    function checkScrollPosition() {
      if (currChatRef) {
        // check to see if we have scrolled all the way to the bottom of the chat, enable the auto chat
        // advance
        if (currChatRef.scrollHeight - currChatRef.scrollTop >= currChatRef.clientHeight - AUTO_SCROLL_DELTA) {
          setAutoScrollChat(true);
        } else {
          setAutoScrollChat(false);
        }
      }
    }

    currChatRef?.addEventListener('scroll', checkScrollPosition);

    return () => {
      currChatRef?.removeEventListener('scroll', checkScrollPosition);
    };
  }, [setAutoScrollChat]);

  const onMessageSubmit = async (values: ChatFormData, actions: FormikHelpers<ChatFormData>) => {
    client.messages.sendMessage({
      widgetId: state.widgetId,
      content: values.message,
    });

    actions.resetForm({ values: EMPTY_VALUES });
    actions.setSubmitting(false);
  };

  const onLoadMoreMessages = () => {
    client.messages.getMoreMessages({
      widgetId: state.widgetId,
      lastMessageId: state.messages.messageList[0].id,
    });
  };

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
        defaultTitle={t('widgets.chat.name')}
        disableRemove
        setActiveColor={onColorPicked}
        activeColor={state.widgetState.color ?? ThemeName.Blueberry}
      >
        <ChatMenu />
      </WidgetEditableTitlebar>
      <WidgetContent enableTextSelection>
        <WidgetScrollPane ref={chatRef} className={classes.chatArea}>
          {state.messages.hasMoreToLoad && (
            <Box display="flex" alignItems="center" justifyContent="center">
              <Link
                style={{ textDecoration: 'none' }}
                className={classes.loadMoreButton}
                component="button"
                onClick={onLoadMoreMessages}
              >
                {t('widgets.chat.loadMoreButton')}
              </Link>
            </Box>
          )}
          {state?.messages.messageList.length === 0 && (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
              <img className={classes.bubbleImg} src={ChatBubbleImg} alt={t('widgets.chat.chatImgAltText')} />
              <Typography variant="body1" className={classes.instructionsText}>
                {t('widgets.chat.instuctions')}
              </Typography>
            </Box>
          )}
          {state?.messages.messageList.map((data, index) => {
            let isSameAuthor = false;

            if (index > 0) {
              isSameAuthor = state?.messages.messageList[index - 1].sender.id === data.sender.id;
            }

            return (
              <Message
                key={`${index}_${data.createdAt}`}
                name={data.sender.displayName}
                timestamp={data.createdAt}
                message={data.content}
                isSameAuthor={isSameAuthor}
              />
            );
          })}
        </WidgetScrollPane>
        <Box mt={2}>
          <Formik initialValues={EMPTY_VALUES} onSubmit={onMessageSubmit} validationSchema={validationSchema}>
            {({ values, submitForm }) => (
              <Form>
                <FormikTextField
                  onKeyDown={(event: any) => {
                    const keyCode = event.which || event.keyCode;
                    if (keyCode === 13 && !event.shiftKey) {
                      event.preventDefault();
                      submitForm();
                    }
                  }}
                  multiline
                  rowsMax="4"
                  name="message"
                  placeholder={t('widgets.chat.placeholder')}
                  required
                  inputProps={{
                    maxLength: MAX_MSG_SIZE,
                    autoComplete: 'off',
                  }}
                  InputProps={{
                    endAdornment: MAX_MSG_SIZE - values.message.length <= MIN_SHOW_WARINING && (
                      <Box textAlign="right" pl={1} alignSelf="flex-end">
                        <Typography variant="body2">
                          {MAX_MSG_SIZE - values.message.length}/{MAX_MSG_SIZE}
                        </Typography>
                      </Box>
                    ),
                  }}
                />
              </Form>
            )}
          </Formik>
        </Box>
      </WidgetContent>
    </WidgetFrame>
  );
};
