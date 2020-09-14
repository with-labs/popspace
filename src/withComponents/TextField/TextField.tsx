import React from 'react';
import { OutlinedInput, InputLabel, FormControl, makeStyles, FormHelperText } from '@material-ui/core';

// styles for the text field
const labelSyles = makeStyles((theme) => ({
  formControl: {
    transform: 'translate(0, 0) scale(1)',
    position: 'relative',
    paddingBottom: 12,
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: '13px',
    lineHeight: '16px',
  },
}));

// styles for the actual input
const inputStyles = makeStyles((theme) => ({
  input: {
    '&::placeholder': {
      color: 'var(--color-slate-bold)',
      opacity: '0.5',
    },
    padding: 14,
    fontSize: '16px',
    lineHeight: '19px',
  },
}));

interface ITextField {
  id: string;
  labelText?: string;
  placeholderText?: string;
  value: any;
  onChangeHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  hasError?: boolean;
  helperText?: string;
  ariaDescribedbyText?: string;
  type?: string;
  isRequired?: boolean;
}

// Branded textfield material ui component. Doing this instead of
// using the default material ui allows us to customize how text input
// works/ layedout/ colors work and get all the nice things from material ui
export const TextField: React.FC<ITextField> = (props) => {
  const {
    id,
    labelText,
    placeholderText,
    value,
    onChangeHandler,
    hasError = false,
    helperText,
    ariaDescribedbyText,
    type,
    isRequired = false,
    className,
  } = props;

  const helperTextId = helperText && id ? `${id}-helper-text` : undefined;
  const inputLabelId = labelText && id ? `${id}-label` : undefined;

  // get our material ui override styles
  const labelClasses = labelSyles();
  const inputClasses = inputStyles();

  const label = labelText ? (
    <InputLabel id={inputLabelId} classes={labelClasses} htmlFor={id} shrink={true} disableAnimation={true}>
      {labelText && isRequired ? `${labelText} *` : labelText}
    </InputLabel>
  ) : null;

  return (
    <div className={className}>
      <FormControl fullWidth>
        {label}
        <OutlinedInput
          id={id}
          aria-describedby={ariaDescribedbyText}
          autoComplete="off"
          classes={inputClasses}
          value={value}
          onChange={onChangeHandler}
          placeholder={placeholderText}
          type={type}
          required={isRequired}
          error={hasError}
        />
        {helperText && (
          <FormHelperText id={helperTextId} error={hasError}>
            {helperText}
          </FormHelperText>
        )}
      </FormControl>
    </div>
  );
};
