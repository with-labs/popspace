import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { LocalVideoTrack } from 'twilio-video';
import { EditHint } from '../../../components/EditHint/EditHint';
import { Modal } from '../../../components/Modal/Modal';
import { ModalContentWrapper } from '../../../components/Modal/ModalContentWrapper';
import { ModalTitleBar } from '../../../components/Modal/ModalTitleBar';
import VideoTrack from '../../../components/VideoTrack/VideoTrack';
import { useLocalTracks } from '../../../providers/media/hooks/useLocalTracks';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { PseudoUserBubble } from '../../room/people/PseudoUserBubble';
import { AvatarSelector } from './AvatarSelector';

export interface IAvatarSelectorProps {
  className?: string;
  showVideo?: boolean;
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

export const AvatarSelectorBubble: React.FC<IAvatarSelectorProps> = ({ className, showVideo }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  const userId = useRoomStore((room) => room.sessionLookup[room.sessionId || '']);
  const avatarName = useRoomStore((room) => room.users[userId]?.participantState.avatarName);
  const updateSelf = useRoomStore((room) => room.api.updateSelf);

  const onChange = (newAvatarName: string) => {
    updateSelf({ avatarName: newAvatarName });
  };

  const { videoTrack } = useLocalTracks();

  return (
    <>
      <button className={clsx(classes.root, className)} onClick={() => setOpen(true)}>
        <PseudoUserBubble userId={userId} isMicOn isVideoOn={!!videoTrack && showVideo}>
          {videoTrack && showVideo && <VideoTrack classNames={classes.video} track={videoTrack as LocalVideoTrack} />}
        </PseudoUserBubble>
        <EditHint className={classes.editIcon} />
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <ModalTitleBar onClose={() => setOpen(false)} title={t('modals.userSettingsModal.avatarTitle')} />
        <ModalContentWrapper>
          <AvatarSelector
            value={avatarName}
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
