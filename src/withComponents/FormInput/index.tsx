import React from 'react';
import clsx from 'clsx';
import './index.css';

type FormInputProps = {
  imgSrc?: any;
  imgAltText?: string;
  placeholderText: string;
  classNames?: string;
  value: any;
  setValue: any;
  type?: string;
};

const FormInput = ({ imgSrc, imgAltText, placeholderText, classNames, value, setValue, type }: FormInputProps) => {
  const inputIcon = imgSrc ? <img className="FormInput-img" src={imgSrc} alt={imgAltText} /> : null

  return (
    <div className={clsx('FormInput', classNames)}>
      { inputIcon }
      <input
        type={type ? type : 'text'}
        className={ clsx('FormInput-input', {'FormInput-input--imgOffset' : !imgSrc }) }
        placeholder={placeholderText}
        value={value}
        onChange={e => {
          setValue(e.target.value);
        }}
      />
    </div>
  );
};

export default FormInput;
