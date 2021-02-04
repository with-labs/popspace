import React, { useState, useEffect } from 'react';
import { Button, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { Modal } from '../Modal/Modal';
import { ModalActions } from '../Modal/ModalActions';
import { ModalTitleBar } from '../Modal/ModalTitleBar';
import { ModalContentWrapper } from '../Modal/ModalContentWrapper';

export type DialogMessage = {
  title: string;
  body: string;
};

interface IDialogModalProps {
  onClose?: () => void;
  message: DialogMessage | null;
}

export const DialogModal: React.FC<IDialogModalProps> = ({ message, onClose, children }) => {
  const { t } = useTranslation();

  // open when an error is supplied
  const [internalOpen, setInternalOpen] = useState(!!message);
  useEffect(() => setInternalOpen(!!message), [message]);

  const handleClose = () => {
    setInternalOpen(false);
    onClose?.();
  };

  return (
    <Modal isOpen={internalOpen} onClose={handleClose} maxWidth="xs">
      {!!message && <ModalTitleBar title={message.title} />}
      <ModalContentWrapper>
        {!children && !!message && message.body && <Typography variant="body1">{message.body}</Typography>}
        {children}
      </ModalContentWrapper>
      <ModalActions>
        <Button onClick={handleClose} color="primary">
          {t('common.confirm')}
        </Button>
      </ModalActions>
    </Modal>
  );
};
