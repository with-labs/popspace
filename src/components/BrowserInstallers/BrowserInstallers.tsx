import { Analytics } from '@analytics/Analytics';
import { ExtensionCard } from '@components/ExtensionCard/ExtensionCard';
import { OpenIcon } from '@components/icons/OpenIcon';
import { Grid } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import chrome from '@images/browsers/chrome.png';
import edge from '@images/browsers/edge.png';
import firefox from '@images/browsers/firefox.png';

export function BrowserInstallers({
  analyticsEvent,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { analyticsEvent: string }) {
  const { t } = useTranslation();

  return (
    <Grid container spacing={2} {...props}>
      <Grid item xs={12} sm={12} md={4} lg={4}>
        <ExtensionCard
          iconSrc={firefox}
          iconAlt={t('pages.notSupported.firefox.iconAlt')}
          label={t('pages.notSupported.firefox.label')}
          onClick={() => {
            Analytics.trackEvent(analyticsEvent, 'firefox');

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
            Analytics.trackEvent(analyticsEvent, 'edge');

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
            Analytics.trackEvent(analyticsEvent, 'chrome');

            window.open('https://www.google.com/chrome/index.html', '_blank');
          }}
          buttonStartIcon={<OpenIcon />}
          buttonText={t('pages.notSupported.learnMoreBtn')}
        />
      </Grid>
    </Grid>
  );
}
