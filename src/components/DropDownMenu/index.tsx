import React, { useState, useEffect, useRef } from 'react';
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
      debugger;
      if (dropDownMenuRef && dropDownMenuRef.current) {
        console.log(event.target);
        console.log(dropDownMenuRef.current.contains(event.target));
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
    debugger;
    console.log('buttonClick');
    setIsActive(!isActive);
  };

  return (
    <div ref={dropDownMenuRef} className={`DropDownMenu${classNames ? ' ' + classNames : ''}`}>
      <div className="DropDownMenu-button" onClick={onButtonClick}>
        <img src={buttonSrc} alt={buttonAltText} />
      </div>
      <div className={`DropDownMenu-menu${!isActive ? ' DropDownMenu-menu--inActive' : ''}`}>{children}</div>
    </div>
  );
};

export default DropDownMenu;
