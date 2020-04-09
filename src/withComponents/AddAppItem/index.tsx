import React from 'react';
import clsx from 'clsx';
import './index.css';

type AddAppItemProps = {
  imgSrc: string;
  imgAltText: string;
  title: string;
  descText: string;
  onClickHandler?: Function;
  isDisabled?: boolean;
};

const AddAppItem = ({ imgSrc, imgAltText, title, descText, onClickHandler, isDisabled }: AddAppItemProps) => {
  return (
    <div
      className={clsx('AddAppItem', { 'is-disabled': isDisabled })}
      onClick={() => {
        onClickHandler && onClickHandler();
      }}
    >
      <div className="AddAppItem-imgContainer">
        <img className="AddAppItem-img" src={imgSrc} alt={imgAltText} />
      </div>
      <div>
        <div className="AddAppItem-title">
          {title} {isDisabled ? <span className="AddAppItem-title-disabledText">Coming soon</span> : null}
        </div>
        <div className="AddAppItem-desc">{descText}</div>
      </div>
    </div>
  );
};

export default AddAppItem;
