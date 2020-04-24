import React, { MouseEvent, ReactNode, CSSProperties, useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import 'emoji-mart/css/emoji-mart.css';
import { Picker, Emoji } from 'emoji-mart';
import { LocalParticipant, RemoteParticipant } from 'twilio-video';

import useLocalVideoToggle from '../../hooks/useLocalVideoToggle/useLocalVideoToggle';
import useLocalAudioToggle from '../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import { EmojiData } from '../ParticipantMetaProvider/participantMetaReducer';

import './SettingsModal.css';

import Modal from 'react-modal';
// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root');

interface SettingsModalProps {
  isSettingsModalOpen: boolean;
  closeSettingsModal: (e: MouseEvent) => void;
  children?: ReactNode;
  updateEmoji: (sid: string, emoji: EmojiData) => void;
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
  const [isVideoEnabled, toggleVideoEnabled] = useLocalVideoToggle();
  const [isAudioEnabled, toggleAudioEnabled] = useLocalAudioToggle();
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

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
    updateEmoji(participant.sid, emoji);
    setIsEmojiPickerOpen(false);
  }

  function clearEmoji() {
    updateEmoji(participant.sid, null);
  }

  return (
    <div onClick={e => e.stopPropagation()}>
      <Modal
        isOpen={isSettingsModalOpen}
        onRequestClose={closeSettingsModal}
        overlayClassName="SettingsModal"
        className="SettingsModal-content"
        closeTimeoutMS={200}
      >
        <button className="SettingsModal-close" onClick={closeSettingsModal}>
          close
        </button>
        <div>
          <h2 className="SettingsModal-title">Pick a status</h2>
          <div className="SettingsModal-grid">
            <div className="SettingsModal-grid-colA">Visual representation in room:</div>
            <div className="SettingsModal-grid-colB">
              <div className="SettingsModal-toggle">
                <span
                  className={clsx('SettingsModal-toggle-item', { 'is-selected': isVideoEnabled })}
                  onClick={() => !isVideoEnabled && toggleVideoEnabled()}
                >
                  Camera
                </span>
                <span
                  className={clsx('SettingsModal-toggle-item', { 'is-selected': !isVideoEnabled })}
                  onClick={() => isVideoEnabled && toggleVideoEnabled()}
                >
                  Off
                </span>
              </div>
            </div>
            <div className="SettingsModal-grid-colA">Mute your voice:</div>
            <div className="SettingsModal-grid-colB">
              <div className="SettingsModal-toggle">
                <span
                  className={clsx('SettingsModal-toggle-item', { 'is-selected': isAudioEnabled })}
                  onClick={() => !isAudioEnabled && toggleAudioEnabled()}
                >
                  Audio
                </span>
                <span
                  className={clsx('SettingsModal-toggle-item', { 'is-selected': !isAudioEnabled })}
                  onClick={() => isAudioEnabled && toggleAudioEnabled()}
                >
                  Mute
                </span>
              </div>
            </div>
            <div className="SettingsModal-grid-colA">Decorate your avatar with an emoji:</div>
            <div className="SettingsModal-grid-colB">
              <div className="SettingsModal-toggle">
                <span
                  className={clsx('SettingsModal-toggle-item', { 'SettingsModal-toggle-item--clearable': emoji })}
                  onClick={clearEmoji}
                >
                  {emoji ? <Emoji emoji={emoji} size={24} /> : null}
                </span>
                <span
                  className="SettingsModal-toggle-item is-selected u-cursorPointer"
                  onClick={() => setIsEmojiPickerOpen(true)}
                >
                  Pick emoji
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
          </div>
          {children}
        </div>
      </Modal>
    </div>
  );
};

export default SettingsModal;
