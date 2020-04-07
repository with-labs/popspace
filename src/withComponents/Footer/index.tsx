import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import DropDownMenu from '../DropDownMenu';
import BackgroundPicker from '../BackgroundPicker';
import AddAppItem from '../AddAppItem';

import addImg from './images/emoji_ADD.svg';
import cancelImg from './images/emoji_OUT.svg';

import PostLink from '../PostLink';

import useRoomState from '../../hooks/useRoomState/useRoomState';
import { useWidgetContext } from '../../withHooks/useWidgetContext/useWidgetContext';
import './index.css';

import LinkIcon from '../../images/link.svg';

type FooterProps = {
  classNames?: string;
};

enum Menu {
  MENU_ROOT,
  MENU_ADD_LINK,
}

const Footer = ({ classNames }: FooterProps) => {
  const [menuState, setMenuState] = useState(Menu.MENU_ROOT);
  const roomState = useRoomState();
  const { addWidget } = useWidgetContext();

  const [isAddAppOpen, setIsAddAppOpen] = useState(false);

  const onUrlSubmitHandler = (url: string) => {
    addWidget(url);
    setIsAddAppOpen(false);
  };

  const onAddLinkClick = () => {
    setMenuState(Menu.MENU_ADD_LINK);
  };

  const onBackBtnClick = () => {
    setMenuState(Menu.MENU_ROOT);
  };

  const mainMenu =
    menuState === Menu.MENU_ROOT ? (
      <>
        <BackgroundPicker />
        <div className="Footer-addAppList">
          <div className="Footer-menuTitle">Add an app</div>
          <AddAppItem
            imgSrc={LinkIcon}
            imgAltText="link img icon"
            title="Add a link"
            descText="Link to a URL from inside the room for everybody to access."
            onClickHandler={onAddLinkClick}
          />
        </div>
      </>
    ) : null;

  const addLink =
    menuState === Menu.MENU_ADD_LINK ? (
      <>
        <div className="Footer-menuBackBtn" onClick={onBackBtnClick}>
          &lt;
        </div>
        <PostLink onSubmitHandler={onUrlSubmitHandler} />
      </>
    ) : null;

  return (
    <footer className={clsx('Footer', classNames)}>
      {roomState === 'disconnected' ? null : (
        <DropDownMenu
          buttonSrc={!isAddAppOpen ? addImg : cancelImg}
          buttonAltText={isAddAppOpen ? 'addImg' : 'cancelImg'}
          onButtonClickHandler={() => {
            setIsAddAppOpen(!isAddAppOpen);
            setMenuState(Menu.MENU_ROOT);
          }}
          classNames="Footer-btn"
          isOpenDirectionDown={false}
          isActive={isAddAppOpen}
        >
          {mainMenu}
          {addLink}
        </DropDownMenu>
      )}
    </footer>
  );
};

export default Footer;
