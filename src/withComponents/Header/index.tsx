import React from 'react';
import clsx from 'clsx';
import './index.css';

import WithLogo from '../../images/withLogo.svg';
import WithLogoCustom from '../../images/WithLogoWhite.png';
import { useRoomMetaContext } from '../../withHooks/useRoomMetaContext/useRoomMetaContext';
import { Background } from '../BackgroundPicker';

type HeaderProps = {
  classNames?: string;
  participantName?: string;
};

const Header = ({ classNames }: HeaderProps) => {
  const { properties } = useRoomMetaContext();

  return (
    <header className={clsx('Header', classNames)}>
      <div>
        <img
          className="Header-logo"
          alt="header-logo"
          src={properties.bg === Background.BG_CUSTOM ? WithLogoCustom : WithLogo}
        />
      </div>
    </header>
  );
};

export default Header;
