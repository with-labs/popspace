import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import DropDownMenu from '../DropDownMenu';
import BackgroundPicker from '../BackgroundPicker';
import AddAppItem from '../AddAppItem';
import Suggestion from '../Suggestion';

import addImg from './images/emoji_ADD.svg';
import cancelImg from './images/emoji_OUT.svg';
import ideaImg from './images/idea.svg';
import linkImg from './images/links.svg';
import spotifyImg from './images/spotify.svg';
import timerImg from './images/timer.svg';
import calendarImg from './images/calendar.svg';

import PostLink from '../PostLink';

import useRoomState from '../../hooks/useRoomState/useRoomState';
import { useWidgetContext } from '../../withHooks/useWidgetContext/useWidgetContext';
import './index.css';

type FooterProps = {
  classNames?: string;
};

const SUGGESTION_EMAIL_ADDRESS = 'withsuggestions@gmail.com';

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

  const onSuggestAppClick = () => {
    const to = SUGGESTION_EMAIL_ADDRESS;
    const subject = 'Suggest an app';
    const body = `I would love it if you made an app that...`;
    window.open(`mailto:${to}?subject=${subject}&body=${body}`, '_blank');
  };

  const onSuggestionButtonClick = () => {
    const to = SUGGESTION_EMAIL_ADDRESS;
    const subject = 'Hello With Team';
    window.open(`mailto:${to}?subject=${subject}`, '_blank');
  };

  const mainMenu =
    menuState === Menu.MENU_ROOT ? (
      <>
        <BackgroundPicker />
        <div className="Footer-addAppList">
          <div className="Footer-menuTitle">Add an app</div>
          <div className="Footer-appItemScroll">
            <AddAppItem
              imgSrc={linkImg}
              imgAltText="link img icon"
              title="Add a link"
              descText="Link to a URL from inside the room for everybody to access."
              onClickHandler={onAddLinkClick}
            />
            <AddAppItem
              imgSrc={ideaImg}
              imgAltText="suggest an app"
              title="Suggest an app"
              descText="Let us know in an email which app you'd like us to add."
              onClickHandler={onSuggestAppClick}
            />
            <AddAppItem
              imgSrc={spotifyImg}
              imgAltText="Spotify app"
              title="Spotify"
              descText="Play music along with the people in the room."
              isDisabled={true}
            />
            <AddAppItem
              imgSrc={timerImg}
              imgAltText="timer app"
              title="Timer"
              descText="Add a timer to countdown and take breaks."
              isDisabled={true}
            />
            <AddAppItem
              imgSrc={calendarImg}
              imgAltText="meetings app"
              title="Meetings"
              descText="Schedule a meeting with one-click attend."
              isDisabled={true}
            />
          </div>
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
        <>
          <Suggestion
            buttonSrc={ideaImg}
            buttonAltText={'send suggestion'}
            onButtonClickHandler={onSuggestionButtonClick}
          />
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
        </>
      )}
    </footer>
  );
};

export default Footer;
