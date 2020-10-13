import * as React from 'react';
import { Form, Formik } from 'formik';
import { FormikTextField } from '../../../../withComponents/fieldBindings/FormikTextField';
import { FormikSubmitButton } from '../../../../withComponents/fieldBindings/FormikSubmitButton';
import { LinkWidgetData } from '../../../../types/room';
import { makeStyles } from '@material-ui/core';

export interface IEditLinkWidgetFormProps {
  onSave: (data: LinkWidgetData) => any;
  initialValues?: LinkWidgetData;
}

const EMPTY_VALUES: LinkWidgetData = {
  title: 'Link',
  url: '',
};

function validateUrl(url: string) {
  if (!/^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/.test(url)) {
    return 'Please provide a valid URL.';
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

  return (
    <Formik initialValues={initialValues} onSubmit={onSave} validateOnMount>
      <Form className={classes.form}>
        <FormikTextField name="title" label="Title" margin="normal" required autoFocus />
        <FormikTextField name="url" label="Url" margin="normal" validate={validateUrl} required />
        <FormikSubmitButton>Add a link</FormikSubmitButton>
      </Form>
    </Formik>
  );
};
