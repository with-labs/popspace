import * as React from 'react';
import { makeStyles } from '@material-ui/core';
import LocalVideoPreview from '../../components/LocalVideoPreview/LocalVideoPreview';
import { CameraSelect } from './CameraSelect';
import { MicSelect } from './MicSelect';
import useLocalVideoToggle from '../../hooks/useLocalVideoToggle/useLocalVideoToggle';
import { PersonAvatar } from '../room/people/PersonAvatar';
import { useLocalParticipant } from '../../hooks/useLocalParticipant/useLocalParticipant';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/Modal/Modal';
import { ModalPane } from '../../components/Modal/ModalPane';
import { ModalTitleBar } from '../../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../../components/Modal/ModalContentWrapper';

export interface IAudioVideoSettingsModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

const useStyles = makeStyles((theme) => ({
  videoPreviewContainer: {
    height: '100%',
    position: 'relative',
    '& > video': {
      position: 'absolute',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: 6,
    },
  },
  videoPreviewSizer: {
    width: '100%',
  },
  avatar: {
    width: '60%',
    height: '60%',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    position: 'absolute',
  },
}));

export const AudioVideoSettingsModal: React.FC<IAudioVideoSettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [isVideoEnabled] = useLocalVideoToggle();
  const localParticipant = useLocalParticipant();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalTitleBar title={t('modals.avModal.title')} onClose={onClose} />
      <ModalContentWrapper>
        <ModalPane>
          <div className={classes.videoPreviewContainer}>
            {isVideoEnabled ? (
              <LocalVideoPreview />
            ) : (
              <PersonAvatar personId={localParticipant?.sid} className={classes.avatar} />
            )}
            <div className={classes.videoPreviewSizer} />
          </div>
        </ModalPane>
        <ModalPane>
          <MicSelect margin="normal" label="Microphone" />
          <CameraSelect margin="normal" label="Camera" />
        </ModalPane>
      </ModalContentWrapper>
    </Modal>
  );
};
