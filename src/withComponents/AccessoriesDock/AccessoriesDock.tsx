import React, { useState, useRef } from 'react';
import clsx from 'clsx';
import Modal from 'react-modal';
import { v4 as uuidv4 } from 'uuid';

import useRoomState from '../../hooks/useRoomState/useRoomState';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useWidgetContext } from '../../withHooks/useWidgetContext/useWidgetContext';
import { WidgetTypes } from '../WidgetProvider/widgetTypes';
import { useRoomParties } from '../../withHooks/useRoomParties/useRoomParties';
import * as widgetOffsets from '../../constants/widgetInitialOffsets';
import { BackgroundPicker } from '../BackgroundPicker';
import { useRoomMetaContext } from '../../withHooks/useRoomMetaContext/useRoomMetaContext';
import { useRoomMetaContextBackground } from '../../withHooks/useRoomMetaContextBackground/useRoomMetaContextBackground';
import useLocalVideoToggle from '../../hooks/useLocalVideoToggle/useLocalVideoToggle';
import useLocalAudioToggle from '../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useScreenShareToggle from '../../hooks/useScreenShareToggle/useScreenShareToggle';
import { useParticipantMetaContext } from '../ParticipantMetaProvider/useParticipantMetaContext';
import { useParticipantMeta } from '../../withHooks/useParticipantMeta/useParticipantMeta';
import usePublications from '../../hooks/usePublications/usePublications';

import SettingsModal from '../SettingsModal/SettingsModal';
import { DockItem } from './DockItem/DockItem';
import { ToggleButton } from './ToggleButton/ToggleButton';

import styles from './AccessoriesDock.module.css';

import inviteIcon from './images/tray_invite.svg';
import linkIcon from './images/tray_link.svg';
import stickyIcon from './images/tray_sticky.svg';
import videoIcon from './images/tray_video.svg';
import whiteBoardIcon from './images/tray_whiteboard.svg';
import settingsIcon from './images/tray_settings.svg';
import { ReactComponent as AudioOffIcon } from './images/audio_OFF.svg';
import { ReactComponent as AudioOnIcon } from './images/audio_ON.svg';
import { ReactComponent as CameraOffIcon } from './images/camera_OFF.svg';
import { ReactComponent as CameraOnIcon } from './images/camera_ON.svg';
import { ReactComponent as SharingOffIcon } from './images/sharing_OFF.svg';
import { ReactComponent as SharingOnIcon } from './images/sharing_ON.svg';

interface IAccessoriesDockProps {
  classNames?: string;
}

export const AccessoriesDock: React.FC<IAccessoriesDockProps> = ({ classNames }) => {
  const roomState = useRoomState();
  const { widgets } = useRoomParties();
  const { addWidget } = useWidgetContext();
  const { properties } = useRoomMetaContext();
  const image: string = useRoomMetaContextBackground(properties);
  const { updateEmoji } = useParticipantMetaContext();
  const copyInput = useRef<HTMLInputElement>(null);

  const [isVideoEnabled, toggleVideoEnabled] = useLocalVideoToggle();
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const [, toggleIsSharing] = useScreenShareToggle();

  const {
    room: { localParticipant },
  } = useVideoContext();

  const meta = useParticipantMeta(localParticipant);
  const publications = usePublications(localParticipant);

  const { emoji } = meta;
  const [isBgPickerOpen, setIsBgPickerOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const screenShareTrack = publications.find((pub) => pub.trackName === 'screen');

  // setup vars needed to create a whiteboard as of 8-19-2020
  const defaultWhiteboardText = {
    descText: 'Draw on a shared whiteboard.',
  };
  const [whiteboardText, setWhiteboardText] = useState(defaultWhiteboardText);

  const onInvitePersonClick = () => {
    if (copyInput.current) {
      copyInput.current.select();
      document.execCommand('copy');
    }
  };

  const onChangeBackgroundClick = () => {
    setIsBgPickerOpen(true);
  };

  // on click, add a link widget to the room
  const onLinkWidgetClick = () => {
    addWidget(WidgetTypes.Link, localParticipant.sid, {
      url: '',
      title: '',
      initialOffset: widgetOffsets.WIDGET_LINK_INIT_OFFSET,
    });
  };

  const onWhiteboardWidgetClick = () => {
    // Only add a whiteboard if there are no other whiteboards in the room
    const isWhiteboardAlreadyInRoom = widgets.some((el) => el.type === WidgetTypes.Whiteboard);
    if (!isWhiteboardAlreadyInRoom) {
      // whiteboard size if based on the size of the window, so we have to do some calculation
      // to ge the initial offset
      const initialOffset = Math.round(window.innerWidth / (100 / widgetOffsets.WIDGET_WHITEBOARD_INIT_OFFSET)) / 2;
      addWidget(WidgetTypes.Whiteboard, localParticipant.sid, {
        whiteboardId: uuidv4(),
        isPublished: true,
        initialOffset,
      });
    } else {
      // show an error message or something
      // TODO: need to figure out how to display it
      setWhiteboardText({
        descText: 'Can only have one whiteboard at a time',
      });
      setTimeout(() => {
        setWhiteboardText(defaultWhiteboardText);
      }, 4000);
    }
  };

  // on click, add sticky note widget to the room
  const onStickNoteWidgetClick = () => {
    addWidget(WidgetTypes.StickyNote, localParticipant.sid, {
      isPublished: false,
      text: '',
      initialOffset: widgetOffsets.WIDGET_STICKY_NOTE_INIT_OFFSET,
    });
  };

  // on click, add a youtube video player to room
  const onVideoPlayerWidgetClick = () => {
    addWidget(WidgetTypes.YouTube, localParticipant.sid, {
      isPublished: false,
      videoId: '',
      initialOffset: widgetOffsets.WIDGET_YOUTUBE_INIT_OFFSET,
    });
  };

  const onSettingsClicked = () => {
    setIsSettingsModalOpen(true);
  };

  return (
    <>
      <div
        className={clsx(styles.AccessoriesDock, 'u-positionFixed u-layerControlsAlpha u-flex u-flexRow', classNames)}
      >
        <DockItem
          imgSrc={inviteIcon}
          imgAltText="Invite person"
          onClickHandler={onInvitePersonClick}
          hoverText="Copy a link to the room to invite others."
          classNames={styles.buttonMarginRight}
        />
        <DockItem
          backgoundImage={image}
          imgAltText="Background Picker"
          onClickHandler={onChangeBackgroundClick}
          hoverText="Change the rooms background."
          classNames={styles.bgPickerShadow}
        />
        <div className={styles.separator} />
        <DockItem
          imgSrc={linkIcon}
          imgAltText="Link widget"
          onClickHandler={onLinkWidgetClick}
          hoverText="Post links visible to everybody in the room."
          classNames={styles.buttonMarginRight}
        />
        <DockItem
          imgSrc={whiteBoardIcon}
          imgAltText="Whiteboard widget"
          onClickHandler={onWhiteboardWidgetClick}
          hoverText={whiteboardText.descText}
          classNames={styles.buttonMarginRight}
        />
        <DockItem
          imgSrc={stickyIcon}
          imgAltText="Sticky note widget"
          onClickHandler={onStickNoteWidgetClick}
          hoverText="Share snippets of information."
          classNames={styles.buttonMarginRight}
        />
        <DockItem
          imgSrc={videoIcon}
          imgAltText="Video player widget"
          onClickHandler={onVideoPlayerWidgetClick}
          hoverText="Watch YouTube videos together."
        />
        <div className={styles.separator} />
        <ToggleButton
          onToggle={toggleVideoEnabled}
          isActive={isVideoEnabled}
          hoverText="Toggle your video."
          classNames={styles.buttonMarginRight}
        >
          {(renderProps) => {
            const { isActive, activeClassNames, inactiveClassNames } = renderProps;
            return isActive ? (
              <CameraOnIcon className={clsx('u-flex', activeClassNames)} />
            ) : (
              <CameraOffIcon className={clsx('u-flex', inactiveClassNames)} />
            );
          }}
        </ToggleButton>
        <ToggleButton
          onToggle={toggleAudioEnabled}
          isActive={isAudioEnabled}
          hoverText="Toggle your audio."
          classNames={styles.buttonMarginRight}
        >
          {(renderProps) => {
            const { isActive, activeClassNames, inactiveClassNames } = renderProps;
            return isActive ? (
              <AudioOnIcon className={clsx('u-flex', activeClassNames)} />
            ) : (
              <AudioOffIcon className={clsx('u-flex', inactiveClassNames)} />
            );
          }}
        </ToggleButton>
        <ToggleButton
          onToggle={toggleIsSharing}
          isActive={!!screenShareTrack}
          hoverText="Share your screen."
          classNames={styles.buttonMarginRight}
        >
          {(renderProps) => {
            const { isActive, activeClassNames, inactiveClassNames } = renderProps;
            return isActive ? (
              <SharingOnIcon className={clsx('u-flex', activeClassNames)} />
            ) : (
              <SharingOffIcon className={clsx('u-flex', inactiveClassNames)} />
            );
          }}
        </ToggleButton>
        <DockItem imgSrc={settingsIcon} imgAltText="Settings" onClickHandler={onSettingsClicked} hoverText="Settings" />
        <Modal
          isOpen={isBgPickerOpen}
          onRequestClose={() => setIsBgPickerOpen(false)}
          className={clsx(styles.bgPicker, 'u-sm-sizeFull')}
          closeTimeoutMS={200}
        >
          <BackgroundPicker onExit={() => setIsBgPickerOpen(false)} />
        </Modal>
        <SettingsModal
          isSettingsModalOpen={isSettingsModalOpen}
          closeSettingsModal={() => setIsSettingsModalOpen(false)}
          updateEmoji={updateEmoji}
          emoji={emoji}
          participant={localParticipant}
        />
      </div>
      <input ref={copyInput} type="text" value={document.location.href} readOnly className={styles.copyInput} />
    </>
  );
};
