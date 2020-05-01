import React from 'react';
import clsx from 'clsx';
import './index.css';

type FormInputProps = {
  placeholderText: string;
  classNames?: string;
  value: any;
  onChangeHandler: any;
  type?: string;
};

const FormInputV2 = ({ placeholderText, classNames, value, onChangeHandler, type }: FormInputProps) => {
  return (
    <div className={clsx('FormInputV2 u-flex  u-flexAlignItemsCenter', classNames)}>
      <input
        type={type ? type : 'text'}
        className="FormInputV2-input"
        placeholder={placeholderText}
        value={value}
        onChange={e => {
          onChangeHandler(e.target.value);
        }}
      />
    </div>
  );
};

export default FormInputV2;
