import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import './index.css';

// todo: update types
type DropDownMenuProps = {
  buttonSrc: any;
  buttonAltText: string;
  classNames?: string;
  children?: React.ReactNode;
  onButtonClickHandler?: Function;
  isOpenDirectionDown?: boolean;
  isActive: boolean;
};

const DropDownMenu = (props: DropDownMenuProps) => {
  const { buttonSrc, buttonAltText, classNames, children, onButtonClickHandler, isOpenDirectionDown, isActive } = props;

  const dropDownMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropDownMenuRef && dropDownMenuRef.current) {
        if (!dropDownMenuRef.current.contains(event.target)) {
          if (onButtonClickHandler && isActive) {
            onButtonClickHandler();
          }
        }
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropDownMenuRef, onButtonClickHandler, isActive]);

  const onButtonClick = () => {
    if (onButtonClickHandler) {
      onButtonClickHandler();
    }
  };

  return (
    <div ref={dropDownMenuRef} className={clsx('DropDownMenu', classNames)}>
      <div className="DropDownMenu-button" onClick={onButtonClick}>
        <img src={buttonSrc} alt={buttonAltText} />
      </div>
      <div
        className={clsx('DropDownMenu-menu', {
          'is-active': isActive,
          'DropDownMenu-menu--bottomOffset': !isOpenDirectionDown,
          'DropDownMenu-menu--topOffset': isOpenDirectionDown,
        })}
      >
        {children}
      </div>
    </div>
  );
};

export default DropDownMenu;
