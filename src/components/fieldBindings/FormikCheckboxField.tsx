import * as React from 'react';
import { FieldHookConfig, useField } from 'formik';
import { CheckboxField, ICheckboxFieldProps } from '../CheckboxField/CheckboxField';

export type FormikCheckboxFieldProps = FieldHookConfig<boolean> &
  Omit<ICheckboxFieldProps, 'value' | 'onChange' | 'checked'>;

export const FormikCheckboxField: React.FC<FormikCheckboxFieldProps> = ({ validate, ...props }) => {
  const [field] = useField({ validate, ...props });

  // TODO: error state - is error state needed for a boolean field?
  return <CheckboxField {...field} {...(props as any)} />;
};
