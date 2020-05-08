import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';

import { ReactComponent as Add } from '../../images/icons/add.svg';
import { ReactComponent as AddRotated } from '../../images/icons/add_rotated.svg';

import './slideMenu.css';

// todo: update types
interface SlideMenuProps {
  buttonSrc: any;
  buttonAltText: string;
  classNames?: string;
  children?: React.ReactNode;
  onButtonClickHandler?: Function;
  isActive: boolean;
  onMenuDisappear?: Function;
  mobileMenuClassNames?: string;
}

export const SlideMenu: React.FC<SlideMenuProps> = props => {
  const {
    buttonSrc,
    buttonAltText,
    classNames,
    children,
    onButtonClickHandler,
    isActive,
    onMenuDisappear,
    mobileMenuClassNames,
  } = props;

  const dropDownMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dropRefCurrent = dropDownMenuRef.current;
    function handleClickOutside(event: any) {
      if (dropRefCurrent) {
        if (!dropRefCurrent.contains(event.target)) {
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
    dropRefCurrent && dropRefCurrent.addEventListener('transitionend', handleMenuTransitionEnd);

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
      dropRefCurrent && dropRefCurrent.removeEventListener('transitionend', handleMenuTransitionEnd);
    };
  }, [dropDownMenuRef, onMenuDisappear, onButtonClickHandler, isActive]);

  const onButtonClick = () => {
    if (onButtonClickHandler) {
      onButtonClickHandler();
    }
  };

  const slideRightMenu = (
    <div className="u-sm-displayNone u-md-flex u-lg-flex">
      <div
        className={clsx('SlideMenu-button', {
          'is-open': isActive,
        })}
        onClick={onButtonClick}
      >
        <Add />
      </div>
      <div
        className={clsx('SlideMenu-menu', {
          'is-open': isActive,
        })}
      >
        {children}
      </div>
    </div>
  );

  const mobileSlideMenu = (
    <div className="u-sm-flex u-md-displayNone u-lg-displayNone">
      <div
        className={clsx('SlideMenu-overlay', {
          'is-open': isActive,
        })}
        onClick={() => onButtonClickHandler && onButtonClickHandler()}
      />
      <div className={clsx('SlideMenu-button')} onClick={onButtonClick}>
        <Add />
      </div>
      <div
        className={clsx('SlideMenu-menuMobile ', mobileMenuClassNames, {
          'is-open': isActive,
        })}
      >
        {children}
      </div>
    </div>
  );

  return (
    <div ref={dropDownMenuRef} className={clsx('SlideMenu', classNames)}>
      {slideRightMenu}
      {mobileSlideMenu}
    </div>
  );
};
