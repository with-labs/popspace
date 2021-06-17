import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { LocalVideoTrack } from 'twilio-video';
import { EditHint } from '@components/EditHint/EditHint';
import { Modal } from '@components/Modal/Modal';
import { ModalContentWrapper } from '@components/Modal/ModalContentWrapper';
import { ModalTitleBar } from '@components/Modal/ModalTitleBar';
import VideoTrack from '@components/VideoTrack/VideoTrack';
import { useLocalTracks } from '@providers/media/hooks/useLocalTracks';
import { PseudoUserBubble } from '../../room/people/PseudoUserBubble';
import { AvatarSelector } from './AvatarSelector';
import { ParticipantState } from '@api/roomState/types/participants';

export interface IAvatarSelectorProps {
  className?: string;
  showVideo?: boolean;
  userData: { userId: string; avatarName: string; displayName: string };
  updateSelf: (payload: Partial<ParticipantState>) => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    border: 'none',
    background: 'none',
    position: 'relative',
    '&:focus': {
      outline: 'none',
    },
  },
  editIcon: {
    top: 0,
    right: 0,
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
  },
}));

export const AvatarSelectorBubble: React.FC<IAvatarSelectorProps> = ({
  className,
  showVideo,
  userData,
  updateSelf,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const onChange = (newAvatarName: string) => {
    updateSelf({ avatarName: newAvatarName });
  };

  const { videoTrack } = useLocalTracks();

  return (
    <>
      <button className={clsx(classes.root, className)} onClick={() => setOpen(true)}>
        <PseudoUserBubble userData={userData} isMicOn isVideoOn={!!videoTrack && showVideo}>
          {videoTrack && showVideo && <VideoTrack classNames={classes.video} track={videoTrack as LocalVideoTrack} />}
        </PseudoUserBubble>
        <EditHint className={classes.editIcon} />
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <ModalTitleBar onClose={() => setOpen(false)} title={t('modals.userSettingsModal.avatarTitle')} />
        <ModalContentWrapper>
          <AvatarSelector
            value={userData.avatarName}
            onChange={(name) => {
              onChange(name);
              setOpen(false);
            }}
          />
        </ModalContentWrapper>
      </Modal>
    </>
  );
};
