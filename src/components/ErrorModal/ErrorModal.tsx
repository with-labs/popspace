import React, { useState, useEffect } from 'react';
import { Button, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { Modal } from '../Modal/Modal';
import { ModalActions } from '../Modal/ModalActions';
import { ModalTitleBar } from '../Modal/ModalTitleBar';
import { ModalContentWrapper } from '../Modal/ModalContentWrapper';

import { BaseResponse, ApiError } from '../../utils/api';

interface IErroModalProps {
  /** @deprecated, provide an error to open automatically */
  open?: boolean;
  error: BaseResponse | ApiError | null;
  onClose?: () => void;
  title?: string;
}

export const ErrorModal: React.FC<IErroModalProps> = ({ open, error, onClose, title }) => {
  const { t, i18n } = useTranslation();

  // open when an error is supplied
  const [internalOpen, setInternalOpen] = useState(open || !!error);
  useEffect(() => setInternalOpen(!!error), [error]);

  const handleClose = () => {
    setInternalOpen(false);
    onClose?.();
  };

  return (
    <Modal isOpen={internalOpen} onClose={handleClose} maxWidth="xs">
      <ModalTitleBar title={title ?? t('common.error')} />
      <ModalContentWrapper>
        {!!error && (
          <Typography variant="body1">
            {i18n.exists(`error.api.${error?.errorCode}.message`)
              ? t(`error.api.${error.errorCode}.message`)
              : error?.message}
          </Typography>
        )}
      </ModalContentWrapper>
      <ModalActions>
        <Button onClick={handleClose} color="primary">
          {t('common.confirm')}
        </Button>
      </ModalActions>
    </Modal>
  );
};
