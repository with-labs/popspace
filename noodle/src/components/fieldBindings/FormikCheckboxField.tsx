import * as React from 'react';
import { FieldHookConfig, useField, useFormikContext } from 'formik';
import { CheckboxField, ICheckboxFieldProps } from '../CheckboxField/CheckboxField';

export type FormikCheckboxFieldProps = FieldHookConfig<boolean> &
  Omit<ICheckboxFieldProps, 'value' | 'onChange' | 'checked'>;

export const FormikCheckboxField: React.FC<FormikCheckboxFieldProps> = ({ validate, ...props }) => {
  const [field, meta] = useField({ validate, ...props });
  const context = useFormikContext();

  const readyToValidate = context.validateOnBlur || context.submitCount > 0;

  return (
    <CheckboxField
      {...field}
      checked={field.checked === undefined && typeof field.value === 'boolean' ? field.value : !!field.checked}
      invalid={readyToValidate && !!meta.error}
      {...(props as any)}
    />
  );
};
