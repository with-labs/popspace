import React from 'react';
import { makeStyles, Dialog, DialogContent } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { MembershipManagement } from '../../../features/roomControls/membership/MembershipManagement';
import { RoomInfo } from '../../../types/api';
import { ModalTitleBar } from '../../../components/Modal/ModalTitleBar';

interface IInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomInfo: RoomInfo;
}

const useStyles = makeStyles((theme) => ({
  root: {
    height: 340,
  },
  membershipManagement: {
    width: '100%',
    height: '100%',
    maxHeight: 360,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      width: 360,
    },
  },
  membersList: {
    height: 300,
  },
}));

export const InviteModal: React.FC<IInviteModalProps> = ({ isOpen, onClose, roomInfo }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth>
      <ModalTitleBar onClose={onClose} title={t('modals.inviteMemberModal.title')} />
      <DialogContent className={classes.root}>
        {roomInfo && (
          <MembershipManagement
            roomRoute={roomInfo.route}
            className={classes.membershipManagement}
            memberListClasses={classes.membersList}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
