import React from 'react';
import { makeStyles, Button, Typography, Box } from '@material-ui/core';
import { Modal } from '@components/Modal/Modal';
import { ModalTitleBar } from '@components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '@components/Modal/ModalContentWrapper';
import { useTranslation } from 'react-i18next';
import { useRoomModalStore } from '../roomControls/useRoomModalStore';
import { ModalActions } from '@components/Modal/ModalActions';

interface IUnsavedModalProps {}

const useStyles = makeStyles((theme) => ({
  spacer: {
    marginTop: theme.spacing(2),
  },
  boldText: {
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
  },
}));

export const UnsavedModal: React.FC<IUnsavedModalProps> = (props) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const isOpen = useRoomModalStore((modals) => modals.unsavedMeeeting);
  const closeModal = useRoomModalStore((modals) => modals.api.closeModal);
  const onClose = () => closeModal('unsavedMeeeting');

  const onHandleSignInClick = () => {};

  const onHandleSignUpClick = () => {};

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth={'sm'}>
      <ModalTitleBar title={t('modals.unsaved.title')} onClose={onClose} />
      <ModalContentWrapper>
        <Box display="flex" flexDirection="column">
          <Typography variant="body1" className={classes.boldText}>
            {t('modals.unsaved.infoText')}
          </Typography>
          <Typography variant="body1">{t('modals.unsaved.explainationText')}</Typography>
        </Box>
      </ModalContentWrapper>
      <ModalActions>
        <Button onClick={onHandleSignUpClick} className={classes.spacer}>
          {t('modals.unsaved.signUpButton')}
        </Button>
        <Button variant="text" color="inherit" onClick={onHandleSignInClick} className={classes.spacer}>
          {t('modals.unsaved.signInButton')}
        </Button>
      </ModalActions>
    </Modal>
  );
};
