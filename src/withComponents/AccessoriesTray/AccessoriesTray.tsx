import React, { useState } from 'react';

import { SlideMenu } from '../SlideMenu/SlideMenu';
import { RoomAdmin } from '../RoomAdmin/RoomAdmin';
import AddAppItem from '../AddAppItem';
import PostLink from '../PostLink';

import useRoomState from '../../hooks/useRoomState/useRoomState';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useWidgetContext } from '../../withHooks/useWidgetContext/useWidgetContext';

import './accessoriesTray.css';

import addImg from './images/emoji_ADD.svg';
import cancelImg from '../../images/emoji_OUT.svg';
import ideaImg from './images/idea.svg';
import linkImg from './images/links.svg';
import spotifyImg from './images/spotify.svg';
import timerImg from './images/timer.svg';
import calendarImg from './images/calendar.svg';

interface AccessoriesTrayProps {
  classNames?: string;
}

const SUGGESTION_EMAIL_ADDRESS = 'withsuggestions@gmail.com';

enum Menu {
  MENU_ROOT,
  MENU_ADD_LINK,
}

export const AccessoriesTray: React.FC<AccessoriesTrayProps> = props => {
  const roomState = useRoomState();
  const [isAccessoriesTrayOpen, setIsAccessoriesTrayOpen] = useState(false);
  const [menuState, setMenuState] = useState(Menu.MENU_ROOT);
  const { addWidget } = useWidgetContext();
  const {
    room: { localParticipant },
  } = useVideoContext();

  const closeTray = () => {
    setIsAccessoriesTrayOpen(false);
    setMenuState(Menu.MENU_ROOT);
  };

  const onUrlSubmitHandler = (url: string) => {
    addWidget(localParticipant.sid, url);
    closeTray();
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

  return (
    <div className="AccessoriesTray u-positionFixed u-layerControlsAlpha">
      {roomState === 'disconnected' ? null : (
        <SlideMenu
          buttonSrc={!isAccessoriesTrayOpen ? '' : ''}
          buttonAltText={isAccessoriesTrayOpen ? 'addImg' : 'cancelImg'}
          onButtonClickHandler={() => {
            setIsAccessoriesTrayOpen(!isAccessoriesTrayOpen);
          }}
          isActive={isAccessoriesTrayOpen}
          mobileMenuClassNames="AccessoriesTray-mobileOffset"
        >
          {menuState === Menu.MENU_ROOT ? (
            <>
              <div className="u-marginBottom20">
                <RoomAdmin onClickChangeWallpaper={closeTray} />
              </div>
              <div>
                <div className="AccessoriesTray-appItems-title u-marginBottom20">Room accessories</div>
                <div className="AccessoriesTray-appItemScroll">
                  <div key="links" className="AccessoriesTray-appItem">
                    <AddAppItem
                      imgSrc={linkImg}
                      imgAltText="link img icon"
                      title="Add a link"
                      descText="Post links visible to everybody in the room."
                      onClickHandler={onAddLinkClick}
                    />
                  </div>
                  <div key="suggest" className="AccessoriesTray-appItem">
                    <AddAppItem
                      imgSrc={ideaImg}
                      imgAltText="suggest an app"
                      title="Suggest an app"
                      descText="Let us know in an email which app you'd like us to add."
                      onClickHandler={onSuggestAppClick}
                    />
                  </div>
                  <div key="spotify" className="AccessoriesTray-appItem">
                    <AddAppItem
                      imgSrc={spotifyImg}
                      imgAltText="Spotify app"
                      title="Spotify"
                      descText="Play music along with the people in the room."
                      isDisabled={true}
                    />
                  </div>
                  <div key="timer" className="AccessoriesTray-appItem">
                    <AddAppItem
                      imgSrc={timerImg}
                      imgAltText="timer app"
                      title="Timer"
                      descText="Add a timer to countdown and take breaks."
                      isDisabled={true}
                    />
                  </div>
                  <div key="calendar" className="AccessoriesTray-appItem">
                    <AddAppItem
                      imgSrc={calendarImg}
                      imgAltText="meetings app"
                      title="Meetings"
                      descText="Schedule a meeting with one-click attend."
                      isDisabled={true}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : null}
          {menuState === Menu.MENU_ADD_LINK ? (
            <div>
              <div onClick={onBackBtnClick}>&lt; Add a link</div>
              <PostLink onSubmitHandler={onUrlSubmitHandler} />
            </div>
          ) : null}
        </SlideMenu>
      )}
    </div>
  );
};
