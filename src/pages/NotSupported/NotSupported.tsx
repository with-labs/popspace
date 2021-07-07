import * as React from 'react';
import { Typography, makeStyles, Button, Box, Grid } from '@material-ui/core';
import { useTranslation, Trans } from 'react-i18next';
import { CenterColumnPage } from '../../Layouts/CenterColumnPage/CenterColumnPage';
import { ExtensionCard } from '@components/ExtensionCard/ExtensionCard';
import { OpenIcon } from '@components/icons/OpenIcon';
import { Analytics } from '@analytics/Analytics';
import chrome from './images/chrome.png';
import edge from './images/edge.png';
import firefox from './images/firefox.png';

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
            We're sorry, Tilde is currently not optimized for{' '}
            {t(`pages.notSupported.${isMobile ? 'mobile' : 'browser'}`)}.
            <br />
            Please use one of the recommended browsers on your computer instead.",
          </Trans>
        </Typography>
      </Box>
      <Grid container spacing={2} style={{ width: '100%' }}>
        <Grid item xs={12} sm={12} md={4} lg={4}>
          <ExtensionCard
            iconSrc={firefox}
            iconAlt={t('pages.notSupported.firefox.iconAlt')}
            label={t('pages.notSupported.firefox.label')}
            onClick={() => {
              if (!hasInteracted) {
                setHasInteracted(true);
              }
              Analytics.trackEvent(`${ANALYTICS_PAGE_ID}_clicked_button`, 'firefox');

              window.open('https://www.mozilla.org/en-US/firefox/new/', '_blank');
            }}
            buttonStartIcon={<OpenIcon />}
            buttonText={t('pages.notSupported.learnMoreBtn')}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={4} lg={4}>
          <ExtensionCard
            iconSrc={edge}
            iconAlt={t('pages.notSupported.edge.iconAlt')}
            label={t('pages.notSupported.edge.label')}
            onClick={() => {
              if (!hasInteracted) {
                setHasInteracted(true);
              }
              Analytics.trackEvent(`${ANALYTICS_PAGE_ID}_clicked_button`, 'edge');

              window.open('https://www.microsoft.com/en-us/edge', '_blank');
            }}
            buttonStartIcon={<OpenIcon />}
            buttonText={t('pages.notSupported.learnMoreBtn')}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={4} lg={4}>
          <ExtensionCard
            iconSrc={chrome}
            iconAlt={t('pages.notSupported.chrome.iconAlt')}
            label={t('pages.notSupported.chrome.label')}
            onClick={() => {
              if (!hasInteracted) {
                setHasInteracted(true);
              }
              Analytics.trackEvent(`${ANALYTICS_PAGE_ID}_clicked_button`, 'chrome');

              window.open('https://www.google.com/chrome/index.html', '_blank');
            }}
            buttonStartIcon={<OpenIcon />}
            buttonText={t('pages.notSupported.learnMoreBtn')}
          />
        </Grid>
      </Grid>
    </CenterColumnPage>
  );
};
