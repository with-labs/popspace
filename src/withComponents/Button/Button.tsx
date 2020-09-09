import React from 'react';
import { Button as MaterialButton, makeStyles } from '@material-ui/core';
import { Colors } from '../../constants/ColorEnum';

export enum ButtonTypes {
  BUTTON = 'button',
  RESET = 'reset',
  SUBMIT = 'submit',
}

interface IButtonProps {
  buttonText: string;
  onClickHandler?: () => void;
  className?: string;
  type?: ButtonTypes;
  isDisabled?: boolean;
  buttonColor?: Colors;
  ariaLabelText?: string;
}

const useStyles = makeStyles({
  root: {
    backgroundColor: (props: IButtonProps) =>
      `var(--color-${props.buttonColor ? props.buttonColor : Colors.mandarin}-regular)`,
    height: 48,
    width: '100%',
    border: 0,
    color: 'white',
    padding: '0 30px',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    '&:hover': {
      backgroundColor: (props: IButtonProps) =>
        `var(--color-${props.buttonColor ? props.buttonColor : Colors.mandarin}-bold)`,
    },
  },
  label: {
    color: 'var(--color-ink)',
    textTransform: 'capitalize',
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: '16px',
    lineHeight: '22px',
  },
  labelDisabled: {
    color: 'var(--color-slate-regular)',
    textTransform: 'capitalize',
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: '16px',
    lineHeight: '22px',
  },
  disabledButton: {
    backgroundColor: (props: IButtonProps) =>
      `var(--color-${props.buttonColor ? props.buttonColor : Colors.mandarin}-light)`,
  },
});

export const Button: React.FC<IButtonProps> = (props) => {
  const { buttonText, className, onClickHandler, type = 'submit', isDisabled, ariaLabelText } = props;

  const styles = useStyles(props);

  return (
    <div className={className}>
      <MaterialButton
        className={className}
        classes={{
          root: styles.root,
          label: isDisabled ? styles.labelDisabled : styles.label,
          disabled: styles.disabledButton,
        }}
        disabled={isDisabled}
        onClick={onClickHandler}
        type={type}
        aria-label={ariaLabelText}
      >
        {buttonText}
      </MaterialButton>
    </div>
  );
};
