import { Analytics } from '@analytics/Analytics';
import { EventNames } from '@analytics/constants';
import { useRoomStore } from '@api/useRoomStore';

export enum IncludeData {
  roomId,
}

export function useAnalytics(include?: IncludeData[], defaultData?: { [key: string]: any }) {
  const roomId = useRoomStore((store) => store.id);

  const includeData: { [key: string]: any } = {};

  include?.forEach((dataName) => {
    switch (dataName) {
      case IncludeData.roomId:
        includeData.roomId = roomId;
        break;
      default:
        break;
    }
  });

  const trackEvent = (eventName: EventNames, value?: any, eventProperties?: { [key: string]: any }) => {
    Analytics.trackEvent(eventName, value, { ...includeData, ...defaultData, ...eventProperties });
  };

  return { trackEvent };
}
