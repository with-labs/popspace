import React from 'react';
import './LoginInput.css';

type LoginInputProps = {
  imgSrc: any;
  imgAltText: string;
  placeholderText: any;
  classNames?: string;
  value: any;
  setValue: any;
};

const LoginInput = ({ imgSrc, imgAltText, placeholderText, classNames, value, setValue }: LoginInputProps) => {
  return (
    <div className={classNames ? `LoginInput ${classNames}` : 'LoginInput'}>
      <img className="LoginInput-img" src={imgSrc} alt={imgAltText} />
      <input
        className="LoginInput-input"
        placeholder={placeholderText}
        value={value}
        onChange={e => {
          setValue(e.target.value);
        }}
      />
    </div>
  );
};

export default LoginInput;
