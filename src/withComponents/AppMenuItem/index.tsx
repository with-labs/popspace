import React from 'react';
import './index.css';

type AppMenuItemProps = {
  name: string;
  desc: string;
};

const AppMenuItem = ({ name, desc }: AppMenuItemProps) => {
  return (
    <div className="AppMenuItem">
      <div className="AppMenuItem-logo"></div>
      <div>
        <div className="AppMenuItem-nameText">{name}</div>
        <div className="AppMenuItem-descText">{desc}</div>
      </div>
    </div>
  );
};

export default AppMenuItem;
