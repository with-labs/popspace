import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

interface IPageTitleProps {
  title?: string | null;
}

export const PageTitle: React.FC<IPageTitleProps> = ({ title }) => {
  const { t } = useTranslation();
  // todo: expand this to handle emoji statuses
  // we are able to use emojis in title helmet if we use the
  // the js escaped version. ie: speaker with strike is \uD83D\uDD07
  return (
    <Helmet>
      <title>{title ?? t('common.appName')}</title>
    </Helmet>
  );
};
