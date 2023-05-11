// Abstraction around our analytics lib
import { getRef } from '@analytics/analyticsRef';
import client from '@api/client';
import { WidgetState } from '@api/roomState/types/widgets';
import { LOCAL_ANALYTICS_DATA } from '@constants/User';
import { logger } from '@utils/logger';

import { EventNames } from './constants';

const ENABLED = process.env.REACT_APP_ANALYTICS_ENABLED === 'true';

// Helper methods
// WIP for more complex data calculation, not needed right now
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const setLocalAnalyticsData = (eventName: string, value: any) => {
  try {
    let values: { [key: string]: any } = {};
    const stored = window.localStorage.getItem(LOCAL_ANALYTICS_DATA);
    if (stored) {
      values = JSON.parse(stored);
    }

    values[eventName] = value;

    window.localStorage.setItem(LOCAL_ANALYTICS_DATA, JSON.stringify(values));
  } catch (err) {
    logger.warn('error setLocalAnalyticsData', err);
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getLocalAnalyticsData = (eventName: string) => {
  try {
    const stored = window.localStorage.getItem(LOCAL_ANALYTICS_DATA);
    if (stored) {
      const values = JSON.parse(stored);
      return values[eventName];
    }
  } catch (err) {
    logger.warn('error getLocalAnalyticsData', err);
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const removeLocalAnalyticsData = (eventName: string) => {
  try {
    const stored = window.localStorage.getItem(LOCAL_ANALYTICS_DATA);
    if (stored) {
      const values = JSON.parse(stored);
      delete values[eventName];
      window.localStorage.setItem(LOCAL_ANALYTICS_DATA, JSON.stringify(values));
    }
  } catch (err) {
    logger.warn('error setLocalAnalyticsData', err);
  }
};

// trackEvent
// wrapper around the main track event
const trackEvent = (eventName: EventNames | string, value?: any, eventProperties?: { [key: string]: any }) => {
  if (!ENABLED) return Promise.resolve();

  const eventMetaData = {
    roomId: client.roomId,
    ref: getRef(),
    ...eventProperties,
  };

  // call the api actor event tracker endpoint
  return client.event.trackActorEvent({ key: eventName, value: value ?? '', meta: eventMetaData });
};

const trackWidgetUpdateEvent = (roomId: string | null, eventPayload: Partial<WidgetState>) => {
  if (!ENABLED) return Promise.resolve();

  if (eventPayload.hasOwnProperty('showIframe')) {
    // TODO: Figure out how to properly
    // @ts-ignore
    const linkExpandedEvent = eventPayload.showIframe ? EventNames.EXPAND_LINK_WIDGET : EventNames.COLLAPSE_LINK_WIDGET;
    trackEvent(linkExpandedEvent, null, {
      roomId: roomId,
    });
  }
};

export const Analytics = {
  trackEvent: trackEvent,
  trackWidgetUpdateEvent: trackWidgetUpdateEvent,
};
