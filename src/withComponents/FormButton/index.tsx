import React from 'react';
import clsx from 'clsx';
import './index.css';

export type FormButtonTypes = 'button' | 'submit' | 'reset';

type FormButtonProps = {
  imgSrc?: any;
  imgAltText?: string;
  classNames?: string;
  onClickHandler?: any;
  btnType?: FormButtonTypes;
  text: string;
  isActive?: boolean;
};

const FormButton = ({
  imgSrc,
  imgAltText,
  classNames,
  onClickHandler,
  btnType = 'button',
  text,
  isActive = true,
}: FormButtonProps) => {
  const buttonIcon = imgSrc ? <img className="FormButton-img" src={imgSrc} alt={imgAltText} /> : null;

  return (
    <button type={btnType} className={clsx('FormButton', { 'is-inactive': !isActive })}>
      {buttonIcon}
      <span className="FormButton-text">{text}</span>
    </button>
  );
};

export default FormButton;
