import React from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { Modal } from '../../../components/Modal/Modal';
import { ModalTitleBar } from '../../../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../../../components/Modal/ModalContentWrapper';
import { useRoomModalStore } from '../useRoomModalStore';
import { MediaReadinessContext } from '../../../components/MediaReadinessProvider/MediaReadinessProvider';

interface IChangelogModalProps {}

const useStyles = makeStyles((theme) => ({
  content: {
    width: 580,
    maxWidth: '100%',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  changelog: {
    width: '100%',
    height: 500,
    maxHeight: '90vh',
    border: 'none',
  },
}));

export const ChangelogModal: React.FC<IChangelogModalProps> = (props) => {
  const isOpen = useRoomModalStore((modals) => modals.changelog);
  const { closeModal } = useRoomModalStore((modals) => modals.api);
  const { isReady } = React.useContext(MediaReadinessContext);

  const { t } = useTranslation();
  const classes = useStyles();

  const onCloseHandler = () => {
    closeModal('changelog');
  };

  return (
    <Modal onClose={onCloseHandler} isOpen={isReady && isOpen} fullWidth={false}>
      <ModalTitleBar title={t('modals.changelogModal.title')} onClose={onCloseHandler} />
      <ModalContentWrapper className={classes.content}>
        <iframe
          className={classes.changelog}
          src={'https://changelog.with.so/'}
          title={t('modals.changelogModal.title')}
        />
      </ModalContentWrapper>
    </Modal>
  );
};
