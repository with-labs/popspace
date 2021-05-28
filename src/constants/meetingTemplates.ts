import { RoomTemplate } from '@roomState/exportRoomTemplate';
import { WidgetType } from '@roomState/types/widgets';

export enum MeetingTemplateName {
  Empty = 'Empty',
  Workshop = 'Workshop',
}

export const meetingTemplates: Record<MeetingTemplateName, RoomTemplate> = {
  [MeetingTemplateName.Empty]: {
    state: {
      displayName: 'New Meeting',
      height: 2400,
      width: 2400,
      isCustomWallpaper: true,
      wallpaperUrl: 'https://withhq.sirv.com/external/wallpaper/onboarding/onboarding_new_3500.png',
    },
    widgets: [],
  },
  [MeetingTemplateName.Workshop]: {
    state: {
      wallpaperUrl: 'https://s3-us-west-2.amazonaws.com/with.wallpapers/alexis_taylor_1612300330.jpg',
      isCustomWallpaper: false,
      width: 1000000,
      height: 1000000,
      displayName: 'Workshop',
    },
    widgets: [
      [
        WidgetType.StickyNote,
        {
          text: '# Welcome!',
        },
        {
          position: {
            x: -214.7716395255061,
            y: -323.0897824511777,
          },
          size: {
            width: 298,
            height: 196,
          },
        },
      ],
      [
        WidgetType.Whiteboard,
        {
          whiteboardState: {
            lines: [],
          },
        },
        {
          position: {
            x: 487.32626257239633,
            y: -352.9266122880075,
          },
          size: {
            width: 720,
            height: 528,
          },
        },
      ],
      [
        WidgetType.StickyNote,
        {
          text:
            "# Icebreaker\n\nForm a circle and go around clockwise -\n\n1. What's your name?\n2. If you could go on a free vacation now, where would you go?",
        },
        {
          position: {
            x: -249.60510033552947,
            y: 253.6169824635951,
          },
          size: {
            width: 364,
            height: 316,
          },
        },
      ],
    ],
  },
};
