import React from 'react';
import styles from './AddAppItem.module.css';

interface AddAppItemProps {
  imgSrc: string;
  imgAltText: string;
  title: string;
  descText: string;
  onClickHandler?: Function;
  isDisabled?: boolean;
}

export const AddAppItem: React.FC<AddAppItemProps> = ({
  imgSrc,
  imgAltText,
  title,
  descText,
  onClickHandler,
  isDisabled,
}) => {
  return (
    <div
      className={`${styles.AddAppItem} ${isDisabled ? styles.isDisabled : ''}`}
      onClick={() => {
        onClickHandler && onClickHandler();
      }}
    >
      <div className={`${styles.imgContainer}`}>
        <img className={`${styles.img}`} src={imgSrc} alt={imgAltText} />
      </div>
      <div className={`${styles.textContainer}`}>
        <div className={`${styles.title}`}>
          {title} {isDisabled ? <span className={`${styles.titleDisabledText}`}>Coming soon</span> : null}
        </div>
        <div className={`${styles.desc}`}>{descText}</div>
      </div>
    </div>
  );
};
