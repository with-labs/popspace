import * as React from 'react';
import { FieldHookConfig, useField, useFormikContext } from 'formik';
import { TextField, TextFieldProps } from '@material-ui/core';

export type FormikTextFieldProps = FieldHookConfig<string> & Omit<TextFieldProps, 'value' | 'onChange'>;

/**
 * This component binds MUI's TextField to Formik, allowing you to use it as a
 * stand-alone component at any depth within a Formik component context. You can pass
 * all valid field configurations as props, including `validate` and `required`.
 */
export const FormikTextField: React.FC<FormikTextFieldProps> = ({ helperText, validate, ...props }) => {
  // validate is pulled out separately so that we don't pass it to the TextField
  const [field, meta] = useField({ validate, ...props });
  const context = useFormikContext();

  // don't show an error unless the user has touched the field -
  // avoids things like required fields being in error state when the
  // form first mounts.
  // There's another rule too - if the form doesn't validate on blur
  // (like Signup or Signin forms), don't show validation
  // problems until after first submission.
  const readyToValidate = context.validateOnBlur || context.submitCount > 0;
  const shownError = readyToValidate && meta.touched && meta.error;

  return (
    <TextField
      {...field}
      // Unfortunately this component's props are really complex in TS and
      // fragile to work with, so just trusting that the proptypes enforce
      // the correct shape here.
      {...(props as any)}
      // replaces the helper text with an error message if one is shown.
      helperText={shownError || helperText}
      error={!!shownError}
    />
  );
};
