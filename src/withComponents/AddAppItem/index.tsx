import React from 'react';
import './index.css';

type AddAppItemProps = {
  imgSrc: string;
  imgAltText: string;
  title: string;
  descText: string;
  onClickHandler: Function;
};

const AddAppItem = ({ imgSrc, imgAltText, title, descText, onClickHandler }: AddAppItemProps) => {
  return (
    <div
      className="AddAppItem"
      onClick={() => {
        onClickHandler();
      }}
    >
      <div className="AddAppItem-imgContainer">
        <img className="AddAppItem-img" src={imgSrc} alt={imgAltText} />
      </div>
      <div>
        <div className="AddAppItem-title">{title}</div>
        <div className="AddAppItem-desc">{descText}</div>
      </div>
    </div>
  );
};

export default AddAppItem;
