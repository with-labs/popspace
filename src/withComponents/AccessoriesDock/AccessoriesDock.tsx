import React, { useState, useRef, useCallback } from 'react';
import clsx from 'clsx';
import Modal from 'react-modal';
import { v4 as uuidv4 } from 'uuid';
import { BackgroundPicker } from '../BackgroundPicker';
import useLocalVideoToggle from '../../hooks/useLocalVideoToggle/useLocalVideoToggle';
import useLocalAudioToggle from '../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useScreenShareToggle from '../../hooks/useScreenShareToggle/useScreenShareToggle';
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
import { useCoordinatedDispatch } from '../../features/room/CoordinatedDispatchProvider';
import * as roomSlice from '../../features/room/roomSlice';
import { useSelector } from 'react-redux';
import { useLocalParticipant } from '../../withHooks/useLocalParticipant/useLocalParticipant';
import { useRoomViewport } from '../../features/room/RoomViewport';
import useParticipantDisplayIdentity from '../../withHooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';
import { useBackgroundUrl } from '../../withHooks/useBackgroundUrl/useBackgroundUrl';
import { addVectors } from '../../utils/math';
import { WidgetState, WidgetType } from '../../types/room';

interface IAccessoriesDockProps {
  classNames?: string;
}

export const AccessoriesDock = React.memo<IAccessoriesDockProps>(({ classNames }) => {
  const localParticipant = useLocalParticipant();
  // TODO: this won't be needed once we have user persistence
  const localParticipantName = useParticipantDisplayIdentity(localParticipant);

  // room state details which affect the options in the dock
  const hasWhiteboard = useSelector(roomSlice.selectors.selectHasWhiteboard);

  const backgroundUrl = useBackgroundUrl();

  const { toWorldCoordinate } = useRoomViewport();

  const coordinatedDispatch = useCoordinatedDispatch();
  // adds a widget to the room, always with the local participant as the owner and
  // centered on screen.
  const addWidget = useCallback(
    (widget: Omit<WidgetState, 'kind' | 'id' | 'participantSid'>) => {
      // get the position in the world which aligns with the center of the
      // user's viewport area
      // add a little fuzziness so multiple widgets of the same type don't stack
      const position = addVectors(
        toWorldCoordinate({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        }),
        {
          x: Math.random() * 50 - 25,
          y: Math.random() * 50 - 25,
        }
      );

      coordinatedDispatch(
        roomSlice.actions.addWidget({
          position,
          widget: {
            ...widget,
            kind: 'widget',
            participantSid: localParticipant.sid,
          },
        })
      );
    },
    [coordinatedDispatch, localParticipant.sid, toWorldCoordinate]
  );

  const copyInput = useRef<HTMLInputElement>(null);

  const [isVideoEnabled, toggleVideoEnabled] = useLocalVideoToggle();
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const [, toggleIsSharing] = useScreenShareToggle();

  const publications = usePublications(localParticipant);

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
    addWidget({
      type: WidgetType.Link,
      isDraft: true,
      data: {
        url: '',
        title: '',
      },
    });
  };

  const onWhiteboardWidgetClick = () => {
    // Only add a whiteboard if there are no other whiteboards in the room
    if (!hasWhiteboard) {
      addWidget({
        type: WidgetType.Whiteboard,
        isDraft: false,
        data: {
          whiteboardState: {
            lines: [],
          },
        },
      });
    } else {
      // show an error message or something
      // TODO: need to figure out how to display it
      setWhiteboardText({
        descText: 'You can only have one whiteboard at a time',
      });
      setTimeout(() => {
        setWhiteboardText(defaultWhiteboardText);
      }, 4000);
    }
  };

  // on click, add sticky note widget to the room
  const onStickNoteWidgetClick = () => {
    addWidget({
      type: WidgetType.StickyNote,
      isDraft: true,
      data: {
        text: '',
        author: localParticipantName || 'Anonymous',
      },
    });
  };

  // on click, add a youtube video player to room
  const onVideoPlayerWidgetClick = () => {
    addWidget({
      type: WidgetType.YouTube,
      isDraft: true,
      data: {
        videoId: '',
        // start the video immediately on create
        isPlaying: true,
        playStartedTimestampUTC: new Date().toUTCString(),
      },
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
          backgroundImage={`url(${backgroundUrl})`}
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
        />
      </div>
      <input
        ref={copyInput}
        type="text"
        value={document.location.href}
        tabIndex={-1}
        readOnly
        className={styles.copyInput}
      />
    </>
  );
});
