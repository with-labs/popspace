import React from 'react';
import clsx from 'clsx';
import './formInputV2.css';

interface IFormInputV2Props {
  placeholderText?: string;
  classNames?: string;
  value: any;
  onChangeHandler: any;
  type?: string;
}

export const FormInputV2: React.FC<IFormInputV2Props> = ({
  placeholderText,
  classNames,
  value,
  onChangeHandler,
  type,
}) => {
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
