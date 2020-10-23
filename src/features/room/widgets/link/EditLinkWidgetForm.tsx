import * as React from 'react';
import { Form, Formik } from 'formik';
import { FormikTextField } from '../../../../withComponents/fieldBindings/FormikTextField';
import { FormikSubmitButton } from '../../../../withComponents/fieldBindings/FormikSubmitButton';
import { LinkWidgetData } from '../../../../types/room';
import { makeStyles, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { FormikBorderlessTextarea } from '../../../../withComponents/fieldBindings/FormikBorderlessTextarea';

export interface IEditLinkWidgetFormProps {
  onSave: (data: LinkWidgetData) => any;
  initialValues?: LinkWidgetData;
}

const EMPTY_VALUES: LinkWidgetData = {
  title: '',
  url: '',
};

function validateUrl(url: string, translate: TFunction) {
  if (!/^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/.test(url.trim())) {
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
  },
}));

export const EditLinkWidgetForm: React.FC<IEditLinkWidgetFormProps> = ({ initialValues = EMPTY_VALUES, onSave }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const handleSave = (values: LinkWidgetData) => {
    // for now we just use the URL as the title, until we can do some basic web scraping.
    onSave({
      url: values.url.trim(),
      title: values.url.trim(),
    });
  };

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
        <Box mt={1} mx={2} mb={2}>
          <FormikSubmitButton showErrorInside>{t('widgets.link.addBtn')}</FormikSubmitButton>
        </Box>
      </Form>
    </Formik>
  );
};
