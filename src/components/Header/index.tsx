import React from 'react';
import './index.css';

import DropDownMenu from '../DropDownMenu';
import AppMenuItem from '../AppMenuItem';

import WithLogo from './images/withLogo.svg';
import GearIcon from './images/gear.svg';
import PlusIcon from './images/plus.svg';

type HeaderProps = {
  isLocked?: boolean;
  roomName?: string;
};

const Header = ({ isLocked, roomName }: HeaderProps) => {
  return (
    <header className="Header">
      <div>
        <img src={WithLogo} />
        <div className="Header-text">dummy text</div>
      </div>
      <div className="Header-controls">
        <DropDownMenu buttonSrc={PlusIcon} buttonAltText={'plus button'} classNames="Header-controlSpace">
          <div>
            <AppMenuItem name="test" desc="test desc" />
          </div>
        </DropDownMenu>
        <DropDownMenu buttonSrc={GearIcon} buttonAltText={'gear button'}></DropDownMenu>
      </div>
    </header>
  );
};

export default Header;
