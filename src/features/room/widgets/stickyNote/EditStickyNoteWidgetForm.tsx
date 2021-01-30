import { makeStyles, Box } from '@material-ui/core';
import { Form, Formik } from 'formik';
import * as React from 'react';
import { FormikSubmitButton } from '../../../../components/fieldBindings/FormikSubmitButton';
import { useTranslation } from 'react-i18next';
import { FormikBorderlessTextarea } from '../../../../components/fieldBindings/FormikBorderlessTextarea';
import { Link } from '../../../../components/Link/Link';
import { StickyNoteWidgetState } from '../../../../roomState/types/widgets';

export interface IEditStickyNoteWidgetFormProps {
  onSave: (data: StickyNoteWidgetState) => any;
  initialValues: StickyNoteWidgetState;
  editing: boolean;
}

const EMPTY_VALUES: StickyNoteWidgetState = {
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
  cheatSheet: {
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.grey[900],
    textAlign: 'center',
  },
}));

export const EditStickyNoteWidgetForm: React.FC<IEditStickyNoteWidgetFormProps> = ({
  initialValues = EMPTY_VALUES,
  onSave,
  editing,
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
          <FormikSubmitButton>
            {editing ? t('widgets.stickyNote.saveBtn') : t('widgets.stickyNote.addBtn')}
          </FormikSubmitButton>
        </Box>
        <Box mt={1} textAlign="center">
          <Link to="https://www.markdownguide.org/cheat-sheet" newTab className={classes.cheatSheet}>
            {t('widgets.stickyNote.markdownCheatSheet')}
          </Link>
        </Box>
      </Form>
    </Formik>
  );
};
