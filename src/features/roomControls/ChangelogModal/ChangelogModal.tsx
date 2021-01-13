import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { Modal } from '../../../components/Modal/Modal';
import { ModalTitleBar } from '../../../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../../../components/Modal/ModalContentWrapper';
import { APP_VERSION, USER_ONBOARDING } from '../../../constants/User';
import { useRoomModalStore } from '../useRoomModalStore';

interface IChangelogModalProps {}

const useStyles = makeStyles((theme) => ({
  content: {
    width: 580,
    maxWidth: '100%',
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
  const { openModal, closeModal } = useRoomModalStore((modals) => modals.api);

  const { t } = useTranslation();
  const classes = useStyles();

  const onCloseHandler = () => {
    closeModal('changelog');
  };

  useEffect(() => {
    // we only want to show the whats new modal if they have completed the onboarding process
    const completedOnboarding = localStorage.getItem(USER_ONBOARDING);

    if (completedOnboarding) {
      // for some reason, adding a type def for __with_version__ on the window object
      // isnt playing nice, but we know we have added this in, so just ignore the type check here
      // @ts-ignore
      const currentVersion = window.__with_version__;
      const savedVersion = localStorage.getItem(APP_VERSION);

      // if the version dont match, then just pop the whats new modal on load
      if (currentVersion !== savedVersion) {
        openModal('changelog');
      }

      // save of the current app version
      localStorage.setItem(APP_VERSION, currentVersion);
    }
  }, [openModal]);

  return (
    <Modal onClose={onCloseHandler} isOpen={isOpen} fullWidth={false}>
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
