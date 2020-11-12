import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectors as controlSelectors, actions as controlsActions } from '../roomControlsSlice';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { Modal } from '../../../components/Modal/Modal';
import { ModalTitleBar } from '../../../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../../../components/Modal/ModalContentWrapper';
import { APP_VERSION, USER_ONBOARDING } from '../../../constants/User';

interface IChangelogModalProps {}

const useStyles = makeStyles((theme) => ({
  content: {
    width: 580,
  },
  changelog: {
    width: '100%',
    height: 500,
    border: 'none',
  },
}));

export const ChangelogModal: React.FC<IChangelogModalProps> = (props) => {
  const dispatch = useDispatch();
  const isOpen = useSelector(controlSelectors.selectIsChangelogModalOpen);

  const { t } = useTranslation();
  const classes = useStyles();

  const onCloseHandler = () => {
    dispatch(controlsActions.setIsChangelogModalOpen({ isOpen: false }));
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
        dispatch(controlsActions.setIsChangelogModalOpen({ isOpen: true }));
      }

      // save of the current app version
      localStorage.setItem(APP_VERSION, currentVersion);
    }
  }, [dispatch]);

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
