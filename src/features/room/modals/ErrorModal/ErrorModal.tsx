import React from 'react';
import { Button, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { Modal } from '../../../../components/Modal/Modal';
import { ModalActions } from '../../../../components/Modal/ModalActions';
import { ModalTitleBar } from '../../../../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../../../../components/Modal/ModalContentWrapper';

import { BaseResponse } from '../../../../utils/api';

interface IErroModalProps {
  open: boolean;
  error: BaseResponse;
  onClose: () => void;
}

export const ErrorModal: React.FC<IErroModalProps> = ({ open, error, onClose }) => {
  const { t, i18n } = useTranslation();
  return (
    <Modal isOpen={open} onClose={onClose} maxWidth="xs">
      <ModalTitleBar title={t('common.error')} />
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
