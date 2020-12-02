import * as React from 'react';
import { Form, Formik } from 'formik';
import { FormikSubmitButton } from '../../../../components/fieldBindings/FormikSubmitButton';
import { LinkWidgetData } from '../../../../types/room';
import { makeStyles, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { FormikBorderlessTextarea } from '../../../../components/fieldBindings/FormikBorderlessTextarea';
import { useGetLinkData } from './useGetLinkData';

export interface IEditLinkWidgetFormProps {
  onSave: (data: LinkWidgetData) => any;
  initialValues?: LinkWidgetData;
}

const EMPTY_VALUES: LinkWidgetData = {
  title: '',
  url: '',
};

function validateUrl(url: string, translate: TFunction) {
  try {
    // will throw for an invalid url
    new URL(url.trim());
  } catch (err) {
    return translate('widgets.link.errorInvalidUrl');
  }
}

const useStyles = makeStyles((theme) => ({
  form: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  textarea: {
    flex: '1 1 100px',
    width: '100%',
    resize: 'none',
    padding: 0,
  },
}));

export const EditLinkWidgetForm: React.FC<IEditLinkWidgetFormProps> = ({ initialValues = EMPTY_VALUES, onSave }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const getLinkData = useGetLinkData();
  const handleSave = React.useCallback(
    async (values: LinkWidgetData) => {
      const data = await getLinkData(values.url);
      onSave(data);
    },
    [getLinkData, onSave]
  );

  return (
    <Formik initialValues={initialValues} onSubmit={handleSave} validateOnMount>
      <Form className={classes.form}>
        <FormikBorderlessTextarea
          name="url"
          placeholder={t('widgets.link.urlLabel')}
          validate={(url) => validateUrl(url, t)}
          required
          className={classes.textarea}
          autoFocus
          // error will display inside submit button (showErrorInside)
          disableErrorState
        />
        <Box mt={1}>
          <FormikSubmitButton showErrorInside>{t('widgets.link.addBtn')}</FormikSubmitButton>
        </Box>
      </Form>
    </Formik>
  );
};
