import React from 'react';
import { Checkbox, makeStyles, FormControlLabel } from '@material-ui/core';
import { Positions } from '../../constants/PositionEnum';
import { ReactComponent as Checked } from './images/Checkbox.svg';
import { ReactComponent as Unchecked } from './images/Unchecked.svg';

const labelStlyes = makeStyles({
  label: {
    color: 'var(--color-ink)',
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '22px',
  },
});

interface ICheckBox {
  className?: string;
  labelText: string;
  checked: boolean;
  onClickHandler: (event: object) => void;
  labelPosition?: Positions;
  isDisabled?: boolean;
  ariaLabelText?: string;
}

export const CheckBox: React.FC<ICheckBox> = (props) => {
  const {
    className,
    labelText,
    checked,
    onClickHandler,
    labelPosition = Positions.END,
    isDisabled = false,
    ariaLabelText,
  } = props;

  const labelClasses = labelStlyes();
  return (
    <div className={className}>
      <FormControlLabel
        control={
          <Checkbox
            icon={<Unchecked />}
            checkedIcon={<Checked />}
            checked={checked}
            onChange={onClickHandler}
            name="checkbox"
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
