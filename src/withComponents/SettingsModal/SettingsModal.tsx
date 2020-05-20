import React, { MouseEvent, ReactNode, CSSProperties, useState, useEffect, useRef } from 'react';
import clsx from 'clsx';

import 'emoji-mart/css/emoji-mart.css';
import { Picker, Emoji } from 'emoji-mart';
import { LocalParticipant, RemoteParticipant } from 'twilio-video';

import { ReactComponent as BackGlyph } from '../../images/glyphs/back.svg';
import { ReactComponent as EmojiGlyph } from '../../images/glyphs/emoji.svg';

import useLocalVideoToggle from '../../hooks/useLocalVideoToggle/useLocalVideoToggle';

import { getMediaDevices } from '../../utils/mediaSources';

import { EmojiData } from '../ParticipantMetaProvider/participantMetaReducer';

import './SettingsModal.css';

import Modal from 'react-modal';
import { useParticipantMetaContext } from '../ParticipantMetaProvider/useParticipantMetaContext';
import { useParticipantMeta } from '../../withHooks/useParticipantMeta/useParticipantMeta';
import { useAvatar } from '../../withHooks/useAvatar/useAvatar';
import LocalVideoPreview from '../LocalVideoPreview';
import { Avatar } from '../Avatar/Avatar';
import { VideoToggle } from '../VideoToggle/VideoToggle';
import { AudioToggle } from '../AudioToggle/AudioToggle';
// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root');

interface SettingsModalProps {
  isSettingsModalOpen: boolean;
  closeSettingsModal: (e: MouseEvent) => void;
  children?: ReactNode;
  updateEmoji: (emoji: EmojiData) => void;
  participant: LocalParticipant | RemoteParticipant;
  emoji?: EmojiData;
}

const emojiMartStyles: CSSProperties = {
  position: 'absolute',
  top: '12px',
  right: '10px',
};

const SettingsModal = (props: SettingsModalProps) => {
  const { isSettingsModalOpen, closeSettingsModal, children, updateEmoji, participant, emoji } = props;
  const [isVideoEnabled] = useLocalVideoToggle();
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const { updateActiveCamera, updateActiveMic } = useParticipantMetaContext();
  const { activeCameraId, activeMicId, avatar } = useParticipantMeta(participant);

  const ptAvatar = useAvatar(avatar);

  const [deviceInfo, setDeviceInfo] = useState<{
    cameras: MediaDeviceInfo[];
    mics: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  }>({ cameras: [], mics: [], speakers: [] });

  useEffect(() => {
    getMediaDevices().then(devices => {
      setDeviceInfo(devices);
    });
  }, [isSettingsModalOpen]); // Update the devices when the modal opens/closes

  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Handle all clicks outside of the emoji picker to close the emoji picker
  useEffect(() => {
    function handleSettingsModalClickOutside(event: any) {
      if (emojiPickerRef && emojiPickerRef.current) {
        if (!emojiPickerRef.current.contains(event.target)) {
          if (setIsEmojiPickerOpen && isEmojiPickerOpen) {
            setIsEmojiPickerOpen(false);
          }
        }
      }
    }
    document.addEventListener('mousedown', handleSettingsModalClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleSettingsModalClickOutside);
    };
  }, [emojiPickerRef, setIsEmojiPickerOpen, isEmojiPickerOpen]);

  function handleEmojiSelect(emoji: any) {
    updateEmoji(emoji);
    setIsEmojiPickerOpen(false);
  }

  function clearEmoji() {
    updateEmoji(null);
  }

  return (
    <div onClick={e => e.stopPropagation()}>
      <Modal
        isOpen={isSettingsModalOpen}
        onRequestClose={closeSettingsModal}
        overlayClassName=""
        className="SettingsModal-content u-overflowYScrollable u-sm-sizeFull"
        closeTimeoutMS={200}
      >
        <div>
          <h2
            className="SettingsModal-title u-flex u-flexAlignItemsCenter u-marginBottom24 u-cursorPointer"
            onClick={closeSettingsModal}
          >
            <BackGlyph />
            Settings
          </h2>
          <div className="u-flex u-sm-flexCol">
            <div className="u-size1of2 u-sm-sizeFull u-flex u-flexCol u-flexAlignItemsCenter u-marginBottom24">
              <div
                className="u-round u-marginBottom24"
                style={{ backgroundColor: ptAvatar && ptAvatar.backgroundColor, width: 128, height: 128 }}
              >
                {isVideoEnabled ? (
                  <LocalVideoPreview classNames="SettingsModal-videoPreview u-height100Percent" />
                ) : (
                  <div className={clsx('u-height100Percent u-width100Percent u-positionRelative')}>
                    {ptAvatar ? <Avatar name={ptAvatar.name} /> : null}
                  </div>
                )}
              </div>
              <div className="u-flex">
                <div className="SettingsModal-avControls-item">
                  <VideoToggle />
                </div>
                <div className="SettingsModal-avControls-item">
                  <AudioToggle />
                </div>
              </div>
            </div>
            <div className="SettingsModal-grid u-size1of2 u-sm-sizeFull">
              <div className="SettingsModal-grid-colA">Set a status</div>
              <div className="SettingsModal-grid-colB">
                <div className="SettingsModal-toggle">
                  <span
                    className={clsx('SettingsModal-toggle-item', { 'SettingsModal-toggle-item--clearable': emoji })}
                    onClick={clearEmoji}
                  >
                    <span onClick={() => setIsEmojiPickerOpen(true)}>
                      {emoji ? <Emoji emoji={emoji} size={24} /> : <EmojiGlyph />}
                    </span>
                  </span>
                </div>
                {isEmojiPickerOpen ? (
                  <div ref={emojiPickerRef}>
                    <Picker
                      native={false}
                      set="apple"
                      style={emojiMartStyles}
                      title="Pick your emoji..."
                      emoji="point_up"
                      color="#7acccc"
                      onSelect={handleEmojiSelect}
                    />
                  </div>
                ) : null}
              </div>
              <div className="SettingsModal-grid-colA">Microphone</div>
              <div className="SettingsModal-grid-colB">
                <div className="SettingsModal-toggle">
                  <select
                    className="u-width100Percent"
                    onChange={opt => updateActiveMic(opt.target.value)}
                    value={activeMicId || 'default'}
                  >
                    <option value="" key="default"></option>
                    {deviceInfo.mics.map(mic => {
                      return (
                        <option key={mic.deviceId} value={mic.deviceId}>
                          {mic.label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              {/* TODO speaker output selection is not implemented yet.
              <div className="SettingsModal-grid-colA">Speakers</div>
              <div className="SettingsModal-grid-colB">
                <div className="SettingsModal-toggle">
                  <select
                    className="u-width100Percent"
                    onChange={opt => updateActiveSpeakers(participant.sid, deviceId)}
                    value={activeSpeakersId || 'default'}
                  >
                    <option value="" key="default"></option>
                    {deviceInfo.speakers.map(speaker => {
                      return (
                        <option key={speaker.deviceId} value={speaker.deviceId}>
                          {speaker.label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div> */}
              <div className="SettingsModal-grid-colA">Camera</div>
              <div className="SettingsModal-grid-colB">
                <div className="SettingsModal-toggle">
                  <select
                    className="u-width100Percent"
                    onChange={opt => updateActiveCamera(opt.target.value)}
                    value={activeCameraId || 'default'}
                  >
                    <option key="default" value=""></option>
                    {deviceInfo.cameras.map(camera => {
                      return (
                        <option key={camera.deviceId} value={camera.deviceId}>
                          {camera.label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
          </div>
          {children}
        </div>
      </Modal>
    </div>
  );
};

export default SettingsModal;
