import React, { ChangeEvent } from 'react';
import { Checkbox, makeStyles, FormControlLabel } from '@material-ui/core';
import { Positions } from '../../constants/PositionEnum';

const useLabelStyles = makeStyles({
  label: {
    color: 'var(--color-ink)',
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '22px',
  },
});

export interface ICheckboxProps {
  className?: string;
  label: string | React.ReactNode;
  checked: boolean;
  onChange: (event: ChangeEvent, checked: boolean) => void;
  labelPlacement?: Positions;
  disabled?: boolean;
  ariaLabelText?: string;
  name?: string;
}

/**
 * Extends the Checkbox into a field with a label
 */
export const CheckboxField: React.FC<ICheckboxProps> = (props) => {
  const {
    className,
    label: labelText,
    checked,
    onChange,
    labelPlacement: labelPosition = Positions.END,
    disabled: isDisabled = false,
    ariaLabelText,
    name: checkboxName,
  } = props;

  const labelClasses = useLabelStyles();

  return (
    <div className={className}>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={onChange}
            name={checkboxName}
            inputProps={{ 'aria-label': ariaLabelText }}
          />
        }
        disabled={isDisabled}
        label={labelText}
        labelPlacement={labelPosition}
        classes={labelClasses}
      />
    </div>
  );
};
