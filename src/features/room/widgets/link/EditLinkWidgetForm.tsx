import * as React from 'react';
import { Form, Formik } from 'formik';
import { FormikTextField } from '../../../../withComponents/fieldBindings/FormikTextField';
import { FormikSubmitButton } from '../../../../withComponents/fieldBindings/FormikSubmitButton';
import { LinkWidgetData } from '../../../../types/room';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

export interface IEditLinkWidgetFormProps {
  onSave: (data: LinkWidgetData) => any;
  initialValues?: LinkWidgetData;
}

const EMPTY_VALUES: LinkWidgetData = {
  title: 'Link',
  url: '',
};

function validateUrl(url: string, translate: TFunction) {
  if (!/^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/.test(url)) {
    return translate('error.messages.provideValidUrl');
  }
}

const useStyles = makeStyles((theme) => ({
  form: {
    width: '100%',
    height: '100%',
  },
}));

export const EditLinkWidgetForm: React.FC<IEditLinkWidgetFormProps> = ({ initialValues = EMPTY_VALUES, onSave }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Formik initialValues={initialValues} onSubmit={onSave} validateOnMount>
      <Form className={classes.form}>
        <FormikTextField name="title" label={t('widgets.link.titleLabel')} margin="normal" required autoFocus />
        <FormikTextField
          name="url"
          label={t('widgets.link.urlLabel')}
          margin="normal"
          validate={(url) => validateUrl(url, t)}
          required
        />
        <FormikSubmitButton>{t('widgets.link.addBtn')}</FormikSubmitButton>
      </Form>
    </Formik>
  );
};
