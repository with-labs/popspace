import * as React from 'react';
import { FieldHookConfig, useField } from 'formik';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';

export type FormikBorderlessTextareaProps = FieldHookConfig<string> &
  Omit<React.HTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> & {
    disableErrorState?: boolean;
  };

const useStyles = makeStyles((theme) => ({
  root: {
    border: 'none',
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.pxToRem(16),
    '&:focus': {
      // FIXME: need focus state.
      outline: 'none',
    },
    padding: theme.spacing(2),
  },
  error: {
    backgroundColor: theme.palette.error.light,
  },
}));

/**
 * This component binds a textarea without a border to Formik, allowing you to use it as a
 * stand-alone component at any depth within a Formik component context. You can pass
 * all valid field configurations as props, including `validate` and `required`.
 */
export const FormikBorderlessTextarea: React.FC<FormikBorderlessTextareaProps> = ({
  validate,
  className,
  disableErrorState,
  ...props
}) => {
  const classes = useStyles();
  // validate is pulled out separately so that we don't pass it to the TextField
  const [field, meta] = useField({ validate, ...props });

  // don't show an error unless the user has touched the field -
  // avoids things like required fields being in error state when the
  // form first mounts.
  const shownError = meta.touched && meta.error;

  return (
    <textarea
      {...field}
      {...(props as any)}
      className={clsx(classes.root, shownError && !disableErrorState && classes.error, className)}
    />
  );
};
