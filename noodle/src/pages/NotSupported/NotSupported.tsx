import { Analytics } from '@analytics/Analytics';
import { BrowserInstallers } from '@components/BrowserInstallers/BrowserInstallers';
import { Box, makeStyles, Typography } from '@material-ui/core';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { CenterColumnPage } from '../../Layouts/CenterColumnPage/CenterColumnPage';

const ANALYTICS_PAGE_ID = 'page_notSupported';

export interface INotSupportedProps {
  isMobile?: boolean;
}

const useStyles = makeStyles((theme) => ({
  title: {
    textAlign: 'center',
    paddingBottom: theme.spacing(4),
  },
}));

export const NotSupported: React.FC<INotSupportedProps> = ({ isMobile }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [hasInteracted, setHasInteracted] = React.useState(false);

  React.useEffect(() => {
    Analytics.trackEvent(`${ANALYTICS_PAGE_ID}_visited`, new Date().toUTCString());
  }, []);

  React.useEffect(() => {
    function trackClosing() {
      Analytics.trackEvent(`${ANALYTICS_PAGE_ID}_closed`, hasInteracted);
    }

    window.addEventListener('beforeunload', trackClosing);

    return () => {
      window.removeEventListener('beforeunload', trackClosing);
    };
  }, [hasInteracted]);

  return (
    <CenterColumnPage>
      <Typography variant="h1" className={classes.title}>
        {t('pages.notSupported.title')}
      </Typography>
      <Box pb={4} pl={2} width="100%">
        <Typography variant="body1">
          <Trans
            i18nKey="pages.notSupported.body"
            values={{ device: t(`pages.notSupported.${isMobile ? 'mobile' : 'browser'}`) }}
          >
            We're sorry, PopSpace is currently not optimized for{' '}
            {t(`pages.notSupported.${isMobile ? 'mobile' : 'browser'}`)}.
            <br />
            Please use one of the recommended browsers on your computer instead.",
          </Trans>
        </Typography>
      </Box>
      <BrowserInstallers
        onClick={() => setHasInteracted(true)}
        style={{ width: '100%' }}
        analyticsEvent={`${ANALYTICS_PAGE_ID}_clicked_button`}
      />
    </CenterColumnPage>
  );
};
