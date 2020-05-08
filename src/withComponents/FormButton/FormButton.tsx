import React from 'react';
import clsx from 'clsx';
import './formButton.css';

export type FormButtonTypes = 'button' | 'submit' | 'reset';

interface IFormButtonProps {
  imgSrc?: any;
  imgAltText?: string;
  classNames?: string;
  onClickHandler?: any;
  btnType?: FormButtonTypes;
  text: string;
  isActive?: boolean;
}

export const FormButton: React.FC<IFormButtonProps> = ({
  imgSrc,
  imgAltText,
  classNames,
  onClickHandler,
  btnType = 'button',
  text,
  isActive = true,
}) => {
  const buttonIcon = imgSrc ? <img className="FormButton-img" src={imgSrc} alt={imgAltText} /> : null;

  return (
    <button
      type={btnType}
      className={clsx('FormButton', classNames, { 'is-inactive': !isActive })}
      onClick={onClickHandler}
    >
      {buttonIcon}
      <span className="FormButton-text">{text}</span>
    </button>
  );
};
