import React, { useState } from 'react';
import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Modal } from '@components/Modal/Modal';
import { ModalTitleBar } from '@components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '@components/Modal/ModalContentWrapper';

export const WidgetsFallback = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} maxWidth="sm">
      <ModalTitleBar title={t('error.widgetsFallback.title')} />
      <ModalContentWrapper>
        <Typography variant="body1">{t('error.widgetsFallback.msg')}</Typography>
      </ModalContentWrapper>
    </Modal>
  );
};
