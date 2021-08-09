import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles, Box, Typography } from '@material-ui/core';
import { Form, Formik } from 'formik';
import { FormikTextField } from '@components/fieldBindings/FormikTextField';
import client from '@api/client';
import { useRoomStore } from '@api/useRoomStore';
import { WidgetType } from '@api/roomState/types/widgets';
import { WidgetFrame } from '../WidgetFrame';
import { WidgetTitlebar } from '../WidgetTitlebar';
import { WidgetContent } from '../WidgetContent';
import { ThemeName } from '../../../../theme/theme';
import { MAX_SIZE, MIN_SIZE } from './constants';
import { useWidgetContext } from '../useWidgetContext';
import { Message } from './Message';

const MAX_MSG_SIZE = 280;

export interface IChatWidgetProps {}

export type ChatFormData = {
  message: string;
};

const EMPTY_VALUES: ChatFormData = {
  message: '',
};

const useStyles = makeStyles((theme) => ({}));

export const ChatWidget: React.FC<IChatWidgetProps> = () => {
  const { t } = useTranslation();
  const roomId = useRoomStore((store) => store.id);
  const { widget: state, save } = useWidgetContext<WidgetType.Chat>();

  const onMessageSubmit = async (values: ChatFormData) => {
    await client.messages.sendMessage({
      widgetId: state.widgetId,
      message: 'hello from the client',
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
      <WidgetTitlebar title={t('widgets.chat.name')} disableRemove />
      <WidgetContent>
        <Box flexGrow="1">
          <Message name="name" timestamp="time" message="temp msg" />
        </Box>
        <Formik initialValues={EMPTY_VALUES} onSubmit={onMessageSubmit}>
          {({ values }) => (
            <Form>
              <FormikTextField
                name="message"
                placeholder={t('widgets.chat.placeholder')}
                required
                maxLength={MAX_MSG_SIZE}
              />
              <Box textAlign="right" mt={1}>
                <Typography variant="body2">
                  {MAX_MSG_SIZE - values.message.length}/{MAX_MSG_SIZE}
                </Typography>
              </Box>
            </Form>
          )}
        </Formik>
      </WidgetContent>
    </WidgetFrame>
  );
};
