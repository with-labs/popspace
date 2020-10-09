import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import './index.css';

// todo: update types
interface IDropDownMenuProps {
  buttonSrc: any;
  buttonAltText: string;
  classNames?: string;
  children?: React.ReactNode;
  onButtonClickHandler?: Function;
  isOpenDirectionDown?: boolean;
  isActive: boolean;
  onMenuDisappear?: Function;
}

const DropDownMenu = (props: IDropDownMenuProps) => {
  const {
    buttonSrc,
    buttonAltText,
    classNames,
    children,
    onButtonClickHandler,
    isOpenDirectionDown,
    isActive,
    onMenuDisappear,
  } = props;

  const dropDownMenuRef = useRef<HTMLDivElement>(null);
  const dropDownMenuAreaRef = useRef<HTMLDivElement>(null);

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

    function handleMenuTransitionEnd(event: TransitionEvent) {
      if (event && event.propertyName === 'visibility') {
        // we are waiting for the dropdown menu area to be invisible before calling
        // the onMenuDisappear callback
        onMenuDisappear && onMenuDisappear();
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    dropDownMenuAreaRef.current &&
      dropDownMenuAreaRef.current.addEventListener('transitionend', handleMenuTransitionEnd);

    /* eslint-disable react-hooks/exhaustive-deps */
    /* esling igoring rule because linter compalins:
     *The ref value 'dropDownMenuAreaRef.current' will likely have changed by
     * the time this effect cleanup function runs. If this ref points to a node
     * rendered by React, copy 'dropDownMenuAreaRef.current' to a variable
     * inside the effect, and use that variable in the cleanup function
     * react-hooks/exhaustive-deps.
     *
     * However, dropDownMenuAreaRef.current has nothing to clean up. It is only
     * being used to indetify its child compoenent. Therefore, ignoring.
     */
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
      dropDownMenuAreaRef.current &&
        dropDownMenuAreaRef.current.removeEventListener('transitionend', handleMenuTransitionEnd);
    };
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [dropDownMenuRef, onMenuDisappear, onButtonClickHandler, isActive, dropDownMenuAreaRef]);

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
        ref={dropDownMenuAreaRef}
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
