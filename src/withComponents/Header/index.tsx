import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import './index.css';

import AnglesLogo from './images/AnglesLogo.svg';
import useRoomState from '../../hooks/useRoomState/useRoomState';


type HeaderProps = {
  isLocked?: boolean;
  roomName?: string;
  classNames?: string;
  participantName?: string;
};

const Header = ({ isLocked, roomName, classNames }: HeaderProps) => {
  const roomState = useRoomState();
  const [toastActive, setToastActive] = useState(false)

  const onCopyLinkClicked = () => {
      setToastActive(true)
  }

  useEffect(() => {
    if (!toastActive) {
      const timer = setTimeout(() => {
        setToastActive(false)
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastActive]);

  return (
    <header className={clsx('Header', classNames)}>
      <div>
        <img className='Header-logo' src={AnglesLogo} />
        <div className='Header-text'>{roomName ? roomName : ''}</div>
      </div>
      {roomState === 'disconnected' ? null : (
        <>
          <button className='Header-btn' onClick={onCopyLinkClicked}>
            Share
          </button>
          <div className={ clsx('Header-toast', {'is-active': toastActive}) }>
            Url copied to clipboard.
            <span className='Header-toastClose' onClick={()=>{setToastActive(false)}}>&times;</span>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
