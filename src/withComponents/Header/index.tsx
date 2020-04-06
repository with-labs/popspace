import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import './index.css';

import WithLogo from './images/withLogo.svg';
import useRoomState from '../../hooks/useRoomState/useRoomState';

type HeaderProps = {
  isLocked?: boolean;
  roomName?: string;
  classNames?: string;
  participantName?: string;
};

const Header = ({ isLocked, roomName, classNames }: HeaderProps) => {
  const roomState = useRoomState();
  const [toastActive, setToastActive] = useState(false);

  const onCopyLinkClicked = () => {
    // work around limitiation of copy to clipboard
    // we create an element, then add it to the dom
    var input = document.createElement('input');
    document.body.appendChild(input);
    // set the current window location to its value
    input.value = window.location.href;
    // selected it
    input.select();
    // fire off the copy exec command
    document.execCommand('copy');
    // remove the input from the dom
    document.body.removeChild(input);

    // if we dont have a toast open, set one active
    if (!toastActive) {
      setToastActive(true);
    }
  };

  useEffect(() => {
    if (!toastActive) {
      const timer = setTimeout(() => {
        setToastActive(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastActive]);

  return (
    <header className={clsx('Header', classNames)}>
      <div>
        <img className="Header-logo" alt="header-logo" src={WithLogo} />
        <div className="Header-text">{roomName ? roomName : ''}</div>
      </div>
      {roomState === 'disconnected' ? null : (
        <>
          <button className="Header-btn" onClick={onCopyLinkClicked}>
            Share
          </button>
          <div className={clsx('Header-toast', { 'is-active': toastActive })}>
            Url copied to clipboard.
            <span
              className="Header-toastClose"
              onClick={() => {
                setToastActive(false);
              }}
            >
              &times;
            </span>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
