import React, { useState, MouseEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { SlideMenu } from '../SlideMenu/SlideMenu';
import { RoomAdmin } from '../RoomAdmin/RoomAdmin';
import { AddAppItem } from '../AddAppItem/AddAppItem';
import PostLink from '../PostLink';

import useRoomState from '../../hooks/useRoomState/useRoomState';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useWidgetContext } from '../../withHooks/useWidgetContext/useWidgetContext';
import { WidgetTypes } from '../../withComponents/WidgetProvider/widgetTypes';
import { useRoomParties } from '../../withHooks/useRoomParties/useRoomParties';

import './accessoriesTray.css';

import linkImg from './images/link.svg';
import musicImg from './images/music.svg';
import timerImg from './images/timer.svg';
import calendarImg from './images/meetings.svg';
import whitebordImg from './images/whiteboard.svg';

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
  const defaultWhiteboardText = {
    title: 'Whiteboard',
    descText: 'Draw on a shared whiteboard.',
  };
  const [whiteboardText, setWhiteboardText] = useState(defaultWhiteboardText);
  const [menuState, setMenuState] = useState(Menu.MENU_ROOT);
  const { addWidget } = useWidgetContext();
  const { widgets } = useRoomParties();
  const {
    room: { localParticipant },
  } = useVideoContext();

  const closeTray = () => {
    setIsAccessoriesTrayOpen(false);
    setMenuState(Menu.MENU_ROOT);
  };

  const onUrlSubmitHandler = (url: string, title: string) => {
    if (!title.length) title = url;
    addWidget(WidgetTypes.Link, localParticipant.sid, { url, title });
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

  const onAddWhiteboardClick = (e: MouseEvent) => {
    // Only add a whiteboard if there are no other whiteboards in the room
    const isWhiteboardAlreadyInRoom = widgets.some(el => el.type === WidgetTypes.Whiteboard);
    if (!isWhiteboardAlreadyInRoom) {
      addWidget(WidgetTypes.Whiteboard, localParticipant.sid, { whiteboardId: uuidv4() });
      closeTray();
    } else {
      // show an error message or something
      setWhiteboardText({
        title: "Can't add whiteboard",
        descText: 'Only one whiteboard at a time',
      });
      setTimeout(() => {
        setWhiteboardText(defaultWhiteboardText);
      }, 4000);
    }
  };

  const onAddStickyNoteClick = (e: MouseEvent) => {
    addWidget(WidgetTypes.StickyNote, localParticipant.sid, { isPublished: false, text: '' });
    closeTray();
  };

  return (
    <div className="AccessoriesTray u-positionFixed u-layerControlsAlpha">
      {roomState === 'disconnected' ? null : (
        <SlideMenu
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
                  <div key="whiteboard" className="AccessoriesTray-appItem">
                    <AddAppItem
                      imgSrc={whitebordImg}
                      imgAltText="Whiteboard"
                      title={whiteboardText.title}
                      descText={whiteboardText.descText}
                      onClickHandler={onAddWhiteboardClick}
                    />
                  </div>
                  <div key="stickyNote" className="AccessoriesTray-appItem">
                    <AddAppItem
                      imgSrc={whitebordImg}
                      imgAltText="StickyNote"
                      title="Add a sticky note"
                      descText="desc text goes here"
                      onClickHandler={onAddStickyNoteClick}
                    />
                  </div>
                  <div key="music" className="AccessoriesTray-appItem">
                    <AddAppItem
                      imgSrc={musicImg}
                      imgAltText="Music app"
                      title="Music"
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
