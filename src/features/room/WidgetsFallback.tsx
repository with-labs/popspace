import React, { useState } from 'react';
import { WithModal } from '../../withComponents/WithModal/WithModal';
import { useTranslation } from 'react-i18next';

export const WidgetsFallback = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useTranslation();

  return (
    <WithModal isOpen={isOpen} onCloseHandler={() => setIsOpen(false)}>
      <h1 className="u-fontH1">{t('error.widgetsFallback.title')}</h1>
      <p className="u-fontP1">{t('error.widgetsFallback.msg')}</p>
    </WithModal>
  );
};
