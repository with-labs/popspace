// Abstraction around our analytics lib
import { EventNames } from './constants';
import { ActorShape } from '@api/roomState/types/participants';
import { WidgetState } from '@api/roomState/types/widgets';
import { LOCAL_ANALYTICS_DATA } from '@constants/User';
import { logger } from '@utils/logger';

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

// init mixpanel
const initAnalytics = () => {
  // default to the staging instance if there nothing set

  // !!!!!!!!!! Disabling anayltics, re-enable when we get a noodle project setup on mixpannel
  logger.debug('Analytics disabled');
  //const envId = process.env.REACT_APP_ANALYTICS_ID || 'd44d2fa32ab1fad61038134cdbea9620';
  //mixpanel.init(envId);
};

// trackEvent
// wrapper around the main track event
const trackEvent = (eventName: EventNames, eventProperties?: { [key: string]: any }) => {
  //mixpanel.track(eventName, eventProperties);
};

const trackUserEvent = (roomId: string | null, eventPayload: Partial<ActorShape>) => {
  // track the avatar change event
  if (eventPayload.hasOwnProperty('avatarName')) {
    trackEvent(EventNames.CHANGED_AVATAR, {
      roomId: roomId,
      avatarName: eventPayload.avatarName,
    });
  } else if (eventPayload.hasOwnProperty('displayName')) {
    // track the display name changed event
    Analytics.trackEvent(EventNames.CHANGED_DISPLAYNAME, {
      roomId: roomId,
    });
  }
};

const trackWidgetUpdateEvent = (roomId: string | null, eventPayload: Partial<WidgetState>) => {
  if (eventPayload.hasOwnProperty('showIframe')) {
    // TODO: Figure out how to properly
    // @ts-ignore
    const linkExpandedEvent = eventPayload.showIframe ? EventNames.EXPAND_LINK_WIDGET : EventNames.COLLAPSE_LINK_WIDGET;
    trackEvent(linkExpandedEvent, {
      roomId: roomId,
    });
  }
};

export const Analytics = {
  init: initAnalytics,
  trackEvent: trackEvent,
  trackUserEvent: trackUserEvent,
  trackWidgetUpdateEvent: trackWidgetUpdateEvent,
};
