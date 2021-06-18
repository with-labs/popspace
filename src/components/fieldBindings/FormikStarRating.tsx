import { StarRating, StarRatingProps } from '@components/StarRating/StarRating';
import { FieldHookConfig, useField, useFormikContext } from 'formik';
import * as React from 'react';

export type IFormikStarRatingProps = FieldHookConfig<number> & Omit<StarRatingProps, 'value' | 'onChange'>;

export const FormikStarRating: React.FC<IFormikStarRatingProps> = (props) => {
  const [field, meta] = useField(props);
  const formik = useFormikContext();

  return (
    <StarRating
      {...props}
      value={field.value}
      onChange={(starRating) => {
        formik.setFieldValue(field.name, starRating);
      }}
      onBlur={field.onBlur}
    />
  );
};
