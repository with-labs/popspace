import { makeStyles, Box } from '@material-ui/core';
import { Form, Formik } from 'formik';
import * as React from 'react';
import { FormikSubmitButton } from '../../../../withComponents/fieldBindings/FormikSubmitButton';
import { StickyNoteWidgetData } from '../../../../types/room';
import { useTranslation } from 'react-i18next';
import { FormikBorderlessTextarea } from '../../../../withComponents/fieldBindings/FormikBorderlessTextarea';

type RequiredStickyNoteData = Omit<StickyNoteWidgetData, 'author'>;

export interface IEditStickyNoteWidgetFormProps {
  onSave: (data: RequiredStickyNoteData) => any;
  initialValues: RequiredStickyNoteData;
}

const EMPTY_VALUES: RequiredStickyNoteData = {
  text: '',
};

const useStyles = makeStyles((theme) => ({
  form: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  textarea: {
    flex: `1 1 160px`,
    width: '100%',
    resize: 'none',
    padding: 0,
  },
}));

export const EditStickyNoteWidgetForm: React.FC<IEditStickyNoteWidgetFormProps> = ({
  initialValues = EMPTY_VALUES,
  onSave,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Formik initialValues={initialValues} onSubmit={onSave}>
      <Form className={classes.form}>
        <FormikBorderlessTextarea
          required
          name="text"
          placeholder={t('widgets.stickyNote.textPlaceholder')}
          className={classes.textarea}
          autoFocus
          disableErrorState
        />
        <Box mt={1}>
          <FormikSubmitButton>{t('widgets.stickyNote.addBtn')}</FormikSubmitButton>
        </Box>
      </Form>
    </Formik>
  );
};
