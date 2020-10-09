import { Button, ButtonProps } from '@material-ui/core';
import { useFormikContext } from 'formik';
import * as React from 'react';

export type FormikSubmitButtonProps = ButtonProps;

/**
 * This component streamlines the process of creating a submit button for a Formik form
 * by binding it directly to the form context, so it prevents submission of an invalid
 * form and resubmission while the form submit is still pending.
 */
export const FormikSubmitButton: React.FC<FormikSubmitButtonProps> = ({ disabled, ...props }) => {
  const context = useFormikContext();

  return <Button type="submit" disabled={context.isSubmitting || !context.isValid || disabled} {...props} />;
};
