import React, { ChangeEvent } from 'react';
import { Checkbox, makeStyles, FormControlLabel, Tooltip } from '@material-ui/core';
import { Positions } from '@constants/PositionEnum';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { ErrorOutlined } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  label: {
    color: 'inherit',
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '22px',
  },
  invalid: {
    color: theme.palette.error.contrastText,
  },
}));

export interface ICheckboxFieldProps {
  className?: string;
  label: string | React.ReactNode;
  checked: boolean;
  onChange: (event: ChangeEvent, checked: boolean) => void;
  labelPlacement?: Positions;
  disabled?: boolean;
  ariaLabelText?: string;
  name?: string;
  invalid?: boolean;
}

/**
 * Extends the Checkbox into a field with a label
 */
export const CheckboxField: React.FC<ICheckboxFieldProps> = (props) => {
  const {
    className,
    label: labelText,
    checked,
    onChange,
    labelPlacement: labelPosition = Positions.END,
    disabled: isDisabled = false,
    ariaLabelText,
    name: checkboxName,
    invalid,
  } = props;

  const classes = useStyles();

  return (
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
      label={
        invalid ? (
          <span>
            {labelText} <InvalidTooltip />
          </span>
        ) : (
          labelText
        )
      }
      labelPlacement={labelPosition}
      classes={{
        label: classes.label,
      }}
      className={clsx(invalid && classes.invalid, className)}
    />
  );
};

const InvalidTooltip = () => {
  const { t } = useTranslation();

  return (
    <Tooltip title={t('error.messages.checkboxRequired') as string}>
      <ErrorOutlined />
    </Tooltip>
  );
};
