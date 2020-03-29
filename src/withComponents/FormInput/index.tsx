import React from 'react';
import clsx from 'clsx';
import './index.css';

type FormInputProps = {
  imgSrc: any;
  imgAltText: string;
  placeholderText: string;
  classNames?: string;
  value: any;
  setValue: any;
  type?: string;
};

const FormInput = ({ imgSrc, imgAltText, placeholderText, classNames, value, setValue, type }: FormInputProps) => {
  return (
    <div className={clsx('FormInput', classNames)}>
      <img className="FormInput-img" src={imgSrc} alt={imgAltText} />
      <input
        type={type ? type : 'text'}
        className="FormInput-input"
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
