import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import './index.css';

// todo: update types
type DropDownMenuProps = {
  buttonSrc: any;
  buttonAltText: string;
  classNames?: string;
  children?: React.ReactNode;
};

const DropDownMenu = (props: DropDownMenuProps) => {
  const { buttonSrc, buttonAltText, classNames, children } = props;
  const [isActive, setIsActive] = useState(false);
  const dropDownMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropDownMenuRef && dropDownMenuRef.current) {
        if (!dropDownMenuRef.current.contains(event.target)) {
          // clicking outside of the dropdown menu so close it
          setIsActive(false);
        }
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropDownMenuRef]);

  const onButtonClick = () => {
    setIsActive(!isActive);
  };

  return (
    <div ref={dropDownMenuRef} className={clsx('DropDownMenu', classNames)}>
      <div className="DropDownMenu-button" onClick={onButtonClick}>
        <img src={buttonSrc} alt={buttonAltText} />
      </div>
      <div className={clsx('DropDownMenu-menu', { 'DropDownMenu-menu--inactive': !isActive })}>{children}</div>
    </div>
  );
};

export default DropDownMenu;
