import * as React from 'react';
import { ExtensionCard } from '@components/ExtensionCard/ExtensionCard';
import { isEdge, isChrome, isFirefox, isSafari } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import { SaveIcon } from '@components/icons/SaveIcon';
import { CHROME_APP_URL, FIRE_FOX_APP_URL } from './constants';

import chrome from '@images/browsers/chrome.png';
import edge from '@images/browsers/edge.png';
import firefox from '@images/browsers/firefox.png';
import safari from '@images/browsers/safari.png';
import generic from '@images/browsers/generic.png';

export interface IBrowserExtensionCardProps {
  onClick: (eventName: string) => void;
}

export const BrowserExtensionCard: React.FC<IBrowserExtensionCardProps> = ({ onClick }) => {
  const { t } = useTranslation();

  let browserInfo: {
    eventName: string;
    imgSrc: string;
    altTextKey: string;
    url: null | string;
  } = {
    eventName: 'installGenericExt',
    imgSrc: generic,
    altTextKey: 'pages.meetingLink.extensions.browser.genericIconAlt',
    url: null,
  };

  if (isChrome) {
    browserInfo = {
      eventName: 'installChromeExt',
      imgSrc: chrome,
      altTextKey: 'pages.meetingLink.extensions.browser.chomeIconAlt',
      url: CHROME_APP_URL,
    };
  } else if (isFirefox) {
    browserInfo = {
      eventName: 'installFireFoxExt',
      imgSrc: firefox,
      altTextKey: 'pages.meetingLink.extensions.browser.fireFoxIconAlt',
      url: FIRE_FOX_APP_URL,
    };
  } else if (isEdge) {
    browserInfo = {
      eventName: 'installEdgeExt',
      imgSrc: edge,
      altTextKey: 'pages.meetingLink.extensions.browser.edgeIconAlt',
      url: null,
    };
  } else if (isSafari) {
    browserInfo = {
      eventName: 'installSafariExt',
      imgSrc: safari,
      altTextKey: 'pages.meetingLink.extensions.browser.safariIconAlt',
      url: null,
    };
  }

  return (
    <ExtensionCard
      iconSrc={browserInfo.imgSrc}
      iconAlt={t(browserInfo.altTextKey)}
      label={t('pages.meetingLink.extensions.browser.label')}
      onClick={() => {
        if (browserInfo.url) {
          onClick(browserInfo.eventName);
          window.open(browserInfo.url, '_blank');
        }
      }}
      buttonText={t(browserInfo.url ? 'common.install' : 'common.comingSoon')}
      buttonStartIcon={browserInfo.url ? <SaveIcon /> : null}
      disabled={browserInfo.url === null}
    />
  );
};
