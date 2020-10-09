import * as React from 'react';
import { Form, Formik } from 'formik';
import { FormikTextField } from '../../../../withComponents/fieldBindings/FormikTextField';
import { FormikSubmitButton } from '../../../../withComponents/fieldBindings/FormikSubmitButton';
import { LinkWidgetData } from '../../../../types/room';

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

export const EditLinkWidgetForm: React.FC<IEditLinkWidgetFormProps> = ({ initialValues = EMPTY_VALUES, onSave }) => {
  return (
    <Formik initialValues={initialValues} onSubmit={onSave} validateOnMount>
      <Form>
        <FormikTextField name="title" label="Title" margin="normal" required autoFocus />
        <FormikTextField name="url" label="Url" margin="normal" validate={validateUrl} required />
        <FormikSubmitButton>Add a link</FormikSubmitButton>
      </Form>
    </Formik>
  );
};
