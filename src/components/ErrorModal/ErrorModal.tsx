import React from 'react';
import { Button, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { Modal } from '../Modal/Modal';
import { ModalActions } from '../Modal/ModalActions';
import { ModalTitleBar } from '../Modal/ModalTitleBar';
import { ModalContentWrapper } from '../Modal/ModalContentWrapper';

import { BaseResponse } from '../../utils/api';

interface IErroModalProps {
  open: boolean;
  error: BaseResponse;
  onClose: () => void;
  title?: string;
}

export const ErrorModal: React.FC<IErroModalProps> = ({ open, error, onClose, title }) => {
  const { t, i18n } = useTranslation();

  return (
    <Modal isOpen={open} onClose={onClose} maxWidth="xs">
      <ModalTitleBar title={title ?? t('common.error')} />
      <ModalContentWrapper>
        <Typography variant="body1">
          {i18n.exists(`error.api.${error?.errorCode}.message`)
            ? t(`error.api.${error.errorCode}.message`)
            : error?.message}
        </Typography>
      </ModalContentWrapper>
      <ModalActions>
        <Button onClick={onClose} color="primary">
          {t('common.confirm')}
        </Button>
      </ModalActions>
    </Modal>
  );
};
