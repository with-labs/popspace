import React from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { Modal } from '../../../components/Modal/Modal';
import { ModalPane } from '../../../components/Modal/ModalPane';
import { ModalTitleBar } from '../../../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../../../components/Modal/ModalContentWrapper';
import { useRoomModalStore } from '../useRoomModalStore';
import { MembershipManagement } from './MembershipManagement';

import membersImg from './images/ManageMembers.png';

interface IMembershipManagementModalProps {}

const useStyles = makeStyles((theme) => ({
  getStarted: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
  },
  emailField: {
    marginRight: '16px',
  },
  submitBtn: {
    height: '48px',
    marginTop: '23px',
    width: '100px',
  },
  imgPane: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  image: {
    width: '100%',
    height: '100%',
  },
  inviteText: {
    width: 172,
    textAlign: 'center',
  },
}));

export const MembershipManagementModal: React.FC<IMembershipManagementModalProps> = (props) => {
  const isOpen = useRoomModalStore((modals) => modals.membershipMangement);
  const { closeModal } = useRoomModalStore((modals) => modals.api);
  const { t } = useTranslation();
  const classes = useStyles();

  const onCloseHandler = () => {
    closeModal('membershipMangement');
  };

  return (
    <Modal onClose={onCloseHandler} isOpen={isOpen}>
      <ModalTitleBar title={t('modals.inviteUserModal.title')} onClose={onCloseHandler} />
      <ModalContentWrapper>
        <ModalPane className={classes.imgPane}>
          <img src={membersImg} alt="Members" className={classes.image} />
        </ModalPane>
        <ModalPane>
          <MembershipManagement />
        </ModalPane>
      </ModalContentWrapper>
    </Modal>
  );
};
