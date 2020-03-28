import React from 'react';
import clsx from 'clsx';
import './index.css';

import AnglesLogo from './images/AnglesLogo.svg';

type HeaderProps = {
  isLocked?: boolean;
  roomName?: string;
  classNames?: string;
};

const Header = ({ isLocked, roomName, classNames }: HeaderProps) => {
  return (
    <header className={clsx('Header', classNames)}>
      <div>
        <img className="Header-logo" src={AnglesLogo} />
        <div className="Header-text">{roomName ? roomName : ''}</div>
      </div>
    </header>
  );
};

export default Header;
