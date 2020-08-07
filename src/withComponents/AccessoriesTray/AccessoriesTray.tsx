import React, { useState, MouseEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { SlideMenu } from '../SlideMenu/SlideMenu';
import { RoomAdmin } from '../RoomAdmin/RoomAdmin';
import { AddAppItem } from '../AddAppItem/AddAppItem';

import useRoomState from '../../hooks/useRoomState/useRoomState';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useWidgetContext } from '../../withHooks/useWidgetContext/useWidgetContext';
import { WidgetTypes } from '../../withComponents/WidgetProvider/widgetTypes';
import { useRoomParties } from '../../withHooks/useRoomParties/useRoomParties';
import * as widgetOffsets from '../../constants/widgetInitialOffsets';

import './accessoriesTray.css';

import linkImg from './images/link.svg';
import whiteboardImg from './images/whiteboard.svg';
import stickyNoteImg from './images/app_stickies.svg';

interface AccessoriesTrayProps {
  classNames?: string;
}

export const AccessoriesTray: React.FC<AccessoriesTrayProps> = props => {
  const roomState = useRoomState();
  const [isAccessoriesTrayOpen, setIsAccessoriesTrayOpen] = useState(false);
  const defaultWhiteboardText = {
    title: 'Whiteboard',
    descText: 'Draw on a shared whiteboard.',
  };
  const [whiteboardText, setWhiteboardText] = useState(defaultWhiteboardText);
  const { addWidget } = useWidgetContext();
  const { widgets } = useRoomParties();
  const {
    room: { localParticipant },
  } = useVideoContext();

  const closeTray = () => {
    setIsAccessoriesTrayOpen(false);
  };

  const onAddLinkClick = () => {
    addWidget(WidgetTypes.Link, localParticipant.sid, {
      url: '',
      title: '',
      initialOffset: widgetOffsets.WIDGET_LINK_INIT_OFFSET,
    });
    closeTray();
  };

  const onAddWhiteboardClick = (e: MouseEvent) => {
    // Only add a whiteboard if there are no other whiteboards in the room
    const isWhiteboardAlreadyInRoom = widgets.some(el => el.type === WidgetTypes.Whiteboard);
    if (!isWhiteboardAlreadyInRoom) {
      // whiteboard size if based on the size of the window, so we have to do some calculation
      // to ge the initial offset
      const initialOffset = Math.round(window.innerWidth / (100 / widgetOffsets.WIDGET_WHITEBOARD_INIT_OFFSET)) / 2;
      addWidget(WidgetTypes.Whiteboard, localParticipant.sid, {
        whiteboardId: uuidv4(),
        isPublished: true,
        initialOffset,
      });
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
    addWidget(WidgetTypes.StickyNote, localParticipant.sid, {
      isPublished: false,
      text: '',
      initialOffset: widgetOffsets.WIDGET_STICKY_NOTE_INIT_OFFSET,
    });
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
                  title="Link"
                  descText="Post links visible to everybody in the room."
                  onClickHandler={onAddLinkClick}
                />
              </div>
              <div key="whiteboard" className="AccessoriesTray-appItem">
                <AddAppItem
                  imgSrc={whiteboardImg}
                  imgAltText="Whiteboard"
                  title={whiteboardText.title}
                  descText={whiteboardText.descText}
                  onClickHandler={onAddWhiteboardClick}
                />
              </div>
              <div key="stickyNote" className="AccessoriesTray-appItem">
                <AddAppItem
                  imgSrc={stickyNoteImg}
                  imgAltText="StickyNote"
                  title="Sticky note"
                  descText="Share snippets of information"
                  onClickHandler={onAddStickyNoteClick}
                />
              </div>
            </div>
          </div>
        </SlideMenu>
      )}
    </div>
  );
};
