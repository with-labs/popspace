import React from 'react';
import clsx from 'clsx';
import './index.css';

import WithLogo from '../../images/withLogo.svg';

type HeaderProps = {
  classNames?: string;
  roomName?: string;
};

const Header = ({ classNames, roomName }: HeaderProps) => {
  return (
    <header className={clsx('Header u-flex u-flexRow u-flexAlignItemsCenter', classNames)}>
      <div>
        <img className="Header-logo" alt="header-logo" src={WithLogo} />
      </div>
      <div className="Header-text u-flex u-flexAlignItemsCenter">Joining {roomName}</div>
    </header>
  );
};

export default Header;
