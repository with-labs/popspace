import * as React from 'react';
import { Formik, Form } from 'formik';
import { FormikTextField } from '../fieldBindings/FormikTextField';
import { FormikSubmitButton } from '../fieldBindings/FormikSubmitButton';
import { Typography, BoxProps, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export type JoinRoomFormData = {
  username: string;
  password: string;
};

export interface IJoinRoomFormProps extends Omit<BoxProps, 'onSubmit'> {
  onSubmit: (data: JoinRoomFormData) => any;
}

export const JoinRoomForm: React.FC<IJoinRoomFormProps> = ({ onSubmit, ...props }) => {
  const { t } = useTranslation();

  return (
    <Box {...props}>
      <Formik onSubmit={onSubmit} initialValues={{ username: '', password: '' }}>
        <Form>
          <FormikTextField
            autoComplete="username"
            name="username"
            required
            label={t('pages.room.screenNameLabel')}
            margin="normal"
          />
          <FormikTextField
            type="password"
            autoComplete="currentPassword"
            name="password"
            required
            label={t('pages.room.roomPasswordLabel')}
            margin="normal"
          />
          <FormikSubmitButton>Join</FormikSubmitButton>
          <Typography variant="body2" style={{ marginTop: 16 }}>
            {t('pages.room.analyticsDisclaimer')}
          </Typography>
        </Form>
      </Formik>
    </Box>
  );
};
