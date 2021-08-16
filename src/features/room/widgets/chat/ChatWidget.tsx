import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles, Box, Typography, Link } from '@material-ui/core';
import { Form, Formik, FormikHelpers } from 'formik';
import { FormikTextField } from '@components/fieldBindings/FormikTextField';
import client from '@api/client';
import { useRoomStore } from '@api/useRoomStore';
import { WidgetType } from '@api/roomState/types/widgets';
import * as Yup from 'yup';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { WidgetContent } from '../WidgetContent';
import { WidgetScrollPane } from '../WidgetScrollPane';
import { ThemeName } from '../../../../theme/theme';
import { MAX_SIZE, MIN_SIZE } from './constants';
import { useWidgetContext } from '../useWidgetContext';
import { Message } from './Message';
import { ChatMenu } from './menu/ChatMenu';

import ChatBubbleImg from './images/chat_placeholder.png';

const MAX_MSG_SIZE = 1000;
const MIN_SHOW_WARINING = MAX_MSG_SIZE * 0.1;

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
        if (currChatRef.scrollHeight - currChatRef.scrollTop === currChatRef.clientHeight) {
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

  return (
    <WidgetFrame
      color={ThemeName.Blueberry}
      minWidth={MIN_SIZE.width}
      minHeight={MIN_SIZE.height}
      maxWidth={MAX_SIZE.width}
      maxHeight={MAX_SIZE.height}
    >
      <WidgetTitlebar title={t('widgets.chat.name')} disableRemove>
        <ChatMenu />
      </WidgetTitlebar>
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
              isSameAuthor = state?.messages.messageList[index - 1].senderId === data.senderId;
            }

            return (
              <Message
                key={`${index}_${data.createdAt}`}
                name={data.senderDisplayName}
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
                    autocomplete: 'off',
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
