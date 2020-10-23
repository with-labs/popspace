import React, { MouseEvent, ReactNode, CSSProperties, useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import 'emoji-mart/css/emoji-mart.css';
import { Picker, Emoji, EmojiData } from 'emoji-mart';
import { ReactComponent as EmojiGlyph } from '../../images/glyphs/emoji.svg';
import useLocalVideoToggle from '../../hooks/useLocalVideoToggle/useLocalVideoToggle';
import { WithModal } from '../WithModal/WithModal';
import { useAvatar } from '../../withHooks/useAvatar/useAvatar';
import LocalVideoPreview from '../LocalVideoPreview';
import { Avatar } from '../Avatar/Avatar';
import { VideoToggle } from '../VideoToggle/VideoToggle';
import { AudioToggle } from '../AudioToggle/AudioToggle';
import './SettingsModal.css';
import { useCoordinatedDispatch } from '../../features/room/CoordinatedDispatchProvider';
import { actions, selectors } from '../../features/room/roomSlice';
import { useLocalParticipant } from '../../withHooks/useLocalParticipant/useLocalParticipant';
import { useSelector } from 'react-redux';
import { MicSelect } from '../../features/preferences/MicSelect';
import { CameraSelect } from '../../features/preferences/CameraSelect';

interface SettingsModalProps {
  isSettingsModalOpen: boolean;
  closeSettingsModal: (e: MouseEvent) => void;
  children?: ReactNode;
}

const emojiMartStyles: CSSProperties = {
  position: 'absolute',
  top: '12px',
  right: '10px',
  zIndex: 100,
};

const SettingsModal = (props: SettingsModalProps) => {
  const { isSettingsModalOpen, closeSettingsModal, children } = props;
  const [isVideoEnabled] = useLocalVideoToggle();
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const localParticipant = useLocalParticipant();
  const localParticipantId = localParticipant?.sid;

  const avatar = useSelector(selectors.createPersonAvatarSelector(localParticipantId));
  const emoji = useSelector(selectors.createEmojiSelector(localParticipant.sid));

  const coordinatedDispatch = useCoordinatedDispatch();
  const updateEmoji = useCallback(
    (newEmoji: EmojiData | string | null) => {
      coordinatedDispatch(
        actions.updatePersonStatus({
          id: localParticipant.sid,
          emoji: newEmoji,
        })
      );
    },
    [coordinatedDispatch, localParticipant.sid]
  );

  const ptAvatar = useAvatar(avatar);

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

  function handleEmojiSelect(em: any) {
    updateEmoji(em);
    setIsEmojiPickerOpen(false);
  }

  function clearEmoji() {
    updateEmoji(null);
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <WithModal isOpen={isSettingsModalOpen} onCloseHandler={closeSettingsModal} title="Settings">
        <div>
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
                  <MicSelect />
                </div>
              </div>
              <div className="SettingsModal-grid-colA">Camera</div>
              <div className="SettingsModal-grid-colB">
                <div className="SettingsModal-toggle">
                  <CameraSelect />
                </div>
              </div>
            </div>
          </div>
          {children}
        </div>
      </WithModal>
    </div>
  );
};

export default SettingsModal;
