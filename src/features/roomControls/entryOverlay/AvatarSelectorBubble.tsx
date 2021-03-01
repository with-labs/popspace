import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { LocalVideoTrack } from 'twilio-video';
import { EditIcon } from '../../../components/icons/EditIcon';
import { useLocalTracks } from '../../../components/LocalTracksProvider/useLocalTracks';
import { Modal } from '../../../components/Modal/Modal';
import { ModalContentWrapper } from '../../../components/Modal/ModalContentWrapper';
import { ModalTitleBar } from '../../../components/Modal/ModalTitleBar';
import VideoTrack from '../../../components/VideoTrack/VideoTrack';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { PseudoUserBubble } from '../../room/people/PseudoUserBubble';
import { AvatarSelector } from '../avatar/AvatarSelector';

export interface IAvatarSelectorProps {
  value: string;
  onChange: (newAvatarName: string) => void;
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    border: 'none',
    background: 'none',
    position: 'relative',
  },
  editIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.palette.background.paper,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    padding: 8,
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
  },
}));

export const AvatarSelectorBubble: React.FC<IAvatarSelectorProps> = ({ value, onChange, className }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  const userId = useRoomStore((room) => room.sessionLookup[room.sessionId || '']);

  const { videoTrack } = useLocalTracks();

  return (
    <>
      <button className={clsx(classes.root, className)} onClick={() => setOpen(true)}>
        <PseudoUserBubble userId={userId} isMicOn isVideoOn={!!videoTrack}>
          {videoTrack && <VideoTrack classNames={classes.video} track={videoTrack as LocalVideoTrack} />}
        </PseudoUserBubble>
        <div className={classes.editIcon}>
          <EditIcon />
        </div>
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <ModalTitleBar onClose={() => setOpen(false)} title={t('modals.userSettingsModal.avatarTitle')} />
        <ModalContentWrapper>
          <AvatarSelector
            value={value}
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
