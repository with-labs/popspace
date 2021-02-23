import { Button, ButtonProps, makeStyles, CircularProgress } from '@material-ui/core';
import { useFormikContext } from 'formik';
import * as React from 'react';

export type FormikSubmitButtonProps = ButtonProps & {
  /**
   * Show any validation error message inside the button as text
   * when the form is invalid. Only shows the first error if there are
   * multiples, with no guaranteed order. Recommended to only use this
   * if the form has just 1 field.
   */
  showErrorInside?: boolean;
  activeOnChange?: boolean;
};

const useStyles = makeStyles((theme) => ({
  loading: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.focusRings.create(theme.palette.grey[500]),
    color: theme.palette.grey[500],
  },
  spinner: {
    margin: 'auto',
  },
}));

/**
 * This component streamlines the process of creating a submit button for a Formik form
 * by binding it directly to the form context, so it prevents submission of an invalid
 * form and resubmission while the form submit is still pending.
 */
export const FormikSubmitButton: React.FC<FormikSubmitButtonProps> = ({
  disabled,
  children,
  showErrorInside,
  activeOnChange,
  ...props
}) => {
  const classes = useStyles();
  const context = useFormikContext();
  const formChanged = activeOnChange ? context.dirty : true;

  // this assumes the error shape is flat... might not be good as we go on...
  // to compensate for uncertainty, we call .toString() below before interpolating into JSX
  const firstValidationError = Object.values(context.errors)[0] as any | undefined;
  const showError =
    !!Object.values(context.touched).length && !context.isValid && firstValidationError && showErrorInside;

  // loading state - not natively supported by MUI (yet) but it makes sense to put here.
  if (context.isSubmitting) {
    return (
      <Button type="submit" disabled className={classes.loading} {...props}>
        <CircularProgress size={22} className={classes.spinner} />
      </Button>
    );
  }

  /**
   * Support multiple validation approaches -
   * 1. If validation happens on change/blur, we prevent submission of invalid data.
   * 2. If validation does NOT happen on change/blur, we allow the user to attempt to submit
   *    and then validate their submission afterward.
   */
  const isInvalidAndPreventInvalidSubmission = !context.isValid && context.validateOnBlur === true;

  return (
    <Button type="submit" disabled={isInvalidAndPreventInvalidSubmission || !formChanged || disabled} {...props}>
      {showError ? firstValidationError.toString() : children}
    </Button>
  );
};
